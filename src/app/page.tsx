'use client'
import { useEffect, useState } from "react";

export default function App() {
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  const suits = ['♠️', '♥️', '♦️', '♣️']
  const initDeck = ranks.map(rank => suits.map(suit => ({ rank, suit }))).flat()

  const [ deck, setDeck ] = useState<{ rank: string, suit: string }[]>([])
  const [winner, setWinner] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    setDeck(initDeck)
    setWinner('player1')
    setMessage('Black Jack')
  }, [])

  return (
    <div className="flex flex-col gap-2 items-center justify-center h-screen bg-gray-300">
      <h1 className="text-3xl blod">Web3 Black Jack</h1>
      <h2 
        className={`text-2xl blod ${winner === 'player' ? 'bg-green-300' : 'bg-blue-300'}`}
      >{ message }</h2>

      <div className="mt-4">
        <h2>Dealer's hand</h2>
        <div className="flex flex-row gap-2">
          {
            deck.slice(0, 4).map((card, index) => (
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
            deck.slice(0, 4).map((card, index) => (
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
        <button className="bg-blue-300 rounded-md p-2">Hit</button>
        <button className="bg-blue-300 rounded-md p-2">Stand</button>
        <button className="bg-blue-300 rounded-md p-2">Reset</button>
      </div>
    </div>
  )
}
