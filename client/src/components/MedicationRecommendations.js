import React from 'react';
import { motion } from 'framer-motion';
import { Pill, AlertCircle } from 'lucide-react';
import './MedicationRecommendations.css';

const MedicationRecommendations = ({ analysis }) => {
  if (!analysis) return null;

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

