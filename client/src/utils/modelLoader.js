/**
 * Model Loader Utility for TensorFlow.js Models
 * Handles loading, caching, and managing AI models for skin analysis
 */

import * as tf from '@tensorflow/tfjs';

class ModelLoader {
  constructor() {
    this.models = {
      cancer: null,
      infection: null
    };
    this.loading = {
      cancer: false,
      infection: false
    };
    this.modelPaths = {
      // Update these paths to point to your actual model files
      // Models should be placed in public/models/ directory
      cancer: '/models/cancer-detection/model.json',
      infection: '/models/infection-detection/model.json',
      // Alternative: Use hosted models
      // cancer: 'https://your-model-host.com/models/cancer/model.json',
      // infection: 'https://your-model-host.com/models/infection/model.json'
    };
  }

  /**
   * Preprocess image for model input
   * @param {string} imageSrc - Base64 image or image URL
   * @param {number} targetWidth - Target width (default: 224)
   * @param {number} targetHeight - Target height (default: 224)
   * @returns {tf.Tensor} Preprocessed tensor
   */
  async preprocessImage(imageSrc, targetWidth = 224, targetHeight = 224) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          // Create canvas and resize image
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          // Convert to tensor
          const tensor = tf.browser.fromPixels(canvas);
          
          // Normalize to [0, 1] range
          const normalized = tensor.div(255.0);
          
          // Reshape to [1, height, width, 3] for model input
          const batched = normalized.expandDims(0);
          
          // Clean up intermediate tensors
          tensor.dispose();
          normalized.dispose();
          
