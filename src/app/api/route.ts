import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
    DynamoDBDocumentClient, 
    PutCommand, 
    GetCommand,
    UpdateCommand
} from "@aws-sdk/lib-dynamodb";

// 创建 DynamoDB 客户端
const client = new DynamoDBClient({
  region: process.env.AWS_REGION, // your-region 例如 "us-east-1"
  credentials: {
    accessKeyId: process.env.AWS_USER_ACCESS_KEY_ID || '', // your-access-key-id
    secretAccessKey: process.env.AWS_USER_ACCESS_KEY_SECRET || '', // your-secret-access-key
  }
});

// 创建文档客户端
const docClient = DynamoDBDocumentClient.from(client);

// 写入分数
async function writeScore(player: string, score: number): Promise<void> {
  try {
    const oldScore = await readScore(player)
    const command = new PutCommand({
      TableName: "BlackJack",
      Item: { player, score: oldScore + score }
    });

    await docClient.send(command);
    console.log(`Successfully wrote score for player ${player}`);
  } catch (error) {
    console.error("Error writing score:", error);
    throw error;
  }
}

// 读取分数
async function readScore(player: string): Promise<number> {
  try {
    const command = new GetCommand({
        TableName: "BlackJack",
        Key: { player }
    });

    const response = await docClient.send(command);
    return response.Item?.score ?? 0;
  } catch (error) {
    console.error("Error reading score:", error);
    throw error;
  }
}

export interface Card {
  rank: string,
  suit: string,
}

const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const suits = ['♠️', '♥️', '♦️', '♣️']
const initialCards = ranks.map(rank => suits.map(suit => ({ rank, suit }))).flat()

// 游戏状态初始化值
const gameState: {
  playerHand: Card[], // 玩家手牌
  dealerHand: Card[], // 庄家手牌
  cards: Card[], // 全部手牌 52张牌
  message: string, // 提示信息
  score: number, // 得分
} = {
  playerHand: [],
  dealerHand: [],
  cards: initialCards,
  message: '',
  score: 0,
}

// 玩家地址
const PLAYER_ADDRESS = 'player'

// 叫牌抽卡的公用方法
function getRandomCards(cards: Card[], count: number) {
  const randomIndexSet = new Set<number>()
  while (randomIndexSet.size < count) {
    randomIndexSet.add(Math.floor(Math.random() * cards.length))
  }
  // 抽取的卡牌
  const randomCards = cards.filter((_, index) => randomIndexSet.has(index))
  // 抽取后剩余的卡牌
  const remainingCards = cards.filter((_, index) => !randomIndexSet.has(index))
  return [randomCards, remainingCards]
}
// 计算卡牌总点数的公用方法
function calculateCardsTotal(cards: Card[]) {
  let total = 0
  let aceCount = 0
  cards.forEach(card => {
    if (card.rank === 'A') {
      total += 11
      aceCount++
    } else if (['J', 'Q', 'K'].includes(card.rank)) {
      total += 10
    } else {
      total += Number(card.rank)
    }
    while(total > 21 && aceCount > 0) {
      total -= 10
      aceCount--
    }
  })
  return total
}
// 发送给前端数据的公用方法
async function sendSuccessDataToFront() {
  try {
    // 读取分数
    const score = await readScore(PLAYER_ADDRESS)
    return new Response(JSON.stringify(
      {
        playerHand: gameState.playerHand,
        // 游戏未结束时，玩家只能看到庄家的第一张牌
        dealerHand: !gameState.message ? [gameState.dealerHand[0], { rank: '?', suit: '?'} as Card] : gameState.dealerHand,
        message: gameState.message,
        score,
      }
    ), {
      status: 200,
    })
  } catch (error) {
    console.error("写入分数出错:", error)
    return sendErrorDataToFront('write score error.', 500)
  }
}
// 发送给前端错误信息的公用方法
function sendErrorDataToFront(message: string, status: number) {
  return new Response(JSON.stringify({ message }), { status })
}

