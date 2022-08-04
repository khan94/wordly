import React from 'react'
import './_keyboard.scss'
import styled from 'styled-components'

const Key = styled.button`
  background-color: ${({ color }) => color};
`

const Keyboard = ({ handleClick, keys, gameState }) => {
  return (
    <div className="keyboard">
      {keys.map((row, i: number) => (
        <div key={i} className="keyboard__row">
          {i === 1 && <div className="keyboard__spacer"></div>}
          {row.map(({ letter, color }) => (
            <Key
              onKeyPress={(e) => {
                e.key === 'Enter' && e.preventDefault()
              }}
              key={letter}
              className="keyboard__key"
              disabled={gameState != 'P'}
              color={color}
              onClick={() => handleClick(letter, i)}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {letter}
            </Key>
          ))}
          {i === 1 && <div className="keyboard__spacer"></div>}
        </div>
      ))}
    </div>
  )
}

export default Keyboard
