# 项目介绍
这是一个使用了Next.js和wagmi创建的Black Jack项目。

# 项目功能
## 前端部分
- 使用 Nextjs，Wagmi，TailwindCSS，Rainbow Kit， 快速创建项目
- 玩家连接钱包后需要进行签名确认，确认后才可以开始玩游戏
- 游戏规则为经典的Black Jack游戏规则，手牌更接近于21点则胜利
- 玩家每赢一把加100分，每输一把减100分，平局不得分
- 玩家分数达到1000分时，点击获取NFT可以获取一枚NFT

## 后端部分
- 使用 AWS DynamoDB, IAM账户设置
- 处理玩家叫牌、停牌、获取游戏得分的逻辑

## 区块链端部分
- 使用 OpenZeppelin ERC721合约
- hardhat 框架快速创建项目
- 智能合约部署在 Polkadot AssetHub Westend 测试链上
- 当玩家获取NFT时进行NFT的铸造

## 项目启动
- git clone https://github.com/shiyirmb/web3-blackjack.git
- pnpm install
- pnpm run dev
