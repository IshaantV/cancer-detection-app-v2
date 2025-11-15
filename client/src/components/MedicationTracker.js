import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pill, Plus, Check, Clock, Calendar, X } from 'lucide-react';
import api from '../utils/api';
import './MedicationTracker.css';

const MedicationTracker = ({ user }) => {
  const [medications, setMedications] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    times: ['09:00'],
    startDate: new Date().toISOString().split('T')[0],
    duration: 7
  });

  useEffect(() => {
    if (user && user.id) {
      loadMedications();
    }
  }, [user]);

  const loadMedications = async () => {
    try {
      const response = await api.getMedications(user.id);
      if (response && response.medications) {
        setMedications(response.medications);
      }
    } catch (error) {
      console.error('Error loading medications:', error);
      // If endpoint doesn't exist yet, use empty array
      setMedications([]);
    }
  };

  const addMedication = async () => {
    if (!newMedication.name.trim() || !newMedication.dosage.trim()) {
      alert('Please fill in medication name and dosage');
      return;
    }

    try {
      const response = await api.addMedication(user.id, newMedication);
      if (response && response.success) {
        setMedications([...medications, response.medication]);
        setShowAddForm(false);
        setNewMedication({
          name: '',
          dosage: '',
          frequency: 'daily',
          times: ['09:00'],
          startDate: new Date().toISOString().split('T')[0],
          duration: 7
        });
      }
    } catch (error) {
      console.error('Error adding medication:', error);
      const errorMessage = error.message || 'Failed to add medication. Please try again.';
      alert(errorMessage);
    }
  };

  const markTaken = async (medId, time) => {
    try {
      const response = await api.markMedicationTaken(user.id, medId, time);
      if (response && response.success) {
        loadMedications();
      }
    } catch (error) {
      console.error('Error marking medication:', error);
      alert('Failed to mark medication as taken. Please try again.');
    }
  };

  const deleteMedication = async (medId) => {
    if (!window.confirm('Are you sure you want to remove this medication?')) {
      return;
    }

    try {
      const response = await api.deleteMedication(user.id, medId);
      if (response && response.success) {
        setMedications(medications.filter(m => m.id !== medId));
      }
    } catch (error) {
      console.error('Error deleting medication:', error);
      alert('Failed to delete medication. Please try again.');
    }
  };

  const updateFrequency = (frequency) => {
    let times = [];
    switch (frequency) {
      case 'daily':
        times = ['09:00'];
        break;
      case 'twice':
        times = ['09:00', '21:00'];
        break;
      case 'three':
        times = ['09:00', '14:00', '21:00'];
        break;
      default:
        times = ['09:00'];
    }
    setNewMedication({ ...newMedication, frequency, times });
  };

  const getTodaySchedule = () => {
    const today = new Date().toISOString().split('T')[0];
    return medications.filter(med => {
      const start = new Date(med.startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + (med.duration || 7));
      const todayDate = new Date(today);
      return todayDate >= start && todayDate <= end;
    });
  };

  const isTakenToday = (med, time) => {
    const today = new Date().toISOString().split('T')[0];
    return med.takenToday && med.takenToday.some(
      entry => entry.date === today && entry.time === time
    );
  };

  const todayMeds = getTodaySchedule();
  const completedToday = todayMeds.reduce((count, med) => {
    return count + med.times.filter(time => isTakenToday(med, time)).length;
  }, 0);
  const totalToday = todayMeds.reduce((count, med) => count + med.times.length, 0);

  return (
    <div className="medication-tracker">
      <div className="tracker-header">
        <div>
          <h2>
            <Pill size={24} />
            Medication Tracker
          </h2>
          {totalToday > 0 && (
            <p className="tracker-progress">
              {completedToday} of {totalToday} medications taken today
            </p>
          )}
        </div>
        <motion.button
          onClick={() => setShowAddForm(!showAddForm)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="add-med-button"
        >
          <Plus size={20} />
          Add Medication
        </motion.button>
      </div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="add-med-form"
        >
          <h3>Add New Medication</h3>
          <div className="form-row">
            <input
              type="text"
              placeholder="Medication Name"
              value={newMedication.name}
              onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
            />
            <input
              type="text"
              placeholder="Dosage (e.g., 500mg)"
              value={newMedication.dosage}
              onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
            />
          </div>
          <div className="form-row">
            <select
              value={newMedication.frequency}
              onChange={(e) => updateFrequency(e.target.value)}
            >
              <option value="daily">Once Daily</option>
              <option value="twice">Twice Daily</option>
              <option value="three">Three Times Daily</option>
            </select>
            <input
              type="date"
              value={newMedication.startDate}
              onChange={(e) => setNewMedication({...newMedication, startDate: e.target.value})}
            />
            <input
              type="number"
              placeholder="Duration (days)"
              value={newMedication.duration}
              onChange={(e) => setNewMedication({...newMedication, duration: parseInt(e.target.value) || 7})}
              min="1"
            />
          </div>
          <div className="form-actions">
            <motion.button
              onClick={addMedication}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="submit-button"
            >
              Add Medication
            </motion.button>
            <motion.button
              onClick={() => setShowAddForm(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cancel-button"
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      )}

      <div className="today-schedule">
        <h3>
          <Calendar size={20} />
          Today's Schedule
        </h3>
        {todayMeds.length === 0 ? (
          <div className="no-meds">
            <Pill size={48} color="#9ca3af" />
            <p>No medications scheduled for today</p>
            <p className="no-meds-subtitle">Add a medication to start tracking</p>
          </div>
        ) : (
          <div className="medications-list">
            {todayMeds.map(med => {
              const allTaken = med.times.every(time => isTakenToday(med, time));
              return (
                <motion.div
                  key={med.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`medication-item ${allTaken ? 'completed' : ''}`}
                >
                  <div className="med-info">
                    <div className="med-name-row">
                      <h4>{med.name}</h4>
                      <button
                        onClick={() => deleteMedication(med.id)}
                        className="delete-med-button"
                        title="Remove medication"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="med-dosage">{med.dosage}</p>
                    <p className="med-duration">
                      {new Date(med.startDate).toLocaleDateString()} - {new Date(new Date(med.startDate).getTime() + (med.duration || 7) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="med-times">
                    {med.times.map((time, idx) => {
                      const taken = isTakenToday(med, time);
                      return (
                        <motion.button
                          key={idx}
                          onClick={() => !taken && markTaken(med.id, time)}
                          disabled={taken}
                          className={`time-button ${taken ? 'taken' : ''}`}
                          whileHover={!taken ? { scale: 1.05 } : {}}
                          whileTap={!taken ? { scale: 0.95 } : {}}
                        >
                          {taken ? (
                            <>
                              <Check size={16} />
                              Taken
                            </>
                          ) : (
                            <>
                              <Clock size={16} />
                              {time}
                            </>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationTracker;

