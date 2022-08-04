import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

const CellContainer = styled.div`
  background-color: ${({ color, j }) => color};
  ${({ runningOpen }) =>
    runningOpen &&
    `
      max-height: 0rem;
      padding-top: 0rem;
      padding-bottom: 0rem;
  `}
`

const Cell = ({ value, j }) => {
  const [currColor, setCurrColor] = useState('#818384') // TODO: put proper color
  const [runningOpen, setRunningOpen] = useState(false)
  const idRef = useRef()
  useEffect(() => {
    const timeOutId = idRef.current
    return () => clearTimeout(timeOutId)
  }, [])

  useEffect(() => {
    if (value && value.color !== currColor) {
      setRunningOpen(true)
    }
  }, [value?.color])

  const handleTransitionEnd = () => {
    const id = setTimeout(() => {
      setCurrColor(() => {
        setRunningOpen(false)
        return value?.color
      })
    }, 400)
    // TODO: look into it, and make sure we are getting rid of the timeout  variable
    idRef.current = id
  }

  return (
    <div className="word-grid__cell-wrapper">
      <CellContainer
        runningOpen={runningOpen}
        style={{ transitionDelay: `${j * 0.1}s` }}
        onTransitionEnd={() => handleTransitionEnd()}
        color={currColor || '#818384'}
        className="word-grid__cell"
      >
        {value && value.letter}
      </CellContainer>
    </div>
  )
}

export default Cell