// 初始化获取卡牌
export async function GET() {
  // 重置游戏状态
  gameState.playerHand = []
  gameState.dealerHand = []
  gameState.cards = initialCards
  gameState.message = ''

  // 初始化逻辑：
  // 1、玩家随机获取两张牌
  // 2、庄家随机获取两张牌
  const [playerCards, remainingCards] = getRandomCards(gameState.cards, 2)
  const [dealerCards, newCards] = getRandomCards(remainingCards, 2)
  gameState.playerHand = playerCards
  gameState.dealerHand = dealerCards
  gameState.cards = newCards

  try {
    // 读取分数
    const score = await readScore(PLAYER_ADDRESS)
    console.log("当前分数:", score)
    // 特殊处理，初始化获取的两张牌，可能为21点
    const playerCardsTotal = calculateCardsTotal(gameState.playerHand)
    const dealerCardsTotal = calculateCardsTotal(gameState.dealerHand)
    if (playerCardsTotal === 21 && dealerCardsTotal === 21) {
      gameState.message = 'draw'
    } else if (playerCardsTotal === 21) {
      await writeScore(PLAYER_ADDRESS, 100);
      gameState.message = "Player win, Black jack"
    } else if (dealerCardsTotal === 21) {
      await writeScore(PLAYER_ADDRESS, -100);
      gameState.message = "Player lose, Dealer black jack"
    }
    return sendSuccessDataToFront()
  } catch (error) {
    console.error("读取分数出错:", error)
    return sendErrorDataToFront('read score error.', 500)
  }
}

// 叫牌/停牌
export async function POST(request: Request) {
  const { action } = await request.json()
  if (action === 'hit') {
    console.log('进入叫牌逻辑')
    // 玩家操作逻辑：
    // 1、点击叫牌按钮，随机获取一张卡牌到玩家手牌中
    // 2、判断玩家手牌总点数
    // 2-1、如果玩家手牌大于21，提示信息：玩家失败，爆牌
    // 2-2、如果玩家手牌等于21，提示信息：玩家胜利，21点
    // 2-2、如果玩家手牌小于21，玩家可以继续叫牌或者停牌
    const [randomCards, remainingCards] = getRandomCards(gameState.cards, 1)
    gameState.playerHand.push(...randomCards)
    gameState.cards = remainingCards
    const playerCardsTotal = calculateCardsTotal(gameState.playerHand)
    if (playerCardsTotal > 21) {
      await writeScore(PLAYER_ADDRESS, -100);
      gameState.message = "Player lose, Bust"
    } else if (playerCardsTotal === 21) {
      await writeScore(PLAYER_ADDRESS, 100);
      gameState.message = "Player win, Black jack"
    }
  } else if (action === 'stand') {
    console.log('进入停牌逻辑')
    // 庄家操作逻辑：
    // 1、玩家点击停牌时，随机获取一张卡牌到庄家手牌中
    // 2、持续获取卡牌到庄家手牌，庄家手牌总点数为17或者大于17时停止
    // 3、如果庄家手牌大于21，玩家胜利，提示信息：庄家爆牌
    // 4、如果庄家手牌等于21，玩家失败，提示信息：庄家21点
    // 5、如果庄家手牌小于21
    // 5-1、如果庄家手牌总点数大于玩家手牌，玩家失败，提示信息：玩家失败
    // 5-2、如果庄家手牌总点数小于玩家手牌，玩家胜利，提示信息：玩家胜利
    // 5-3、如果庄家手牌总点数等于玩家手牌，平牌，提示信息：平牌
    while(calculateCardsTotal(gameState.dealerHand) < 17) {
      const [randomCards, remainingCards] = getRandomCards(gameState.cards, 1)
      gameState.dealerHand.push(...randomCards)
      gameState.cards = remainingCards
    }
    const dealerCardsTotal = calculateCardsTotal(gameState.dealerHand)
    if (dealerCardsTotal > 21) {
      await writeScore(PLAYER_ADDRESS, 100)
      gameState.message = "Player win, Dealer bust"
    } else if (dealerCardsTotal === 21) {
      await writeScore(PLAYER_ADDRESS, -100)
      gameState.message = "Player lose, Dealer black jack"
    } else {
      const playerCardsTotal = calculateCardsTotal(gameState.playerHand)
      if (dealerCardsTotal > playerCardsTotal) {
        await writeScore(PLAYER_ADDRESS, -100)
        gameState.message = "Player lose"
      } else if (dealerCardsTotal < playerCardsTotal) {
        await writeScore(PLAYER_ADDRESS, 100)
        gameState.message = "Player win"
      } else {
        gameState.message = "draw"
      }
    }
  } else {
    return sendErrorDataToFront('Invalid action.', 400)
  }
  return sendSuccessDataToFront()
}
