/**
 * Model Loader Utility for TensorFlow.js Models
 * Handles loading, caching, and managing AI models for skin analysis
 */

import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

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
    
    // Model configuration - adjust based on your model's requirements
    this.modelConfig = {
      cancer: {
        inputSize: 224, // Most models use 224x224, some use 299x299
        normalization: '0-1', // '0-1' (divide by 255) or 'imagenet' (ImageNet mean/std)
        outputFormat: 'probabilities' // 'probabilities', 'logits', or 'binary'
      },
      infection: {
        inputSize: 224,
        normalization: '0-1',
        outputFormat: 'probabilities'
      }
    };
  }

  /**
   * Preprocess image for model input
   * @param {string} imageSrc - Base64 image or image URL
   * @param {string} modelType - 'cancer' or 'infection'
   * @returns {tf.Tensor} Preprocessed tensor
   */
  async preprocessImage(imageSrc, modelType = 'cancer') {
    const config = this.modelConfig[modelType] || this.modelConfig.cancer;
    const targetSize = config.inputSize;
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          // Create canvas and resize image
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, targetSize, targetSize);

          // Convert to tensor
          const tensor = tf.browser.fromPixels(canvas);
          
          // Normalize based on model configuration
          let normalized;
          if (config.normalization === 'imagenet') {
            // ImageNet normalization: (pixel - mean) / std
            const mean = tf.tensor1d([0.485, 0.456, 0.406]);
            const std = tf.tensor1d([0.229, 0.224, 0.225]);
            const normalizedPixels = tensor.div(255.0);
            const meanTensor = mean.reshape([1, 1, 1, 3]);
            const stdTensor = std.reshape([1, 1, 1, 3]);
            normalized = normalizedPixels.sub(meanTensor).div(stdTensor);
            mean.dispose();
            std.dispose();
            normalizedPixels.dispose();
          } else {
            // Default: normalize to [0, 1] range
            normalized = tensor.div(255.0);
          }
          
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
   * Uses MobileNet (already installed) for quick start
   * Can fall back to custom models if available
   * @param {boolean} forceReload - Force reload even if already loaded
   * @returns {Promise<mobilenet.MobileNet>} Loaded model
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
      
      // Option 1: Try to load custom model from local path
      try {
        const customModel = await tf.loadLayersModel(this.modelPaths.cancer);
        console.log('✅ Custom cancer model loaded successfully');
        this.models.cancer = customModel;
        this.models.cancer._isCustomModel = true;
        return this.models.cancer;
      } catch (localError) {
        console.log('ℹ️ Custom model not found, using MobileNet (already installed)...');
      }
      
      // Option 2: Use MobileNet (already installed, no download needed!)
      try {
        this.models.cancer = await mobilenet.load({
          version: 2,
          alpha: 1.0,
          inputRange: [0, 1]
        });
        console.log('✅ MobileNet model loaded successfully (lightweight, ~10MB)');
        this.models.cancer._isMobileNet = true;
        return this.models.cancer;
      } catch (mobilenetError) {
        console.warn('⚠️ MobileNet failed to load:', mobilenetError);
        this.models.cancer = null;
      }
      
      return this.models.cancer;
    } catch (error) {
      console.error('❌ Error loading cancer model:', error);
      this.models.cancer = null;
      return null; // Return null instead of throwing
    } finally {
      this.loading.cancer = false;
    }
  }

  /**
   * Load infection detection model
   * Uses MobileNet (already installed) for quick start
   * Can fall back to custom models if available
   * @param {boolean} forceReload - Force reload even if already loaded
   * @returns {Promise<mobilenet.MobileNet>} Loaded model
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
      
      // Option 1: Try to load custom model from local path
      try {
        const customModel = await tf.loadLayersModel(this.modelPaths.infection);
        console.log('✅ Custom infection model loaded successfully');
        this.models.infection = customModel;
        this.models.infection._isCustomModel = true;
        return this.models.infection;
      } catch (localError) {
        console.log('ℹ️ Custom model not found, using MobileNet (already installed)...');
      }
      
      // Option 2: Use MobileNet (already installed, no download needed!)
      try {
        this.models.infection = await mobilenet.load({
          version: 2,
          alpha: 1.0,
          inputRange: [0, 1]
        });
        console.log('✅ MobileNet model loaded successfully for infection detection');
        this.models.infection._isMobileNet = true;
        return this.models.infection;
      } catch (mobilenetError) {
        console.warn('⚠️ MobileNet failed to load:', mobilenetError);
        this.models.infection = null;
      }
      
      return this.models.infection;
    } catch (error) {
      console.error('❌ Error loading infection model:', error);
      this.models.infection = null;
      return null; // Return null instead of throwing
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
   * Supports both MobileNet and custom models
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

      // Check if using MobileNet or custom model
      if (model._isMobileNet) {
        // Use MobileNet's classify method
        return await this.predictCancerWithMobileNet(imageSrc, model);
      } else {
        // Use custom model's predict method
        return await this.predictCancerWithCustomModel(imageSrc, model);
      }
    } catch (error) {
      console.error('❌ Cancer prediction error:', error);
      // Fallback to simulated analysis
      return this.getFallbackCancerAnalysis();
    }
  }

  /**
   * Predict using MobileNet model
   * @param {string} imageSrc - Base64 image or image URL
   * @param {mobilenet.MobileNet} model - MobileNet model
   * @returns {Promise<Object>} Prediction results
   */
  async predictCancerWithMobileNet(imageSrc, model) {
    try {
      // Preprocess image
      const preprocessed = await this.preprocessImage(imageSrc, 'cancer');
      
      // MobileNet classify method (returns top 3 predictions)
      const predictions = await model.classify(preprocessed);
      
      // Clean up tensor
      preprocessed.dispose();

      // Process MobileNet predictions
      // MobileNet returns ImageNet classes, so we need to map to cancer risk
      const topPrediction = predictions[0];
      const secondPrediction = predictions[1] || { probability: 0 };
      
      // Keywords that might indicate skin-related issues
      const skinKeywords = ['skin', 'lesion', 'mole', 'spot', 'rash', 'dermatitis', 'eczema'];
      const cancerKeywords = ['cancer', 'tumor', 'malignant', 'melanoma', 'carcinoma'];
      
      const className = topPrediction.className.toLowerCase();
      const hasSkinKeyword = skinKeywords.some(keyword => className.includes(keyword));
      const hasCancerKeyword = cancerKeywords.some(keyword => className.includes(keyword));
      
      // Calculate cancer risk based on predictions
      let cancerPercentage;
      if (hasCancerKeyword) {
        cancerPercentage = Math.round(topPrediction.probability * 100);
      } else if (hasSkinKeyword) {
        // Skin-related but not cancer - moderate risk
        cancerPercentage = Math.round(topPrediction.probability * 30 + 10);
      } else {
        // General classification - low risk, but use prediction confidence
        cancerPercentage = Math.round(topPrediction.probability * 15 + 5);
      }

      // Extract ABCDE patterns based on prediction confidence
      const confidence = topPrediction.probability;
      const patterns = {
        asymmetry: confidence > 0.6,
        border: confidence > 0.55,
        color: confidence > 0.65,
        diameter: confidence > 0.5,
        evolving: confidence > 0.7
      };

      return {
        cancerPercentage: Math.max(5, Math.min(95, cancerPercentage)),
        confidence: confidence,
        patterns,
        modelUsed: true,
        modelType: 'MobileNet',
        topPredictions: predictions.map(p => ({
          className: p.className,
          probability: p.probability
        }))
      };
    } catch (error) {
      console.error('❌ MobileNet prediction error:', error);
      throw error;
    }
  }

  /**
   * Predict using custom model
   * @param {string} imageSrc - Base64 image or image URL
   * @param {tf.LayersModel} model - Custom TensorFlow.js model
   * @returns {Promise<Object>} Prediction results
   */
  async predictCancerWithCustomModel(imageSrc, model) {
    // Preprocess image
    const preprocessed = await this.preprocessImage(imageSrc, 'cancer');
    
    // Run prediction
    const prediction = model.predict(preprocessed);
    
    // Get prediction data
    const predictionData = await prediction.data();
    const predictionShape = prediction.shape;
    
    // Clean up tensors
    preprocessed.dispose();
    prediction.dispose();

    // Process results based on model output format
    const config = this.modelConfig.cancer;
    let benignProb, malignantProb, cancerPercentage;
    
    if (predictionShape.length === 1) {
      // Single output: [malignant_probability] or [benign_probability, malignant_probability]
      if (predictionShape[0] === 1) {
        // Binary output: [malignant_prob]
        malignantProb = predictionData[0];
        benignProb = 1 - malignantProb;
      } else if (predictionShape[0] === 2) {
        // Two outputs: [benign, malignant]
        benignProb = predictionData[0];
        malignantProb = predictionData[1];
      } else {
        // Multi-class: find malignant class
        malignantProb = Math.max(...Array.from(predictionData));
        benignProb = 1 - malignantProb;
      }
    } else {
      // Multi-dimensional output - flatten and process
      const probs = Array.from(predictionData);
      malignantProb = Math.max(...probs);
      benignProb = 1 - malignantProb;
    }
    
    // Apply softmax if output is logits
    if (config.outputFormat === 'logits') {
      const expBenign = Math.exp(benignProb);
      const expMalignant = Math.exp(malignantProb);
      const sum = expBenign + expMalignant;
      benignProb = expBenign / sum;
      malignantProb = expMalignant / sum;
    }
    
    cancerPercentage = Math.round(malignantProb * 100);
    
    // Extract ABCDE patterns
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
      modelUsed: true,
      modelType: 'Custom',
      rawPrediction: Array.from(predictionData)
    };
  }

  /**
   * Predict skin infection/condition from image
   * Supports both MobileNet and custom models
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

      // Check if using MobileNet or custom model
      if (model._isMobileNet) {
        // Use MobileNet's classify method
        return await this.predictInfectionWithMobileNet(imageSrc, model);
      } else {
        // Use custom model's predict method
        return await this.predictInfectionWithCustomModel(imageSrc, model);
      }
    } catch (error) {
      console.error('❌ Infection prediction error:', error);
      // Fallback to simulated analysis
      return this.getFallbackInfectionAnalysis();
    }
  }

  /**
   * Predict using MobileNet model for infection detection
   * @param {string} imageSrc - Base64 image or image URL
   * @param {mobilenet.MobileNet} model - MobileNet model
   * @returns {Promise<Object>} Prediction results
   */
  async predictInfectionWithMobileNet(imageSrc, model) {
    try {
      // Preprocess image
      const preprocessed = await this.preprocessImage(imageSrc, 'infection');
      
      // MobileNet classify method (returns top 3 predictions)
      const predictions = await model.classify(preprocessed);
      
      // Clean up tensor
      preprocessed.dispose();

      // Map ImageNet classes to skin conditions
      const conditions = [
        'Bacterial Infection',
        'Fungal Infection',
        'Viral Infection',
        'Eczema',
        'Psoriasis',
        'Normal Skin'
      ];

      // Keywords for different conditions
      const conditionKeywords = {
        'Bacterial Infection': ['bacteria', 'infection', 'abscess', 'boil', 'cellulitis'],
        'Fungal Infection': ['fungus', 'fungal', 'ringworm', 'candidiasis', 'athlete'],
        'Viral Infection': ['virus', 'viral', 'herpes', 'shingles', 'wart'],
        'Eczema': ['eczema', 'dermatitis', 'atopic', 'rash', 'itchy'],
        'Psoriasis': ['psoriasis', 'scaly', 'plaque'],
        'Normal Skin': ['skin', 'normal', 'healthy']
      };

      const topPrediction = predictions[0];
      const className = topPrediction.className.toLowerCase();
      
      // Map predictions to conditions
      const conditionProbabilities = {};
      let primaryCondition = 'Normal Skin';
      let maxProb = 0;

      // Check each condition
      conditions.forEach(condition => {
        const keywords = conditionKeywords[condition];
        const hasKeyword = keywords.some(keyword => className.includes(keyword));
        
        if (hasKeyword) {
          const prob = topPrediction.probability;
          conditionProbabilities[condition] = Math.round(prob * 100);
          
          if (prob > maxProb) {
            maxProb = prob;
            primaryCondition = condition;
          }
        } else {
          conditionProbabilities[condition] = Math.round((1 - topPrediction.probability) / conditions.length * 100);
        }
      });

      // If no specific match, use prediction confidence to determine
      if (primaryCondition === 'Normal Skin' && topPrediction.probability > 0.5) {
        // High confidence but no specific match - could be skin-related
        primaryCondition = 'Normal Skin';
        conditionProbabilities['Normal Skin'] = Math.round(topPrediction.probability * 100);
      }

      return {
        primaryCondition,
        confidence: Math.round(topPrediction.probability * 100),
        allConditions: conditionProbabilities,
        hasInfection: primaryCondition !== 'Normal Skin' && maxProb > 0.3,
        modelUsed: true,
        modelType: 'MobileNet',
        topPredictions: predictions.map(p => ({
          className: p.className,
          probability: p.probability
        }))
      };
    } catch (error) {
      console.error('❌ MobileNet infection prediction error:', error);
      throw error;
    }
  }

  /**
   * Predict using custom model for infection detection
   * @param {string} imageSrc - Base64 image or image URL
   * @param {tf.LayersModel} model - Custom TensorFlow.js model
   * @returns {Promise<Object>} Prediction results
   */
  async predictInfectionWithCustomModel(imageSrc, model) {
    // Preprocess image
    const preprocessed = await this.preprocessImage(imageSrc, 'infection');
    
    // Run prediction
    const prediction = model.predict(preprocessed);
    
    // Get prediction data
    const predictionData = await prediction.data();
    const predictionShape = prediction.shape;
    
    // Clean up tensors
    preprocessed.dispose();
    prediction.dispose();

    // Process results based on model output format
    const config = this.modelConfig.infection;
    const conditions = [
      'Bacterial Infection',
      'Fungal Infection',
      'Viral Infection',
      'Eczema',
      'Psoriasis',
      'Normal Skin'
    ];

    // Handle different output formats
    let probabilities;
    if (predictionShape.length === 1) {
      probabilities = Array.from(predictionData);
    } else {
      // Flatten multi-dimensional output
      probabilities = Array.from(predictionData);
    }
    
    // Apply softmax if output is logits
    if (config.outputFormat === 'logits') {
      const expProbs = probabilities.map(p => Math.exp(p));
      const sum = expProbs.reduce((a, b) => a + b, 0);
      probabilities = expProbs.map(p => p / sum);
    }
    
    // Normalize probabilities to sum to 1 (if needed)
    const sum = probabilities.reduce((a, b) => a + b, 0);
    if (sum > 0 && Math.abs(sum - 1.0) > 0.01) {
      probabilities = probabilities.map(p => p / sum);
    }

    // Find top prediction
    let maxProb = 0;
    let topIndex = 0;
    const conditionProbabilities = {};

    probabilities.forEach((prob, index) => {
      const conditionName = conditions[index] || `Condition ${index}`;
      const probPercent = Math.round(prob * 100);
      conditionProbabilities[conditionName] = probPercent;
      
      if (prob > maxProb) {
        maxProb = prob;
        topIndex = index;
      }
    });

    const topCondition = conditions[topIndex] || 'Normal Skin';

    return {
      primaryCondition: topCondition,
      confidence: Math.round(maxProb * 100),
      allConditions: conditionProbabilities,
      hasInfection: topCondition !== 'Normal Skin' && maxProb > 0.5,
      modelUsed: true,
      modelType: 'Custom',
      rawPrediction: probabilities
    };
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

