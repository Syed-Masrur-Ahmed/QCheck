import React, { useState, useRef, useEffect } from 'react'
import './App.css'
import dartmouthMap from './assets/dartmouth-map.png'

const DINING_HALLS = [
  { 
    name: "Foco (Class of 1953 Commons)", 
    x: 60, 
    y: 40,
    capacity: 500,
    currentOccupancy: 350,
    averageWaitTime: 12,
    peakHours: ["11:30 AM - 1:30 PM", "5:30 PM - 7:30 PM"],
    status: "Open",
    hours: "7:00 AM - 9:00 PM"
  },
  { 
    name: "Collis Café", 
    x: 50, 
    y: 55,
    capacity: 200,
    currentOccupancy: 120,
    averageWaitTime: 5,
    peakHours: ["11:00 AM - 2:00 PM"],
    status: "Open",
    hours: "8:00 AM - 8:00 PM"
  },
  { 
    name: "Courtyard Café", 
    x: 70, 
    y: 60,
    capacity: 150,
    currentOccupancy: 90,
    averageWaitTime: 8,
    peakHours: ["12:00 PM - 2:00 PM"],
    status: "Open",
    hours: "7:30 AM - 7:00 PM"
  },
  { 
    name: "Novack Café", 
    x: 55, 
    y: 25,
    capacity: 100,
    currentOccupancy: 30,
    averageWaitTime: 3,
    peakHours: ["2:00 PM - 4:00 PM"],
    status: "Open",
    hours: "7:30 AM - 9:00 PM"
  }
]

// Simulated "fetched" data
const INITIAL_WAIT_TIMES = [
  { 
    minutes: 12, 
    lastUpdated: "2 min ago",
    occupancy: 350,
    capacity: 500,
    status: "Open",
    currentHour: "11:45 AM"
  },
  { 
    minutes: 5, 
    lastUpdated: "Just now",
    occupancy: 120,
    capacity: 200,
    status: "Open",
    currentHour: "11:45 AM"
  },
  { 
    minutes: 8, 
    lastUpdated: "1 min ago",
    occupancy: 90,
    capacity: 150,
    status: "Open",
    currentHour: "11:45 AM"
  },
  { 
    minutes: 3, 
    lastUpdated: "Just now",
    occupancy: 30,
    capacity: 100,
    status: "Open",
    currentHour: "11:45 AM"
  }
]

// Add mock analytics data
const ANALYTICS_DATA = {
  "Foco (Class of 1953 Commons)": {
    hourlyTrends: [
      { hour: "11:00", busyness: 65 },
      { hour: "12:00", busyness: 90 },
      { hour: "13:00", busyness: 85 },
      { hour: "14:00", busyness: 60 },
      { hour: "17:00", busyness: 75 },
      { hour: "18:00", busyness: 95 },
      { hour: "19:00", busyness: 80 },
    ],
    weeklyTrends: [
      { day: "Monday", busyness: 85 },
      { day: "Tuesday", busyness: 80 },
      { day: "Wednesday", busyness: 90 },
      { day: "Thursday", busyness: 85 },
      { day: "Friday", busyness: 75 },
    ],
    predictions: {
      nextHour: "Increasing",
      nextDay: "Moderate",
      peakHours: ["11:30 AM - 1:30 PM", "5:30 PM - 7:30 PM"]
    }
  },
  "Collis Café": {
    hourlyTrends: [
      { hour: "11:00", busyness: 75 },
      { hour: "12:00", busyness: 95 },
      { hour: "13:00", busyness: 85 },
      { hour: "14:00", busyness: 70 },
      { hour: "15:00", busyness: 65 },
    ],
    weeklyTrends: [
      { day: "Monday", busyness: 80 },
      { day: "Tuesday", busyness: 85 },
      { day: "Wednesday", busyness: 90 },
      { day: "Thursday", busyness: 85 },
      { day: "Friday", busyness: 70 },
    ],
    predictions: {
      nextHour: "Peak",
      nextDay: "High",
      peakHours: ["11:00 AM - 2:00 PM"]
    }
  },
  "Courtyard Café": {
    hourlyTrends: [
      { hour: "11:00", busyness: 60 },
      { hour: "12:00", busyness: 85 },
      { hour: "13:00", busyness: 80 },
      { hour: "14:00", busyness: 65 },
    ],
    weeklyTrends: [
      { day: "Monday", busyness: 75 },
      { day: "Tuesday", busyness: 80 },
      { day: "Wednesday", busyness: 85 },
      { day: "Thursday", busyness: 80 },
      { day: "Friday", busyness: 65 },
    ],
    predictions: {
      nextHour: "Moderate",
      nextDay: "Moderate",
      peakHours: ["12:00 PM - 2:00 PM"]
    }
  },
  "Novack Café": {
    hourlyTrends: [
      { hour: "14:00", busyness: 40 },
      { hour: "15:00", busyness: 45 },
      { hour: "16:00", busyness: 50 },
      { hour: "17:00", busyness: 55 },
    ],
    weeklyTrends: [
      { day: "Monday", busyness: 45 },
      { day: "Tuesday", busyness: 50 },
      { day: "Wednesday", busyness: 55 },
      { day: "Thursday", busyness: 50 },
      { day: "Friday", busyness: 40 },
    ],
    predictions: {
      nextHour: "Low",
      nextDay: "Low",
      peakHours: ["2:00 PM - 4:00 PM"]
    }
  }
}

