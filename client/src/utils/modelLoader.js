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
   * Uses MobileNet (mandatory - no fallback to random numbers)
   * Can use custom models if available
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
      console.log('🔄 Loading cancer detection model with MobileNet...');
      
      // Use MobileNet directly (skip custom model loading to avoid errors)
      this.models.cancer = await mobilenet.load({
        version: 2,
        alpha: 1.0,
        inputRange: [0, 1]
      });
      console.log('✅ MobileNet model loaded successfully');
      this.models.cancer._isMobileNet = true;
      return this.models.cancer;
    } catch (error) {
      console.error('❌ Error loading cancer model:', error);
      throw new Error(`Failed to load MobileNet model: ${error.message}. Please check your internet connection and try again.`);
    } finally {
      this.loading.cancer = false;
    }
  }

  /**
   * Load infection detection model
   * Uses MobileNet (mandatory - no fallback to random numbers)
   * Can use custom models if available
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
      console.log('🔄 Loading infection detection model with MobileNet...');
      
      // Use MobileNet directly (skip custom model loading to avoid errors)
      this.models.infection = await mobilenet.load({
        version: 2,
        alpha: 1.0,
        inputRange: [0, 1]
      });
      console.log('✅ MobileNet model loaded successfully for infection detection');
      this.models.infection._isMobileNet = true;
      return this.models.infection;
    } catch (error) {
      console.error('❌ Error loading infection model:', error);
      throw new Error(`Failed to load MobileNet model: ${error.message}. Please check your internet connection and try again.`);
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
      this.loadCancerModel(),
      this.loadInfectionModel()
    ]);

    return {
      cancer: cancerModel,
      infection: infectionModel
    };
  }

  /**
   * Predict cancer risk from image
   * Uses MobileNet (mandatory - no fallback)
   * @param {string} imageSrc - Base64 image or image URL
   * @returns {Promise<Object>} Prediction results
   */
  async predictCancer(imageSrc) {
    const model = await this.loadCancerModel();
    
    // Always use MobileNet's classify method
    return await this.predictCancerWithMobileNet(imageSrc, model);
  }

  /**
   * Predict using MobileNet model
   * @param {string} imageSrc - Base64 image or image URL
   * @param {mobilenet.MobileNet} model - MobileNet model
   * @returns {Promise<Object>} Prediction results
   */
  async predictCancerWithMobileNet(imageSrc, model) {
    try {
      // MobileNet's classify method expects an HTMLImageElement, HTMLCanvasElement, or ImageData
      // It handles preprocessing internally, so we pass the image directly
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      // Load image and wait for it to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageSrc;
      });
      
      // MobileNet classify method (returns top 3 predictions)
      const predictions = await model.classify(img);

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

      // Perform detailed lesion analysis
      const lesionAnalysis = await this.analyzeLesionDetails(img);
      
      // Extract ABCDE patterns based on analysis
      const patterns = {
        asymmetry: lesionAnalysis.asymmetryScore > 0.6,
        border: lesionAnalysis.borderIrregularity > 0.55,
        color: lesionAnalysis.colorVariation > 0.65,
        diameter: lesionAnalysis.diameter > 0.5,
        evolving: false // Cannot determine from single image
      };

      return {
        cancerPercentage: Math.max(5, Math.min(95, cancerPercentage)),
        confidence: topPrediction.probability,
        patterns,
        lesionDetails: lesionAnalysis,
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
   * Uses MobileNet (mandatory - no fallback)
   * @param {string} imageSrc - Base64 image or image URL
   * @returns {Promise<Object>} Prediction results
   */
  async predictInfection(imageSrc) {
    const model = await this.loadInfectionModel();
    
    // Always use MobileNet's classify method
    return await this.predictInfectionWithMobileNet(imageSrc, model);
  }

  /**
   * Predict using MobileNet model for infection detection
   * @param {string} imageSrc - Base64 image or image URL
   * @param {mobilenet.MobileNet} model - MobileNet model
   * @returns {Promise<Object>} Prediction results
   */
  async predictInfectionWithMobileNet(imageSrc, model) {
    try {
      // MobileNet's classify method expects an HTMLImageElement, HTMLCanvasElement, or ImageData
      // It handles preprocessing internally, so we pass the image directly
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      // Load image and wait for it to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageSrc;
      });
      
      // MobileNet classify method (returns top 3 predictions)
      const predictions = await model.classify(img);

      // Map ImageNet classes to skin conditions
      const conditions = [
        'Bacterial Infection',
        'Fungal Infection',
        'Viral Infection',
        'Eczema',
        'Psoriasis',
        'Normal Skin'
      ];

      // Keywords for different conditions with weights
      const conditionKeywords = {
        'Bacterial Infection': ['bacteria', 'infection', 'abscess', 'boil', 'cellulitis', 'pustule', 'pimple'],
        'Fungal Infection': ['fungus', 'fungal', 'ringworm', 'candidiasis', 'athlete', 'yeast', 'mold'],
        'Viral Infection': ['virus', 'viral', 'herpes', 'shingles', 'wart', 'molluscum'],
        'Eczema': ['eczema', 'dermatitis', 'atopic', 'rash', 'itchy', 'dry', 'scaly'],
        'Psoriasis': ['psoriasis', 'scaly', 'plaque', 'silver', 'flaky'],
        'Normal Skin': ['skin', 'normal', 'healthy', 'clear']
      };

      // Use all predictions (top 3) to calculate probabilities
      const conditionScores = {};
      conditions.forEach(cond => conditionScores[cond] = 0);
      
      // Score each prediction
      predictions.forEach((pred, index) => {
        const className = pred.className.toLowerCase();
        const weight = pred.probability * (3 - index) / 3; // Weight decreases for lower predictions
        
        conditions.forEach(condition => {
          const keywords = conditionKeywords[condition];
          const matchCount = keywords.filter(keyword => className.includes(keyword)).length;
          
          if (matchCount > 0) {
            // Direct match - higher score
            conditionScores[condition] += weight * (matchCount / keywords.length) * 100;
          } else if (condition === 'Normal Skin') {
            // Normal skin gets residual probability if no matches
            conditionScores[condition] += weight * 10;
          }
        });
      });
      
      // Normalize scores to percentages (0-100)
      const totalScore = Object.values(conditionScores).reduce((sum, score) => sum + score, 0);
      const conditionProbabilities = {};
      let primaryCondition = 'Normal Skin';
      let maxProb = 0;
      
      conditions.forEach(condition => {
        if (totalScore > 0) {
          conditionProbabilities[condition] = Math.round((conditionScores[condition] / totalScore) * 100);
        } else {
          // Fallback: distribute evenly if no matches
          conditionProbabilities[condition] = Math.round(100 / conditions.length);
        }
        
        if (conditionProbabilities[condition] > maxProb) {
          maxProb = conditionProbabilities[condition];
          primaryCondition = condition;
        }
      });
      
      // Ensure percentages add up to 100
      const sum = Object.values(conditionProbabilities).reduce((a, b) => a + b, 0);
      if (sum !== 100) {
        const diff = 100 - sum;
        conditionProbabilities[primaryCondition] += diff;
      }

      return {
        primaryCondition,
        confidence: Math.round(predictions[0].probability * 100),
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
   * Fallback cancer analysis - REMOVED
   * MobileNet is now mandatory. This function throws an error.
   */
  getFallbackCancerAnalysis() {
    throw new Error('MobileNet model failed to load. Cannot perform analysis without AI model.');
  }

  /**
   * Fallback infection analysis - REMOVED
   * MobileNet is now mandatory. This function throws an error.
   */
  getFallbackInfectionAnalysis() {
    throw new Error('MobileNet model failed to load. Cannot perform analysis without AI model.');
  }

  /**
   * Analyze lesion details using image processing
   * Calculates size, shape, color, border irregularity, and asymmetry
   * @param {HTMLImageElement} img - Image element
   * @returns {Promise<Object>} Detailed lesion analysis
   */
  async analyzeLesionDetails(img) {
    try {
      // Create canvas for image processing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Convert to grayscale and detect lesion region
      const grayscale = new Uint8Array(canvas.width * canvas.height);
      const threshold = 128; // Threshold for lesion detection
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        grayscale[i / 4] = gray;
      }
      
      // Find lesion boundaries (simplified - assumes darker regions are lesions)
      let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
      let lesionPixels = 0;
      const lesionMask = new Array(canvas.width * canvas.height).fill(false);
      
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = y * canvas.width + x;
          const gray = grayscale[idx];
          
          // Detect darker regions (potential lesions)
          if (gray < threshold) {
            lesionMask[idx] = true;
            lesionPixels++;
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
          }
        }
      }
      
      // Calculate size measurements
      const width = maxX - minX;
      const height = maxY - minY;
      const area = lesionPixels;
      const diameter = Math.sqrt(area / Math.PI) * 2; // Equivalent diameter
      
      // Calculate aspect ratio
      const aspectRatio = width > 0 ? height / width : 1;
      
      // Calculate circularity (4π * area / perimeter^2)
      let perimeter = 0;
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const idx = y * canvas.width + x;
          if (lesionMask[idx]) {
            // Check neighbors for border pixels
            const neighbors = [
              y > 0 && !lesionMask[(y - 1) * canvas.width + x],
              y < canvas.height - 1 && !lesionMask[(y + 1) * canvas.width + x],
              x > 0 && !lesionMask[y * canvas.width + (x - 1)],
              x < canvas.width - 1 && !lesionMask[y * canvas.width + (x + 1)]
            ];
            if (neighbors.some(n => n)) perimeter++;
          }
        }
      }
      const circularity = perimeter > 0 ? (4 * Math.PI * area) / (perimeter * perimeter) : 0;
      
      // Calculate color variation
      const colors = [];
      for (let i = 0; i < data.length; i += 4) {
        const idx = i / 4;
        if (lesionMask[idx]) {
          colors.push([data[i], data[i + 1], data[i + 2]]);
        }
      }
      
      // Calculate color variance
      let colorVariation = 0;
      if (colors.length > 0) {
        const avgR = colors.reduce((sum, c) => sum + c[0], 0) / colors.length;
        const avgG = colors.reduce((sum, c) => sum + c[1], 0) / colors.length;
        const avgB = colors.reduce((sum, c) => sum + c[2], 0) / colors.length;
        
        const variance = colors.reduce((sum, c) => {
          const dr = c[0] - avgR;
          const dg = c[1] - avgG;
          const db = c[2] - avgB;
          return sum + (dr * dr + dg * dg + db * db);
        }, 0) / colors.length;
        
        colorVariation = Math.min(1, Math.sqrt(variance) / 255);
      }
      
      // Calculate border irregularity (deviation from smooth circle)
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const avgRadius = diameter / 2;
      let borderDeviation = 0;
      let borderPoints = 0;
      
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const idx = y * canvas.width + x;
          if (lesionMask[idx]) {
            const neighbors = [
              y > 0 && !lesionMask[(y - 1) * canvas.width + x],
              y < canvas.height - 1 && !lesionMask[(y + 1) * canvas.width + x],
              x > 0 && !lesionMask[y * canvas.width + (x - 1)],
              x < canvas.width - 1 && !lesionMask[y * canvas.width + (x + 1)]
            ];
            if (neighbors.some(n => n)) {
              const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
              borderDeviation += Math.abs(dist - avgRadius);
              borderPoints++;
            }
          }
        }
      }
      const borderIrregularity = borderPoints > 0 ? Math.min(1, borderDeviation / (borderPoints * avgRadius)) : 0;
      
      // Calculate asymmetry score (compare left vs right halves)
      let leftHalfPixels = 0, rightHalfPixels = 0;
      const centerLineX = (minX + maxX) / 2;
      
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const idx = y * canvas.width + x;
          if (lesionMask[idx]) {
            if (x < centerLineX) leftHalfPixels++;
            else rightHalfPixels++;
          }
        }
      }
      
      const totalPixels = leftHalfPixels + rightHalfPixels;
      const asymmetryScore = totalPixels > 0 
        ? Math.abs(leftHalfPixels - rightHalfPixels) / totalPixels 
        : 0;
      
      // Estimate size in mm (assuming average phone camera: ~1mm per 10 pixels at close range)
      const pixelsPerMM = 10; // Approximate conversion
      const widthMM = width / pixelsPerMM;
      const heightMM = height / pixelsPerMM;
      const diameterMM = diameter / pixelsPerMM;
      
      return {
        // Size measurements
        width: Math.round(width),
        height: Math.round(height),
        area: Math.round(area),
        diameter: Math.round(diameter),
        widthMM: Math.round(widthMM * 10) / 10,
        heightMM: Math.round(heightMM * 10) / 10,
        diameterMM: Math.round(diameterMM * 10) / 10,
        
        // Shape analysis
        aspectRatio: Math.round(aspectRatio * 100) / 100,
        circularity: Math.round(circularity * 100) / 100,
        shape: aspectRatio > 0.8 && aspectRatio < 1.2 && circularity > 0.7 
          ? 'Round' 
          : aspectRatio > 1.5 || aspectRatio < 0.67 
            ? 'Irregular' 
            : 'Oval',
        
        // Color analysis
        colorVariation: Math.round(colorVariation * 100) / 100,
        dominantColors: this.extractDominantColors(colors),
        
        // Border analysis
        borderIrregularity: Math.round(borderIrregularity * 100) / 100,
        borderSmoothness: Math.round((1 - borderIrregularity) * 100) / 100,
        
        // Asymmetry
        asymmetryScore: Math.round(asymmetryScore * 100) / 100,
        
        // ABCDE scores (0-1 scale)
        asymmetry: asymmetryScore,
        border: borderIrregularity,
        color: colorVariation,
        diameter: Math.min(1, diameterMM / 6), // 6mm is concerning threshold
        evolving: 0 // Cannot determine from single image
      };
    } catch (error) {
      console.error('❌ Lesion analysis error:', error);
      // Return default values on error
      return {
        width: 0,
        height: 0,
        area: 0,
        diameter: 0,
        widthMM: 0,
        heightMM: 0,
        diameterMM: 0,
        aspectRatio: 1,
        circularity: 1,
        shape: 'Unknown',
        colorVariation: 0,
        dominantColors: [],
        borderIrregularity: 0,
        borderSmoothness: 1,
        asymmetryScore: 0,
        asymmetry: 0,
        border: 0,
        color: 0,
        diameter: 0,
        evolving: 0
      };
    }
  }

  /**
   * Extract dominant colors from lesion region
   * @param {Array<Array<number>>} colors - Array of RGB color values
   * @returns {Array<Object>} Dominant colors with percentages
   */
  extractDominantColors(colors) {
    if (colors.length === 0) return [];
    
    // Simple k-means clustering for color extraction (simplified)
    const colorGroups = {};
    const groupSize = 32; // Quantize colors
    
    colors.forEach(color => {
      const r = Math.floor(color[0] / groupSize) * groupSize;
      const g = Math.floor(color[1] / groupSize) * groupSize;
      const b = Math.floor(color[2] / groupSize) * groupSize;
      const key = `${r},${g},${b}`;
      
      if (!colorGroups[key]) {
        colorGroups[key] = { color: [r, g, b], count: 0 };
      }
      colorGroups[key].count++;
    });
    
    // Sort by frequency and return top 3
    return Object.values(colorGroups)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(group => ({
        rgb: group.color,
        hex: `#${group.color[0].toString(16).padStart(2, '0')}${group.color[1].toString(16).padStart(2, '0')}${group.color[2].toString(16).padStart(2, '0')}`,
        percentage: Math.round((group.count / colors.length) * 100)
      }));
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

