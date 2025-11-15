import React, { useState } from "react"
import './Game.css'


export default function Game(){
  const [selectedMedication, setSelectedMedication] = useState('')
  const [frequency, setFrequency] = useState('')
  const [showImage, setShowImage] = useState(false)
  const [evoLevel, setEvoLevel] = useState(1)
  const [isShaking, setIsShaking] = useState(false)
  const [showSmoke, setShowSmoke] = useState(false)

  const handleMedicationChange = (e) => {
    setSelectedMedication(e.target.value)
  }

  const handleFrequencyChange = (e) => {
    setFrequency(e.target.value)
  }

  const handleSubmit = () => {
    const frequencyNum = parseInt(frequency)
    if (selectedMedication && frequency && frequencyNum >= 1 && frequencyNum <= 5) {
      setShowImage(true)
      setEvoLevel(Math.max(1, Math.min(4, frequencyNum)))
      setIsShaking(true)
      setShowSmoke(true)
      setTimeout(() => setIsShaking(false), 600)
      setTimeout(() => setShowSmoke(false), 1000)
    } else {
      setShowImage(false)
    }
  }

  return(
    <div className="Game">
      <div className="inputs">
        <select 
          className="gameInput"
          value={selectedMedication}
          onChange={handleMedicationChange}
        >
          <option value="">Select a medication</option>
          <option value="medication1">Hydrocortisone Cream</option>
          <option value="medication2">Benzoyl Peroxide</option>
          <option value="medication3">Salicylic Acid</option>
          <option value="medication4">Clotrimazole Cream</option>
          <option value="medication5">Ketoconazole Cream</option>
        </select>
        <input 
          type="text" 
          className="gameInput" 
          placeholder="How many times have you taken it today?"
          value={frequency}
          onChange={handleFrequencyChange}
        />
        <button className="submitButton" onClick={handleSubmit}>Submit Medication</button>
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




