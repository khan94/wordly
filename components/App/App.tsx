import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react'
import ReactCanvasConfetti from 'react-canvas-confetti'
import { ToastContainer, toast } from 'react-toastify'

import WordGrid from '../WordGrid/WordGrid'
import Keyboard from '../Keyboard/Keyboard'
import axios from 'axios'

const grey = '#818384'
const green = '#538D4E'
const yellow = '#B59F3B'
const darkGrey = '#3A3A3C'

type Letter = {
  letter: string
  color: string
  row: number
}

const canvasStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
}

const row1 = [
  { letter: 'Q', color: grey },
  { letter: 'W', color: grey },
  { letter: 'E', color: grey },
  { letter: 'R', color: grey },
  { letter: 'T', color: grey },
  { letter: 'Y', color: grey },
  { letter: 'U', color: grey },
  { letter: 'I', color: grey },
  { letter: 'O', color: grey },
  { letter: 'P', color: grey },
]
const row2 = [
  { letter: 'A', color: grey },
  { letter: 'S', color: grey },
  { letter: 'D', color: grey },
  { letter: 'F', color: grey },
  { letter: 'G', color: grey },
  { letter: 'H', color: grey },
  { letter: 'J', color: grey },
  { letter: 'K', color: grey },
  { letter: 'L', color: grey },
]
const row3 = [
  { letter: 'ENTER', color: grey },
  { letter: 'Z', color: grey },
  { letter: 'X', color: grey },
  { letter: 'C', color: grey },
  { letter: 'V', color: grey },
  { letter: 'B', color: grey },
  { letter: 'N', color: grey },
  { letter: 'M', color: grey },
  { letter: '\u232B', color: grey },
]

const keys = [row1, row2, row3]

const App = () => {
  const refAnimationInstance = useRef(null)

  const [gameState, setGameState] = useState('P')
  // TODO: bring the logic here, we will hold the grid,
  const [currentRow, setCurrentRow] = useState(0)
  const [grid, setGrid] = useState([[], [], [], [], [], []])
  const [specialWord, setSpecialWord] = useState('')
  const [shakeRow, setShakeRow] = useState(-1)

  const [keyboard, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'changeColor':
        let tempKeys = [...state]
        let keysInRow = tempKeys[action.payload.row].map((k) => {
          if (k.color === green && action.payload.letter === yellow) return k
          if (k.letter === action.payload.letter) {
            return { ...k, color: action.payload.color }
          }
          return k
        })
        tempKeys[action.payload.row] = keysInRow
        return tempKeys
      default:
        return state
    }
  }, keys)

  useEffect(() => {
    axios
      .get('https://random-word-api.herokuapp.com/word?length=5')
      .then((res) => {
        if (res.status === 200) {
          setSpecialWord(res.data[0].toUpperCase())
        }
      })
      .catch((err) => console.error(err))
  }, [])

  const convertFromArrToString = (arr: Array<Letter>) => {
    let temp = ''
    arr.forEach((l) => {
      temp = temp.concat(l.letter)
    })
    return temp
  }

  const checkWordExistence = async (word: string) => {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    let temp = false
    await axios
      .get(url)
      .then((res) => {
        if (res.data.length) temp = true
      })
      .catch((err) => console.error('err: ', err))

    return temp
  }

  const verifyWord = async () => {
    if (specialWord === '') return
    let newRow = []
    let i = 0
    const word = convertFromArrToString(grid[currentRow])
    if (word.length < 5) {
      // TODO: show error toast
      return
    }
    // TODO: integrate an API to validate word existence
    const wordExists = await checkWordExistence(word)
    if (!wordExists) {
      // do  animation shake the row
      setShakeRow(currentRow)
      return
    }
    grid[currentRow].map((char, i) => {
      if (char.letter === specialWord.charAt(i)) {
        // set  it to green
        dispatch({ type: 'changeColor', payload: { ...char, color: green } })
        newRow.push({ letter: char.letter, color: green })
      } else if (specialWord.includes(char.letter)) {
        newRow.push({ letter: char.letter, color: yellow })
        dispatch({ type: 'changeColor', payload: { ...char, color: yellow } })
        // set it to yellow
      } else {
        newRow.push({ letter: char.letter, color: darkGrey })
        dispatch({ type: 'changeColor', payload: { ...char, color: darkGrey } })
      }
    })
    setGrid((grid) => {
      const temp = [...grid]
      temp[currentRow] = newRow
      return temp
    })
    if (word === specialWord) {
      handleWin()
      // TODO: Change view from grid and keyboard to scoreboard
      setGameState('W')
    } else if (currentRow < 5) {
      setCurrentRow((r) => r + 1)
    } else {
      // TODO: implement game over logic
      // TODO: show answer toast
      // console.log('answer: ', specialWord)
      toast(specialWord)
      setGameState('L')
      console.log('game over')
    }
    return false
  }

  const handleClick = (l: string, rowNum: number) => {
    if (l === '\u232B') {
      setGrid((grid) => {
        const temp = [...grid]
        temp[currentRow].pop()
        return temp
      })
    } else if (l === 'ENTER') verifyWord()
    else if (grid[currentRow].length === 5) return
    else
      setGrid((grid) => {
        const temp = [...grid]
        temp[currentRow].push({ letter: l, color: grey, row: rowNum })
        return temp
      })
  }

  const getKeyboardRow = (l: string) => {
    if (row1.find((r) => r.letter === l)) {
      return 0
    }
    if (row2.find((r) => r.letter === l)) {
      return 1
    }
    if (row3.find((r) => r.letter === l)) {
      return 2
    }
  }

  const handleKeyDown = (e) => {
    if (65 <= e.keyCode && e.keyCode <= 90) {
      const rowInKeyboard = getKeyboardRow(e.key.toUpperCase())
      handleClick(e.key.toUpperCase(), rowInKeyboard)
    } else if (e.key.toUpperCase() === 'ENTER') {
      const rowInKeyboard = getKeyboardRow(e.key.toUpperCase())
      handleClick('ENTER', rowInKeyboard)
    } else if (e.key.toUpperCase() === 'BACKSPACE') {
      const rowInKeyboard = getKeyboardRow(e.key.toUpperCase())
      handleClick('\u232B', rowInKeyboard)
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentRow, specialWord])

  const getInstance = useCallback((instance) => {
    refAnimationInstance.current = instance
  }, [])

  const makeShot = useCallback((particleRatio, opts) => {
    refAnimationInstance.current &&
      refAnimationInstance.current({
        ...opts,
        origin: { y: 0.7 },
        particleCount: Math.floor(200 * particleRatio),
      })
  }, [])

  const handleWin = useCallback(() => {
    makeShot(0.25, {
      spread: 26,
      startVelocity: 55,
    })

    makeShot(0.2, {
      spread: 60,
    })

    makeShot(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    })

    makeShot(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    })

    makeShot(0.1, {
      spread: 120,
      startVelocity: 45,
    })
  }, [makeShot])

  return (
    <div className="app">
      <div className="app-contents">
        <div className="header">Wordly</div>
        <WordGrid
          wordLength={5}
          numOfTries={6}
          grid={grid}
          shakeRow={shakeRow}
          setShakeRow={setShakeRow}
        />
        <Keyboard
          handleClick={(l: string, rowNum: number) => handleClick(l, rowNum)}
          keys={keyboard}
          gameState={gameState}
        />
      </div>
      <ReactCanvasConfetti
        refConfetti={getInstance}
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
        }}
      />
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  )
}

export default App
