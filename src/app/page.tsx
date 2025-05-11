'use client'
import { useEffect, useState } from "react";

export default function App() {
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('')
  const [playerHand, setPlayerHand] = useState<{ rank: string, suit: string }[]>([])
  const [dealerHand, setDealerHand] = useState<{ rank: string, suit: string }[]>([])

  useEffect(() => {
    handleReset()
  }, [])

  // 点击叫牌按钮
  async function handleHit() {
    const response = await fetch('/api', {
      method: 'POST',
      body: JSON.stringify({ action: 'hit' }),
    })
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
      body: JSON.stringify({ action: 'stand' }),
    })
    if (response.status != 200) return
    const { dealerHand, message, score } = await response.json()
    console.log('停牌===>', dealerHand)
    setDealerHand(dealerHand)
    setMessage(message)
    setScore(score)
  }
  // 点击重置按钮
  async function handleReset() {
    const response = await fetch('/api', { method: 'GET' })
    console.log('response===>', response)
    if (response.status != 200) return
    const { playerHand, dealerHand, message, score } = await response.json()
    setPlayerHand(playerHand)
    setDealerHand(dealerHand)
    setMessage(message)
    setScore(score)
  }

  return (
    <div className="flex flex-col gap-2 items-center justify-center h-screen bg-gray-300">
      <h1 className="text-3xl blod">Web3 Black Jack</h1>
      <h2 
        className={`text-2xl blod ${message.includes('win') ? 'bg-green-300' : 'bg-blue-300'}`}
      >Score: {score} { message }</h2>

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
            <button className="bg-blue-300 rounded-md p-2" onClick={handleReset}>Reset</button>
        }
      </div>
    </div>
  )
}
