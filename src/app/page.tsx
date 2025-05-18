'use client'
import { useEffect, useState } from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage, useAccountEffect, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { BLACKJACK_NFT_ADDRESS, BLACKJACK_NFT_ABI } from '../config/contracts';
import { NFTDisplay } from '../components/NFTDisplay';

export default function App() {
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('')
  const [playerHand, setPlayerHand] = useState<{ rank: string, suit: string }[]>([])
  const [dealerHand, setDealerHand] = useState<{ rank: string, suit: string }[]>([])
  const { address, isConnected } = useAccount()
  const [isSigned, setIsSigned] = useState(false)
  const { signMessageAsync } = useSignMessage()
  const [isMinting, setIsMinting] = useState(false)
  const [mintHash, setMintHash] = useState<`0x${string}` | undefined>()
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null)

  const { writeContract, data: writeData, isPending, isSuccess, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  const { data: currentTokenId } = useReadContract({
    abi: BLACKJACK_NFT_ABI,
    address: BLACKJACK_NFT_ADDRESS,
    functionName: 'currentTokenId',
  });

  useAccountEffect({
    onConnect(data) {
      console.log('连接成功', isConnected, isSigned)
    },
    onDisconnect() {
      console.log('断开连接!', isConnected, isSigned)
      setIsSigned(false)
      sessionStorage.setItem('jwt', '')
    },
  })
  
  useEffect(() => {
    if (isConfirmed && writeData) {
      setIsMinting(false);
      setMintHash(writeData);
      setMessage('恭喜获得NFT！');
      if (currentTokenId) {
        setMintedTokenId(Number(currentTokenId));
      }
    }
  }, [isConfirmed, writeData, currentTokenId]);

  // 点击叫牌按钮
  async function handleHit() {
    const response = await fetch('/api', {
      method: 'POST',
      headers: {
        bearer: `Bearer ${sessionStorage.getItem('jwt') || ''}`
      },
      body: JSON.stringify({ action: 'hit', address }),
    })
    if (response.status === 401) {
      setIsSigned(false)
      sessionStorage.setItem('jwt', '')
      return
    }
    if (response.status != 200) return
    const { playerHand, message, score } = await response.json()
    console.log('叫牌===>', playerHand)
    setPlayerHand(playerHand)
    setMessage(message)
    setScore(score)
  }
  // 点击停牌按钮
  async function handleStand() {
    const response = await fetch('/api', {
      method: 'POST',
      headers: {
        bearer: `Bearer ${sessionStorage.getItem('jwt') || ''}`
      },
      body: JSON.stringify({ action: 'stand', address }),
    })
    if (response.status === 401) {
      setIsSigned(false)
      sessionStorage.setItem('jwt', '')
      return
    }
    if (response.status != 200) return
    const { dealerHand, message, score } = await response.json()
    console.log('停牌===>', dealerHand)
    setDealerHand(dealerHand)
    setMessage(message)
    setScore(score)
  }
  // 点击重置按钮
  async function initGame() {
    const response = await fetch(`/api?address=${address}`, { method: 'GET' })
    if (response.status != 200) return
    const { playerHand, dealerHand, message, score } = await response.json()
    setPlayerHand(playerHand)
    setDealerHand(dealerHand)
    setMessage(message)
    setScore(score)
  }
  // 签名函数
  async function handleSign() {
    const message = `Welcome to the game black jack at ${new Date().toString()}`
    // 获取签名
    const signature = await signMessageAsync({ message })
    const params = {
      action: 'auth',
      address,
      message,
      signature,
    }
    // 调用后端接口校验签名
    const response = await fetch('/api', {
      method: 'POST',
      body: JSON.stringify(params),
    })
    if (response.status === 200) {
      const { jsonwebtoken } = await response.json()
      sessionStorage.setItem('jwt', jsonwebtoken)
      setIsSigned(true)
      initGame()
    }
  }
  // 获取NFT
  async function getNFT() {
    if (!address) {
      setMessage('请先连接钱包');
      return;
    }
    try {
      setIsMinting(true);
      await writeContract({
        abi: BLACKJACK_NFT_ABI,
        address: BLACKJACK_NFT_ADDRESS,
        functionName: 'mint',
        args: [address],
      });
    } catch (error) {
      console.error('Mint error:', error);
      setMessage('铸造NFT失败，请重试');
      setIsMinting(false);
    }
  }

  if (!isSigned) {
    return <div className="flex flex-col gap-2 items-center justify-center h-screen bg-gray-300">
      <ConnectButton/>
      { 
        isConnected ? 
        <button 
          onClick={handleSign} 
          className="border-black bg-amber-300 p-2 rounded"
        >Sign with your wallet</button> :
        ''
      }
    </div>
  } else {
    return (
      <div className="flex flex-col gap-2 items-center justify-center h-screen bg-gray-300">
        <ConnectButton/>
        <h1 className="text-3xl blod">Web3 Black Jack</h1>
        <h2 
          className={`text-2xl blod ${message.includes('win') ? 'bg-green-300' : 'bg-blue-300'}`}
        >Score: {score} { message }</h2>
        {
          score > 1000 ? 
          <div className="flex flex-col items-center gap-2">
            <button 
              className={`rounded-md p-2 px-4 transition-all duration-200 ${
                isMinting || isConfirming 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              onClick={getNFT}
              disabled={isMinting || isConfirming}
            >
              {isMinting || isConfirming ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isMinting ? '提交交易中...' : '等待确认...'}
                </div>
              ) : (
                '获取NFT'
              )}
            </button>
            {mintHash && (
              <a 
                href={`https://sepolia.etherscan.io/tx/${mintHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                在区块浏览器中查看
              </a>
            )}
          </div>
          : ''
        }
        {mintedTokenId && <NFTDisplay tokenId={mintedTokenId} />}

        <div className="mt-4">
          <h2>Dealer's hand</h2>
          <div className="flex flex-row gap-2">
            {
              (dealerHand || []).map((card, index) => (
                <div key={index} className="w-32 h-42 border-1 border-black bg-white rounded-md flex flex-col justify-between">
                  <div className="self-start p-2 text-lg">{card.rank}</div>
                  <div className="self-center p-2 text-3xl">{card.suit}</div>
                  <div className="self-end p-2 text-lg">{card.rank}</div>
                </div>
              ))
            }
          </div>
        </div>

        <div className="mt-4">
          <h2>Player's hand</h2>
          <div className="flex flex-row gap-2">
            {
              (playerHand || []).map((card, index) => (
                <div key={index} className="w-32 h-42 border-1 border-black bg-white rounded-md flex flex-col justify-between">
                  <div className="self-start p-2 text-lg">{card.rank}</div>
                  <div className="self-center p-2 text-3xl">{card.suit}</div>
                  <div className="self-end p-2 text-lg">{card.rank}</div>
                </div>
              ))
            }
          </div>
        </div>

        <div className="flex flex-row gap-2 mt-4">
          { 
            message === '' ?
              <>
                <button className="bg-blue-300 rounded-md p-2" onClick={handleHit}>Hit</button>
                <button className="bg-blue-300 rounded-md p-2" onClick={handleStand}>Stand</button>
              </> :
              <button className="bg-blue-300 rounded-md p-2" onClick={initGame}>Reset</button>
          }
        </div>
      </div>
    )
  }
}