          resolve(batched);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageSrc;
    });
  }

  /**
   * Load cancer detection model
   * @param {boolean} forceReload - Force reload even if already loaded
   * @returns {Promise<tf.LayersModel>} Loaded model
   */
  async loadCancerModel(forceReload = false) {
    if (this.models.cancer && !forceReload) {
      return this.models.cancer;
    }

    if (this.loading.cancer) {
      // Wait for ongoing load
      while (this.loading.cancer) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.models.cancer;
    }

    this.loading.cancer = true;
    try {
      console.log('🔄 Loading cancer detection model...');
      
      // Try to load from local path first
      try {
        this.models.cancer = await tf.loadLayersModel(this.modelPaths.cancer);
        console.log('✅ Cancer model loaded successfully');
      } catch (localError) {
        console.warn('⚠️ Local model not found, using fallback analysis');
        // Return null to indicate model not available - will use fallback
        this.models.cancer = null;
      }
      
      return this.models.cancer;
    } catch (error) {
      console.error('❌ Error loading cancer model:', error);
      this.models.cancer = null;
      throw error;
    } finally {
      this.loading.cancer = false;
    }
  }

  /**
   * Load infection detection model
   * @param {boolean} forceReload - Force reload even if already loaded
   * @returns {Promise<tf.LayersModel>} Loaded model
   */
  async loadInfectionModel(forceReload = false) {
    if (this.models.infection && !forceReload) {
      return this.models.infection;
    }

    if (this.loading.infection) {
      // Wait for ongoing load
      while (this.loading.infection) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.models.infection;
    }

    this.loading.infection = true;
    try {
      console.log('🔄 Loading infection detection model...');
      
      // Try to load from local path first
      try {
        this.models.infection = await tf.loadLayersModel(this.modelPaths.infection);
        console.log('✅ Infection model loaded successfully');
      } catch (localError) {
        console.warn('⚠️ Local model not found, using fallback analysis');
        // Return null to indicate model not available - will use fallback
        this.models.infection = null;
      }
      
      return this.models.infection;
    } catch (error) {
      console.error('❌ Error loading infection model:', error);
      this.models.infection = null;
      throw error;
    } finally {
      this.loading.infection = false;
    }
  }

  /**
   * Load all models
   * @returns {Promise<Object>} Object containing both models
   */
  async loadAllModels() {
    const [cancerModel, infectionModel] = await Promise.all([
      this.loadCancerModel().catch(() => null),
      this.loadInfectionModel().catch(() => null)
    ]);

    return {
      cancer: cancerModel,
      infection: infectionModel
    };
  }

  /**
   * Predict cancer risk from image
   * @param {string} imageSrc - Base64 image or image URL
   * @returns {Promise<Object>} Prediction results
   */
  async predictCancer(imageSrc) {
    try {
      const model = await this.loadCancerModel();
      
      if (!model) {
        // Fallback to simulated analysis if model not available
        return this.getFallbackCancerAnalysis();
      }

      // Preprocess image
      const preprocessed = await this.preprocessImage(imageSrc);
      
      // Run prediction
      const prediction = model.predict(preprocessed);
      
      // Get prediction data
      const predictionData = await prediction.data();
      
      // Clean up tensors
      preprocessed.dispose();
      prediction.dispose();

      // Process results (adjust based on your model's output format)
      // Assuming binary classification: [benign_probability, malignant_probability]
      const benignProb = predictionData[0] || 0.5;
      const malignantProb = predictionData[1] || 0.5;
      
      const cancerPercentage = Math.round(malignantProb * 100);
      
      // Extract ABCDE patterns (if your model provides these)
      // For now, using probability-based heuristics
      const patterns = {
        asymmetry: malignantProb > 0.6,
        border: malignantProb > 0.55,
        color: malignantProb > 0.65,
        diameter: malignantProb > 0.5,
        evolving: malignantProb > 0.7
      };

      return {
        cancerPercentage: Math.max(5, Math.min(95, cancerPercentage)),
        confidence: Math.max(benignProb, malignantProb),
        patterns,
        modelUsed: true
      };
    } catch (error) {
      console.error('❌ Cancer prediction error:', error);
      // Fallback to simulated analysis
      return this.getFallbackCancerAnalysis();
    }
  }

  /**
   * Predict skin infection/condition from image
   * @param {string} imageSrc - Base64 image or image URL
   * @returns {Promise<Object>} Prediction results
   */
  async predictInfection(imageSrc) {
    try {
      const model = await this.loadInfectionModel();
      
      if (!model) {
        // Fallback to simulated analysis if model not available
        return this.getFallbackInfectionAnalysis();
      }

      // Preprocess image
      const preprocessed = await this.preprocessImage(imageSrc);
      
      // Run prediction
      const prediction = model.predict(preprocessed);
      
      // Get prediction data
      const predictionData = await prediction.data();
      
      // Clean up tensors
      preprocessed.dispose();
      prediction.dispose();

      // Process results (adjust based on your model's output format)
      // Assuming multi-class classification for different conditions
      const conditions = [
        'Bacterial Infection',
        'Fungal Infection',
        'Viral Infection',
        'Eczema',
        'Psoriasis',
        'Normal Skin'
      ];

      // Find top prediction
      let maxProb = 0;
      let topCondition = 'Normal Skin';
      const conditionProbabilities = {};

      predictionData.forEach((prob, index) => {
        const conditionName = conditions[index] || `Condition ${index}`;
        conditionProbabilities[conditionName] = Math.round(prob * 100);
        
        if (prob > maxProb) {
          maxProb = prob;
          topCondition = conditionName;
        }
      });

      return {
        primaryCondition: topCondition,
        confidence: Math.round(maxProb * 100),
        allConditions: conditionProbabilities,
        hasInfection: topCondition !== 'Normal Skin' && maxProb > 0.5,
        modelUsed: true
      };
    } catch (error) {
      console.error('❌ Infection prediction error:', error);
      // Fallback to simulated analysis
      return this.getFallbackInfectionAnalysis();
    }
  }

  /**
   * Fallback cancer analysis (when model not available)
   * @returns {Object} Simulated analysis results
   */
  getFallbackCancerAnalysis() {
    const cancerPercentage = Math.floor(Math.random() * 30) + 5;
    return {
      cancerPercentage,
      confidence: 0.5,
      patterns: {
        asymmetry: Math.random() > 0.5,
        border: Math.random() > 0.5,
        color: Math.random() > 0.5,
        diameter: Math.random() > 0.5,
        evolving: Math.random() > 0.5
      },
      modelUsed: false,
      note: 'Using fallback analysis - model not loaded'
    };
  }

  /**
   * Fallback infection analysis (when model not available)
   * @returns {Object} Simulated analysis results
   */
  getFallbackInfectionAnalysis() {
    const conditions = ['Bacterial Infection', 'Fungal Infection', 'Normal Skin'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
      primaryCondition: randomCondition,
      confidence: Math.floor(Math.random() * 40) + 50,
      allConditions: {
        'Bacterial Infection': Math.floor(Math.random() * 30),
        'Fungal Infection': Math.floor(Math.random() * 30),
        'Viral Infection': Math.floor(Math.random() * 20),
        'Eczema': Math.floor(Math.random() * 25),
        'Psoriasis': Math.floor(Math.random() * 20),
        'Normal Skin': Math.floor(Math.random() * 40) + 40
      },
      hasInfection: randomCondition !== 'Normal Skin',
      modelUsed: false,
      note: 'Using fallback analysis - model not loaded'
    };
  }

  /**
   * Analyze image for both cancer and infection
   * @param {string} imageSrc - Base64 image or image URL
   * @returns {Promise<Object>} Combined analysis results
   */
  async analyzeImage(imageSrc) {
    try {
      const [cancerResults, infectionResults] = await Promise.all([
        this.predictCancer(imageSrc),
        this.predictInfection(imageSrc)
      ]);

      return {
        cancer: cancerResults,
        infection: infectionResults,
        analyzedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Analysis error:', error);
      throw error;
    }
  }

  /**
   * Dispose models to free memory
   */
  dispose() {
    if (this.models.cancer) {
      this.models.cancer.dispose();
      this.models.cancer = null;
    }
    if (this.models.infection) {
      this.models.infection.dispose();
      this.models.infection = null;
    }
  }
}

// Export singleton instance
const modelLoader = new ModelLoader();
export default modelLoader;

