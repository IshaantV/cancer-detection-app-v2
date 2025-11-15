import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, AlertCircle, Plus, Check } from 'lucide-react';
import api from '../utils/api';
import '../styles/pixelated.css';
import './MedicationRecommendations.css';

const MedicationRecommendations = ({ analysis, userId, onMedicationAdded }) => {
  const [addedMedications, setAddedMedications] = useState([]);
  const [adding, setAdding] = useState({});

  if (!analysis) return null;

  const handleAddToSchedule = async (medication, index) => {
    if (adding[index] || addedMedications.includes(index)) return;

    setAdding({ ...adding, [index]: true });

    try {
      // Parse dosage to extract frequency
      const dosage = medication.dosage.toLowerCase();
      let frequency = 'daily';
      let times = ['09:00'];

      if (dosage.includes('twice') || dosage.includes('2 times')) {
        frequency = 'twice';
        times = ['09:00', '21:00'];
      } else if (dosage.includes('three') || dosage.includes('3 times')) {
        frequency = 'three';
        times = ['09:00', '14:00', '21:00'];
      }

      // Parse duration to extract days
      const durationMatch = medication.duration.match(/(\d+)/);
      const duration = durationMatch ? parseInt(durationMatch[1]) : 7;

      const medicationData = {
        name: medication.name,
        dosage: medication.dosage,
        frequency,
        times,
        startDate: new Date().toISOString().split('T')[0],
        duration
      };

      const response = await api.addMedication(userId, medicationData);

      if (response && response.success) {
        setAddedMedications([...addedMedications, index]);
        if (onMedicationAdded) {
          onMedicationAdded(response.medication);
        }
      }
    } catch (error) {
      console.error('Error adding medication:', error);
      const errorMessage = error.message || 'Failed to add medication. Please try again.';
      alert(errorMessage);
    } finally {
      setAdding({ ...adding, [index]: false });
    }
  };

  const getMedications = () => {
    const medications = [];
    
    // Cancer-related medications
    if (analysis.cancer && analysis.cancer.cancerPercentage >= 20) {
      medications.push({
        name: 'Topical Imiquimod',
        condition: 'High-risk skin lesions',
        dosage: 'Apply 3 times per week',
        duration: '8-16 weeks',
        type: 'prescription',
        urgent: true,
        description: 'Immune response modifier for treating certain types of skin cancer'
      });
    }

    if (analysis.cancer && analysis.cancer.cancerPercentage >= 15) {
      medications.push({
        name: 'Sunscreen SPF 30+',
        condition: 'Sun Protection',
        dosage: 'Apply daily, reapply every 2 hours',
        duration: 'Ongoing',
        type: 'otc',
        urgent: false,
        description: 'Broad-spectrum sunscreen to prevent further damage'
      });
    }

    // Infection-related medications
    if (analysis.infection && analysis.infection.hasInfection) {
      const condition = analysis.infection.primaryCondition;
      
      if (condition.includes('Bacterial')) {
        medications.push({
          name: 'Topical Antibiotic (Mupirocin)',
          condition: 'Bacterial Infection',
          dosage: 'Apply 2-3 times daily',
          duration: '7-10 days',
          type: 'prescription',
          urgent: false,
          description: 'Antibiotic ointment for bacterial skin infections'
        });
      } else if (condition.includes('Fungal')) {
        medications.push({
          name: 'Antifungal Cream (Clotrimazole)',
          condition: 'Fungal Infection',
          dosage: 'Apply twice daily',
          duration: '2-4 weeks',
          type: 'prescription',
          urgent: false,
          description: 'Antifungal medication for fungal skin infections'
        });
      } else if (condition.includes('Eczema')) {
        medications.push({
          name: 'Topical Corticosteroid',
          condition: 'Eczema',
          dosage: 'Apply once daily',
          duration: 'As needed',
          type: 'prescription',
          urgent: false,
          description: 'Anti-inflammatory cream for eczema flare-ups'
        });
        medications.push({
          name: 'Moisturizer',
          condition: 'Eczema',
          dosage: 'Apply 2-3 times daily',
          duration: 'Ongoing',
          type: 'otc',
          urgent: false,
          description: 'Fragrance-free moisturizer to maintain skin barrier'
        });
      } else if (condition.includes('Psoriasis')) {
        medications.push({
          name: 'Topical Corticosteroid',
          condition: 'Psoriasis',
          dosage: 'Apply once daily',
          duration: 'As needed',
          type: 'prescription',
          urgent: false,
          description: 'Anti-inflammatory treatment for psoriasis'
        });
        medications.push({
          name: 'Coal Tar Shampoo',
          condition: 'Psoriasis',
          dosage: 'Use 2-3 times per week',
          duration: 'Ongoing',
          type: 'otc',
          urgent: false,
          description: 'Over-the-counter treatment for scalp psoriasis'
        });
      }
    }

    return medications;
  };

  const medications = getMedications();

  if (medications.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="medication-recommendations"
    >
      <h4>
        <Pill size={20} />
        Recommended Medications
      </h4>
      <div className="medications-list">
        {medications.map((med, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`medication-card ${med.urgent ? 'urgent' : ''}`}
          >
            <div className="medication-header">
              <h5>{med.name}</h5>
              <span className={`med-type ${med.type}`}>
                {med.type === 'prescription' ? 'Rx' : 'OTC'}
              </span>
            </div>
            <div className="medication-details">
              <p><strong>For:</strong> {med.condition}</p>
              <p><strong>Dosage:</strong> {med.dosage}</p>
              <p><strong>Duration:</strong> {med.duration}</p>
              {med.description && (
                <p className="med-description">{med.description}</p>
              )}
            </div>
            {med.urgent && (
              <div className="urgent-badge">
                <AlertCircle size={16} />
                Consult doctor before use
              </div>
            )}
            {userId && (
              <motion.button
                onClick={() => handleAddToSchedule(med, idx)}
                disabled={adding[idx] || addedMedications.includes(idx)}
                className={`add-to-schedule-button pixel-button ${addedMedications.includes(idx) ? 'added' : ''}`}
                whileHover={!addedMedications.includes(idx) ? { scale: 1.05 } : {}}
                whileTap={!addedMedications.includes(idx) ? { scale: 0.95 } : {}}
              >
                {addedMedications.includes(idx) ? (
                  <>
                    <Check size={16} />
                    Added to Schedule
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Add to Schedule
                  </>
                )}
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>
      <p className="medication-disclaimer">
        ⚠️ These are general recommendations. Always consult with a healthcare professional before starting any medication.
      </p>
    </motion.div>
  );
};

export default MedicationRecommendations;