function App() {
  const [waitTimes, setWaitTimes] = useState(INITIAL_WAIT_TIMES)
  const [inputs, setInputs] = useState(DINING_HALLS.map(() => ""))
  const [pinPositions, setPinPositions] = useState(DINING_HALLS.map(h => ({ x: h.x, y: h.y })))
  const [hoveredLocation, setHoveredLocation] = useState(null)
  const [mapTransform, setMapTransform] = useState({ scale: 1, x: 0, y: 0 })
  const [isDraggingMap, setIsDraggingMap] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [favorites, setFavorites] = useState([])
  const [showFavorites, setShowFavorites] = useState(false)
  const mapRef = useRef(null)

  // Handle input change
  const handleInputChange = (index, value) => {
    const newInputs = [...inputs]
    newInputs[index] = value
    setInputs(newInputs)
  }

  // Handle wait time submission
  const handleSubmit = (index) => {
    const inputValue = parseInt(inputs[index])
    if (isNaN(inputValue) || inputValue < 0) return

    const newWaitTimes = [...waitTimes]
    newWaitTimes[index] = {
      ...waitTimes[index],
      minutes: inputValue,
      lastUpdated: "Just now"
    }
    setWaitTimes(newWaitTimes)
    handleInputChange(index, "") // Clear the input after submission
  }

  // Hover handlers
  const handleMouseEnter = (idx) => {
    setHoveredLocation(idx)
  }

  const handleMouseLeave = () => {
    setHoveredLocation(null)
  }

  // Map drag handlers
  const handleMapMouseDown = (e) => {
    if (e.target === mapRef.current || e.target.className === 'campus-map') {
      e.preventDefault()
      setIsDraggingMap(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMapMouseMove = (e) => {
    if (isDraggingMap) {
      e.preventDefault()
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y
      setMapTransform(prev => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy
      }))
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMapMouseUp = () => {
    setIsDraggingMap(false)
  }

  // Zoom handler
  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    
    // Calculate minimum scale to fit the container
    const mapRect = mapRef.current.getBoundingClientRect()
    const minScale = Math.max(
      mapRect.width / mapRef.current.scrollWidth,
      mapRect.height / mapRef.current.scrollHeight
    )
    
    const newScale = Math.min(Math.max(mapTransform.scale * delta, minScale), 3)
    
    const x = e.clientX - mapRect.left
    const y = e.clientY - mapRect.top
    
    const newX = x - (x - mapTransform.x) * (newScale / mapTransform.scale)
    const newY = y - (y - mapTransform.y) * (newScale / mapTransform.scale)
    
    setMapTransform({
      scale: newScale,
      x: newX,
      y: newY
    })
  }

  // Attach event listeners
  useEffect(() => {
    const map = mapRef.current
    if (map) {
      map.addEventListener('wheel', handleWheel, { passive: false })
      return () => {
        map.removeEventListener('wheel', handleWheel)
      }
    }
  }, [mapTransform])

  const getPinColor = (minutes) => {
    if (minutes <= 5) return "#009900";      // Green
    if (minutes <= 10) return "#FFD600";     // Yellow
    return "#D7263D";                        // Red
  }

  const handleViewDetails = (locationName) => {
    setSelectedLocation(locationName)
    setShowAnalytics(true)
  }

  const handleCloseAnalytics = () => {
    setShowAnalytics(false)
    setSelectedLocation(null)
  }

  const getBusynessColor = (busyness) => {
    if (busyness >= 80) return "#D7263D"
    if (busyness >= 60) return "#FFD600"
    return "#009900"
  }

  // Handle favorites
  const toggleFavorite = (locationName) => {
    setFavorites(prev => {
      if (prev.includes(locationName)) {
        return prev.filter(name => name !== locationName)
      } else {
        return [...prev, locationName]
      }
    })
  }

  return (
    <div className="App">
      <div className="header">
        <h1 className="title">
          <span className="q-logo">Q</span>Check
        </h1>
        <button 
          className="favorites-button"
          onClick={() => setShowFavorites(!showFavorites)}
        >
          {showFavorites ? "Hide Favorites" : "Show Favorites"}
        </button>
      </div>

      {showFavorites && (
        <div className="favorites-panel">
          <h3>Favorite Locations</h3>
          <div className="favorites-list">
            {favorites.length === 0 ? (
              <p className="no-favorites">No favorites yet. Click the star icon on any location to add it to favorites.</p>
            ) : (
              favorites.map(locationName => {
                const locationIndex = DINING_HALLS.findIndex(hall => hall.name === locationName)
                return (
                  <div key={locationName} className="favorite-item">
                    <span>{locationName}</span>
                    <span className="wait-time">
                      {waitTimes[locationIndex].minutes} min wait
                    </span>
                    <button 
                      className="remove-favorite"
                      onClick={() => toggleFavorite(locationName)}
                    >
                      Remove
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      <div 
        className="map-container" 
        ref={mapRef}
        onMouseDown={handleMapMouseDown}
        onMouseMove={handleMapMouseMove}
        onMouseUp={handleMapMouseUp}
        onMouseLeave={handleMapMouseUp}
        onWheel={handleWheel}
      >
        <div 
          className="map-content"
          style={{
            transform: `translate(${mapTransform.x}px, ${mapTransform.y}px) scale(${mapTransform.scale})`,
            transformOrigin: '0 0'
          }}
        >
          <img src={dartmouthMap} alt="Dartmouth Campus Map" className="campus-map" />
          {pinPositions.map((pos, idx) => (
            <div
              key={DINING_HALLS[idx].name}
              className="map-pin"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                cursor: "default"
              }}
              onMouseEnter={() => handleMouseEnter(idx)}
              onMouseLeave={handleMouseLeave}
            >
              <div 
                className="status-icon"
                style={{
                  backgroundColor: getPinColor(waitTimes[idx].minutes),
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: '2px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              />
            </div>
          ))}
          {hoveredLocation !== null && (
            <div 
              className="location-popup"
              style={{
                left: `${pinPositions[hoveredLocation].x}%`,
                top: `${pinPositions[hoveredLocation].y}%`
              }}
            >
              <h3>{DINING_HALLS[hoveredLocation].name}</h3>
              <div className="popup-content">
                <div className="popup-row">
                  <span className="label">Wait Time:</span>
                  <span className="value">{waitTimes[hoveredLocation].minutes} min</span>
                </div>
                <div className="popup-row">
                  <span className="label">Occupancy:</span>
                  <span className="value">{waitTimes[hoveredLocation].occupancy}/{waitTimes[hoveredLocation].capacity}</span>
                </div>
                <div className="popup-row">
                  <span className="label">Hours:</span>
                  <span className="value">{DINING_HALLS[hoveredLocation].hours}</span>
                </div>
                <div className="popup-row">
                  <span className="label">Status:</span>
                  <span className="value">{waitTimes[hoveredLocation].status}</span>
                </div>
                <div className="popup-row">
                  <span className="label">Last Updated:</span>
                  <span className="value">{waitTimes[hoveredLocation].lastUpdated}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="menu-container">
        <ul>
          {DINING_HALLS.map((hall, idx) => (
            <li key={hall.name}>
              <div className="location-header">
                <strong>{hall.name}</strong>
                <button 
                  className={`favorite-button ${favorites.includes(hall.name) ? 'active' : ''}`}
                  onClick={() => toggleFavorite(hall.name)}
                >
                  ★
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: getPinColor(waitTimes[idx].minutes),
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}
                />
                <span>Current wait: <b>{waitTimes[idx].minutes} minutes</b></span>
              </div>
              <div>
                <span>Occupancy: <b>{Math.round(waitTimes[idx].occupancy/waitTimes[idx].capacity * 100)}%</b></span>
              </div>
              <div>
                <span>Hours: <b>{hall.hours}</b></span>
              </div>
              <div className="location-actions">
                <div>
                  <label>
                    Update wait time (minutes):
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={inputs[idx]}
                      onChange={(e) => handleInputChange(idx, e.target.value)}
                      placeholder="Enter minutes"
                    />
                  </label>
                  <button onClick={() => handleSubmit(idx)}>Update</button>
                </div>
                <button 
                  className="details-button"
                  onClick={() => handleViewDetails(hall.name)}
                >
                  View Details
                </button>
              </div>
            </li>
          ))}
        </ul>
        <p style={{ color: "#888" }}>
          MVP Demo: Anyone can update the wait time for each dining hall.
        </p>
      </div>

      {showAnalytics && selectedLocation && (
        <div className="analytics-overlay">
          <div className="analytics-modal">
            <div className="analytics-header">
              <h2>{selectedLocation}</h2>
              <button className="close-button" onClick={handleCloseAnalytics}>×</button>
            </div>
            
            <div className="analytics-content">
              <div className="analytics-section">
                <h3>Hourly Trends</h3>
                <div className="trend-chart">
                  {ANALYTICS_DATA[selectedLocation].hourlyTrends.map((trend, idx) => (
                    <div key={idx} className="trend-bar">
                      <div 
                        className="bar"
                        style={{
                          height: `${trend.busyness}%`,
                          backgroundColor: getBusynessColor(trend.busyness)
                        }}
                      />
                      <span className="bar-label">{trend.hour}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="analytics-section">
                <h3>Weekly Trends</h3>
                <div className="trend-chart">
                  {ANALYTICS_DATA[selectedLocation].weeklyTrends.map((trend, idx) => (
                    <div key={idx} className="trend-bar">
                      <div 
                        className="bar"
                        style={{
                          height: `${trend.busyness}%`,
                          backgroundColor: getBusynessColor(trend.busyness)
                        }}
                      />
                      <span className="bar-label">{trend.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="analytics-section">
                <h3>Predictions</h3>
                <div className="predictions-grid">
                  <div className="prediction-item">
                    <span className="prediction-label">Next Hour:</span>
                    <span className="prediction-value">{ANALYTICS_DATA[selectedLocation].predictions.nextHour}</span>
                  </div>
                  <div className="prediction-item">
                    <span className="prediction-label">Next Day:</span>
                    <span className="prediction-value">{ANALYTICS_DATA[selectedLocation].predictions.nextDay}</span>
                  </div>
                  <div className="prediction-item full-width">
                    <span className="prediction-label">Peak Hours:</span>
                    <span className="prediction-value">
                      {ANALYTICS_DATA[selectedLocation].predictions.peakHours.join(", ")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
