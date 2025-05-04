import React, { useState, useRef, useEffect } from 'react'
import './App.css'
import dartmouthMap from './assets/dartmouth-map.png'

const DINING_HALLS = [
  { name: "Foco (Class of 1953 Commons)", x: 60, y: 40 },
  { name: "Collis Café", x: 50, y: 55 },
  { name: "Courtyard Café", x: 70, y: 60 },
  { name: "The Hop", x: 45, y: 35 },
  { name: "Novack Café", x: 55, y: 25 }
]

// Simulated "fetched" data
const INITIAL_WAIT_TIMES = [
  { minutes: 12, lastUpdated: "2 min ago" },
  { minutes: 5, lastUpdated: "Just now" },
  { minutes: 8, lastUpdated: "1 min ago" },
  { minutes: 0, lastUpdated: "5 min ago" },
  { minutes: 3, lastUpdated: "Just now" }
]

function App() {
  // Store wait times and last updated for each dining hall
  const [waitTimes, setWaitTimes] = useState(INITIAL_WAIT_TIMES)
  const [inputs, setInputs] = useState(DINING_HALLS.map(() => ""))
  const [pinPositions, setPinPositions] = useState(DINING_HALLS.map(h => ({ x: h.x, y: h.y })))
  const [dragging, setDragging] = useState(null)
  const mapRef = useRef(null)

  // Handle input change
  const handleInputChange = (index, value) => {
    const newInputs = [...inputs]
    newInputs[index] = value
    setInputs(newInputs)
  }

  // Handle wait time submission (average with current)
  const handleSubmit = (index) => {
    const inputValue = parseInt(inputs[index])
    if (isNaN(inputValue)) return

    const current = waitTimes[index].minutes
    // Average the current and new value, rounded to nearest integer
    const newWait = Math.round((current + inputValue) / 2)

    const newWaitTimes = [...waitTimes]
    newWaitTimes[index] = {
      minutes: newWait,
      lastUpdated: "Just now"
    }
    setWaitTimes(newWaitTimes)
    handleInputChange(index, "")
  }

  // Drag logic
  const handleMouseDown = (idx, e) => {
    setDragging({ idx })
  }

  const handleMouseMove = (e) => {
    if (dragging === null) return
    const mapRect = mapRef.current.getBoundingClientRect()
    const x = ((e.clientX - mapRect.left) / mapRect.width) * 100
    const y = ((e.clientY - mapRect.top) / mapRect.height) * 100
    setPinPositions(positions =>
      positions.map((pos, i) =>
        i === dragging.idx ? { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : pos
      )
    )
  }

  const handleMouseUp = () => {
    if (dragging !== null) {
      // Log the new position for updating your code
      const { idx } = dragging
      const pos = pinPositions[idx]
      // eslint-disable-next-line no-console
      console.log(`New position for ${DINING_HALLS[idx].name}: x: ${pos.x.toFixed(1)}, y: ${pos.y.toFixed(1)}`)
    }
    setDragging(null)
  }

  // Attach mousemove and mouseup to the window for smooth dragging
  useEffect(() => {
    if (dragging !== null) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [dragging])

  const getPinColor = (minutes) => {
    if (minutes <= 5) return "#009900";      // Dartmouth green
    if (minutes <= 10) return "#FFD600";     // Yellow
    return "#D7263D";                        // Red
  }

  return (
    <div className="App">
      <h1>Dartmouth Dining Hall Queue Times</h1>
      <div className="map-container" ref={mapRef}>
        <img src={dartmouthMap} alt="Dartmouth Campus Map" className="campus-map" />
        {pinPositions.map((pos, idx) => (
          <div
            key={DINING_HALLS[idx].name}
            className="map-pin"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              cursor: "grab"
            }}
            title={DINING_HALLS[idx].name}
            onMouseDown={e => handleMouseDown(idx, e)}
          >
            <span role="img" aria-label="pin">📍</span>
          </div>
        ))}
      </div>
      <ul>
        {DINING_HALLS.map((hall, idx) => (
          <li key={hall.name}>
            <strong>{hall.name}</strong>
            <div>
              <span>
                Current Wait Time:{" "}
                <b>{waitTimes[idx].minutes} min</b>
                <span style={{ color: "#888", marginLeft: "1em", fontSize: "0.9em" }}>
                  (Last updated: {waitTimes[idx].lastUpdated})
                </span>
              </span>
            </div>
            <input
              type="number"
              min="0"
              placeholder="Enter wait time (min)"
              value={inputs[idx]}
              onChange={e => handleInputChange(idx, e.target.value)}
            />
            <button onClick={() => handleSubmit(idx)}>
              Submit Wait Time
            </button>
          </li>
        ))}
      </ul>
      <p style={{ color: "#888" }}>
        MVP Demo: Anyone can update the wait time for each dining hall.
      </p>
    </div>
  )
}

export default App
