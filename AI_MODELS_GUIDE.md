# AI Models Guide - Skin Cancer & Infection Detection

This guide explains how to find, integrate, and use pre-trained AI models for skin cancer detection and skin infection/condition detection.

## Table of Contents

1. [Overview](#overview)
2. [Finding Pre-trained Models](#finding-pre-trained-models)
3. [Model Integration Options](#model-integration-options)
4. [Client-Side Integration (TensorFlow.js)](#client-side-integration-tensorflowjs)
5. [Server-Side Integration](#server-side-integration)
6. [Model Conversion](#model-conversion)
7. [Testing & Validation](#testing--validation)
8. [Resources & Datasets](#resources--datasets)

---

## Overview

The application supports **dual AI analysis**:
- **Cancer Detection**: Analyzes skin lesions for cancer risk using ABCDE criteria
- **Infection Detection**: Identifies various skin conditions (bacterial, fungal, viral infections, eczema, psoriasis, etc.)

You can use either:
- **Client-side models** (TensorFlow.js) - Runs in the browser
- **Server-side models** (Node.js/Python) - Runs on your server
- **External ML APIs** - Third-party services

---

## Finding Pre-trained Models

### 1. ISIC Archive (Skin Cancer)

**Website**: https://www.isic-archive.com/

**What it offers**:
- Largest collection of skin lesion images (25,000+ images)
- Pre-trained models available on Papers with Code
- Multiple model architectures (ResNet, DenseNet, EfficientNet)

**How to use**:
1. Visit https://paperswithcode.com/task/skin-lesion-classification
2. Browse available models and their performance metrics
3. Download model weights or use provided API endpoints

**Recommended Models**:
- **EfficientNet-B7**: High accuracy, good for production
- **ResNet-50**: Balanced performance and speed
- **DenseNet-121**: Good for mobile devices

### 2. DermNet (Dermatology Conditions)

**Website**: https://dermnetnz.org/

**What it offers**:
- Comprehensive dermatology image database
- Multiple skin condition categories
- Educational resources

**Model Sources**:
- Search GitHub for "dermnet classification" or "skin condition detection"
- Check Papers with Code for dermatology classification models

### 3. GitHub Repositories

**Search Terms**:
- `skin cancer detection tensorflow`
- `dermatology classification pytorch`
- `skin lesion classification`
- `melanoma detection model`

**Popular Repositories**:
- [Skin Cancer Detection](https://github.com/topics/skin-cancer-detection)
- [Dermatology AI](https://github.com/topics/dermatology-ai)
- [Medical Image Classification](https://github.com/topics/medical-image-classification)

### 4. Hugging Face Model Hub

**Website**: https://huggingface.co/models

**Search for**:
- `skin-cancer-detection`
- `dermatology-classification`
- `medical-image-classification`

**Example Models**:
- Search: "skin" or "dermatology" in the model hub
- Filter by task: "Image Classification"
- Check model cards for usage instructions

### 5. Kaggle Competitions

**Competitions**:
- [SIIM-ISIC Melanoma Classification](https://www.kaggle.com/c/siim-isic-melanoma-classification)
- [Skin Cancer Classification](https://www.kaggle.com/datasets/fanconic/skin-cancer-malignant-vs-benign)

**Benefits**:
- Pre-trained models from top performers
- Detailed notebooks with code
- Trained on large, validated datasets

---

## Model Integration Options

### Option 1: Client-Side (TensorFlow.js) ⭐ Recommended for Privacy

**Pros**:
- Images never leave the device
- No server costs for inference
- Works offline after initial model load
- Fast for users (no network latency)

**Cons**:
- Larger initial download (10-50MB+)
- Limited by device performance
- Model updates require app updates

**Implementation**:
See `client/src/utils/modelLoader.js` - already implemented!

**Steps**:
1. Convert your model to TensorFlow.js format
2. Place model files in `client/public/models/`
3. Update model paths in `modelLoader.js`

### Option 2: Server-Side (Node.js/Python)

**Pros**:
- Better performance (GPU servers)
- Easier model updates
- No client download size impact
- Can use larger models

**Cons**:
- Images sent to server (privacy concern)
- Server costs for inference
- Network dependency

**Implementation**:
See `server/services/mlService.js` - examples included!

### Option 3: External ML APIs

**Popular Services**:
- **Google Cloud Vision API**: General image analysis
- **AWS Rekognition**: Custom labels support
- **Azure Computer Vision**: Medical imaging APIs
- **Hugging Face Inference API**: Free tier available

**Implementation**:
See `server/services/mlService.js` for integration examples!

---

## Client-Side Integration (TensorFlow.js)

### Step 1: Convert Your Model

If you have a TensorFlow/Keras model:

```bash
# Install TensorFlow.js converter
pip install tensorflowjs

# Convert Keras model
tensorflowjs_converter \
    --input_format=keras \
    --output_format=tfjs_layers_model \
    path/to/your/model.h5 \
    client/public/models/cancer-detection/
```

If you have a PyTorch model:

```bash
# First convert to ONNX, then to TensorFlow.js
# Or use: https://github.com/onnx/onnx-tensorflow
```

### Step 2: Place Model Files

```
client/
  public/
    models/
      cancer-detection/
        model.json          # Model architecture
        weights.bin          # Model weights (or weights_*.bin)
      infection-detection/
        model.json
        weights.bin
```

### Step 3: Update Model Paths

Edit `client/src/utils/modelLoader.js`:

```javascript
this.modelPaths = {
  cancer: '/models/cancer-detection/model.json',
  infection: '/models/infection-detection/model.json'
};
```

### Step 4: Test Model Loading

The app will automatically:
1. Try to load models on component mount
2. Fall back to simulated analysis if models not found
3. Show "AI Model" badge when real models are used

### Step 5: Adjust Preprocessing

If your model expects different input:
- Edit `preprocessImage()` in `modelLoader.js`
- Adjust image size (default: 224x224)
- Modify normalization (default: divide by 255)

---

## Server-Side Integration

### Option A: TensorFlow.js on Node.js

**Install**:
```bash
npm install @tensorflow/tfjs-node
# Or for GPU: npm install @tensorflow/tfjs-node-gpu
```

**Example** (see `server/services/mlService.js`):
```javascript
const tf = require('@tensorflow/tfjs-node');
const model = await tf.loadLayersModel('file://./models/cancer-model.json');
const prediction = model.predict(preprocessedImage);
```

### Option B: Python Flask/FastAPI Service

**Create** `server/python-ml-service/app.py`:
```python
from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image
import io

app = Flask(__name__)
cancer_model = tf.keras.models.load_model('models/cancer_model.h5')
infection_model = tf.keras.models.load_model('models/infection_model.h5')

@app.route('/analyze', methods=['POST'])
def analyze():
    image = Image.open(io.BytesIO(request.files['image'].read()))
    # Preprocess and predict
    # Return JSON results
```

**Call from Node.js**:
```javascript
const response = await axios.post('http://localhost:5001/analyze', formData);
```

### Option C: External ML API

**Google Cloud Vision**:
```bash
npm install @google-cloud/vision
```

**AWS Rekognition**:
```bash
npm install aws-sdk
```

See `server/services/mlService.js` for complete examples!

---

## Model Conversion

### Converting Keras/TensorFlow Models

```bash
# Install converter
pip install tensorflowjs

# Convert SavedModel
tensorflowjs_converter \
    --input_format=tf_saved_model \
    --output_format=tfjs_layers_model \
    --saved_model_tags=serve \
    /path/to/saved_model \
    /path/to/output

# Convert Keras H5
tensorflowjs_converter \
    --input_format=keras \
    /path/to/model.h5 \
    /path/to/output
```

### Converting PyTorch Models

**Method 1: PyTorch → ONNX → TensorFlow.js**
```bash
# 1. Export to ONNX
torch.onnx.export(model, dummy_input, "model.onnx")

# 2. Convert ONNX to TensorFlow
onnx-tf convert -i model.onnx -o tf_model

# 3. Convert TensorFlow to TensorFlow.js
tensorflowjs_converter tf_model client/public/models/
```

**Method 2: Use ONNX.js** (runs ONNX models directly)
```bash
npm install onnxjs
```

### Model Quantization (Reduce Size)

```bash
# Quantize model (reduces size, slight accuracy loss)
tensorflowjs_converter \
    --quantize_float16 \
    /path/to/model.h5 \
    /path/to/output
```

---

## Testing & Validation

### Test Model Loading

1. **Check Browser Console**:
   - Look for: `✅ Cancer model loaded successfully`
   - Or: `⚠️ Local model not found, using fallback analysis`

2. **Verify Model Paths**:
   - Open DevTools → Network tab
   - Check if `model.json` loads successfully
   - Verify weights files load

3. **Test Predictions**:
   - Upload a test image
   - Check if `modelUsed: true` in results
   - Verify predictions are reasonable

### Validate Model Output Format

Your model should output:
- **Cancer model**: `[benign_probability, malignant_probability]` or similar
- **Infection model**: `[prob_class1, prob_class2, ...]` for each condition

Adjust `predictCancer()` and `predictInfection()` in `modelLoader.js` to match your model's output format.

---

## Resources & Datasets

### Datasets for Training

1. **ISIC Archive**: https://www.isic-archive.com/
   - 25,000+ skin lesion images
   - Annotated with diagnosis

2. **HAM10000**: https://www.kaggle.com/datasets/kmader/skin-cancer-mnist-ham10000
   - 10,000+ images
   - 7 classes of skin lesions

3. **DermNet**: https://dermnetnz.org/
   - Educational resource
   - Multiple condition categories

4. **MedNode**: https://www.med-node.de/
   - Dermatology image database

### Pre-trained Models

1. **Papers with Code**:
   - https://paperswithcode.com/task/skin-lesion-classification
   - Compare model performance
   - Find code repositories

2. **Model Zoo**:
   - TensorFlow Hub: https://tfhub.dev/
   - PyTorch Hub: https://pytorch.org/hub/
   - Search: "skin", "dermatology", "medical"

3. **GitHub**:
   - Search: `skin cancer detection model`
   - Filter by language and stars
   - Check for pre-trained weights

### Learning Resources

1. **TensorFlow.js Tutorials**:
   - https://www.tensorflow.org/js/tutorials
   - Image classification guide

2. **Medical AI Courses**:
   - Coursera: AI for Medicine
   - Fast.ai: Practical Deep Learning

---

## Quick Start Checklist

- [ ] Choose integration method (client-side/server-side/API)
- [ ] Find or train a model
- [ ] Convert model to appropriate format
- [ ] Place model files in correct location
- [ ] Update model paths in code
- [ ] Test model loading
- [ ] Adjust preprocessing if needed
- [ ] Validate output format
- [ ] Test with real images
- [ ] Monitor performance and accuracy

---

## Troubleshooting

### Model Not Loading

**Check**:
1. Model files are in `client/public/models/`
2. Model paths are correct in `modelLoader.js`
3. Browser console for errors
4. Network tab for 404 errors

### Predictions Seem Wrong

**Check**:
1. Image preprocessing matches training data
2. Model output format matches code expectations
3. Model was trained on similar data

### Performance Issues

**Solutions**:
1. Use quantized models (smaller, faster)
2. Reduce input image size
3. Use server-side inference
4. Implement model caching

---

## Next Steps

1. **Find a Model**: Start with ISIC Archive or Papers with Code
2. **Convert It**: Use TensorFlow.js converter
3. **Integrate It**: Follow client-side or server-side guide
4. **Test It**: Validate with test images
5. **Deploy It**: Update your production app

For questions or issues, check the code comments in:
- `client/src/utils/modelLoader.js`
- `server/services/mlService.js`
- `server/index.js` (server-side endpoint)

---

**Note**: Always validate models with medical professionals before using in production. AI models are tools to assist, not replace, professional medical diagnosis.

