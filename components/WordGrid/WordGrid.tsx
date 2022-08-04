import React, { useState } from 'react'
import './_wordGrid.scss'
import Cell from './Cell/Cell'
import styled from 'styled-components'

type GridProps = {
  letter: string
  color: string
}

type WordGridProps = {
  wordLength: number
  numOfTries: number
  grid: Array<Array<GridProps>>
  shakeRow: number
  setShakeRow: Function
}

const Row = styled.div`
  ${({ shake }) =>
    shake &&
    `
    animation: shake .2s  ease-in 3;
  `}
`

const WordGrid = ({
  wordLength,
  numOfTries,
  grid,
  shakeRow,
  setShakeRow,
}: WordGridProps) => {
  return (
    <div className="word-grid">
      {[...Array(numOfTries)].map((t, i) => {
        return (
          <Row
            onAnimationEnd={() => setShakeRow(-1)}
            shake={shakeRow === i}
            key={i}
            className="word-grid__row"
          >
            {[...Array(wordLength)].map((w, j) => (
              <Cell
                value={grid[i] && grid[i][j] && grid[i][j]}
                j={j}
                key={`${i}${j}`}
              />
            ))}
          </Row>
        )
      })}
    </div>
  )
}

export default WordGrid
