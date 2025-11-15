import React, { useState, useEffect } from "react"
import api from '../utils/api'
import './Game.css'


export default function Game({ user }){
  const [medications, setMedications] = useState([])
  const [selectedMedication, setSelectedMedication] = useState('')
  const [frequency, setFrequency] = useState('')
  const [showImage, setShowImage] = useState(false)
  const [evoLevel, setEvoLevel] = useState(1)
  const [loading, setLoading] = useState(true)
   const [isShaking, setIsShaking] = useState(false)
  const [showSmoke, setShowSmoke] = useState(false)

  useEffect(() => {
    if (user && user.id) {
      loadMedications()
    }
  }, [user])

  const loadMedications = async () => {
    try {
      const response = await api.getMedications(user.id)
      if (response && response.medications) {
        setMedications(response.medications)
      }
    } catch (error) {
      console.error('Error loading medications:', error)
      // Use fallback medications if API fails
      setMedications([
        { id: 'fallback1', name: 'Hydrocortisone Cream' },
        { id: 'fallback2', name: 'Benzoyl Peroxide' },
        { id: 'fallback3', name: 'Salicylic Acid' },
        { id: 'fallback4', name: 'Clotrimazole Cream' },
        { id: 'fallback5', name: 'Ketoconazole Cream' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleMedicationChange = (e) => {
    setSelectedMedication(e.target.value)
  }

  const handleFrequencyChange = (e) => {
    setFrequency(e.target.value)
  }

  const handleSubmit = async () => {
    const frequencyNum = parseInt(frequency)
    if (selectedMedication && frequency && frequencyNum >= 1 && frequencyNum <= 5) {
      setShowImage(true)
      setEvoLevel(Math.max(1, Math.min(4, frequencyNum)))
      setIsShaking(true)
      setShowSmoke(true)
      setTimeout(() => setIsShaking(false), 600)
      setTimeout(() => setShowSmoke(false), 1000)
      
      // Find the selected medication and mark it as taken
      const selectedMed = medications.find(med => med.id === selectedMedication)
      if (selectedMed && user && user.id) {
        try {
          // Mark medication as taken for today
          const currentTime = new Date().toTimeString().slice(0, 5) // HH:MM format
          await api.markMedicationTaken(user.id, selectedMedication, currentTime)
          console.log(`Marked ${selectedMed.name} as taken`)
        } catch (error) {
          console.error('Error marking medication as taken:', error)
        }
      }
    } else {
      setShowImage(false)
    }
  }

  return(
    <div className="Game">
      <div className="inputs">
        {loading ? (
          <p style={{color: 'white', textAlign: 'center'}}>Loading your medications...</p>
        ) : (
          <>
            <select 
              className="gameInput"
              value={selectedMedication}
              onChange={handleMedicationChange}
              disabled={medications.length === 0}
            >
              <option value="">Select a medication</option>
              {medications.map((med) => (
                <option key={med.id} value={med.id}>
                  {med.name}
                </option>
              ))}
            </select>
            {medications.length === 0 && (
              <p style={{color: '#fbbf24', fontSize: '0.9rem', textAlign: 'center'}}>
                No medications found. Add some medications in your dashboard first!
              </p>
            )}
            <input 
              type="text" 
              className="gameInput" 
              placeholder="How many times have you taken it today?"
              value={frequency}
              onChange={handleFrequencyChange}
            />
            <button 
              className="submitButton" 
              onClick={handleSubmit}
              disabled={medications.length === 0}
            >
              Submit Medication
            </button>
          </>
        )}
      </div>

      {showImage && (
        <div className="imageContainer">
          {showSmoke && <div className="smokePuff"></div>}
          <img 
            src={`/imgs/Penguin${evoLevel}.png`} 
            alt="Medication" 
            className={`medicationImage ${isShaking ? 'shake' : ''}`}
          />
        </div>
      )}
    </div>
)

}




