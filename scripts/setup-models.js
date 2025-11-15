#!/usr/bin/env node

/**
 * Model Setup Script
 * Creates directories and helps set up AI models for skin cancer detection
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

console.log('🤖 AI Model Setup Script');
console.log('========================\n');

// Create model directories
const modelDirs = [
  'client/public/models/cancer-detection',
  'client/public/models/infection-detection'
];

console.log('📁 Creating model directories...');
modelDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`   ✅ Created ${dir}`);
  } else {
    console.log(`   ℹ️  ${dir} already exists`);
  }
});

// Create .gitkeep files to preserve directories
modelDirs.forEach(dir => {
  const gitkeepPath = path.join(process.cwd(), dir, '.gitkeep');
  if (!fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, '');
  }
});

console.log('\n✅ Model directories ready!\n');

// Check for Python and tensorflowjs
console.log('🔍 Checking dependencies...');
const { execSync } = require('child_process');

let pythonAvailable = false;
let tensorflowjsAvailable = false;

try {
  execSync('python --version', { stdio: 'ignore' });
  pythonAvailable = true;
  console.log('   ✅ Python found');
} catch (e) {
  try {
    execSync('python3 --version', { stdio: 'ignore' });
    pythonAvailable = true;
    console.log('   ✅ Python3 found');
  } catch (e2) {
    console.log('   ⚠️  Python not found (needed for model conversion)');
  }
}

if (pythonAvailable) {
  try {
    execSync('python -c "import tensorflowjs"', { stdio: 'ignore' });
    tensorflowjsAvailable = true;
    console.log('   ✅ TensorFlow.js converter installed');
  } catch (e) {
    try {
      execSync('python3 -c "import tensorflowjs"', { stdio: 'ignore' });
      tensorflowjsAvailable = true;
      console.log('   ✅ TensorFlow.js converter installed');
    } catch (e2) {
      console.log('   ⚠️  TensorFlow.js converter not installed');
      console.log('   💡 Run: pip install tensorflowjs');
    }
  }
}

console.log('\n📋 Next Steps:');
console.log('==============\n');
console.log('1. Download models from one of these sources:');
console.log('   📚 See MODEL_REPOSITORIES.md for specific links\n');
console.log('2. Place model files in:');
console.log('   - client/public/models/cancer-detection/');
console.log('   - client/public/models/infection-detection/\n');
console.log('3. Model files needed:');
console.log('   - model.json (model architecture)');
console.log('   - weights.bin or weights_*.bin (model weights)\n');
console.log('4. Restart your app - models will auto-load!\n');
console.log('💡 Tip: The app works with fallback analysis if models aren\'t found.');
console.log('   This is perfect for testing and development.\n');

// Create a placeholder model.json for testing structure
const createPlaceholderModel = (modelName, outputPath) => {
  const placeholderModel = {
    modelTopology: {
      class_name: "Sequential",
      config: {
        name: "sequential_1",
        layers: []
      },
      keras_version: "2.13.1",
      backend: "tensorflow"
    },
    weightsManifest: [],
    format: "layers-model",
    generatedBy: "2.13.1",
    convertedBy: "TensorFlow.js Converter",
    _note: "This is a placeholder. Replace with actual trained model."
  };

  fs.writeFileSync(
    path.join(outputPath, 'model.json'),
    JSON.stringify(placeholderModel, null, 2)
  );
};

console.log('📝 Creating placeholder model structures...');
createPlaceholderModel('cancer', path.join(process.cwd(), 'client/public/models/cancer-detection'));
createPlaceholderModel('infection', path.join(process.cwd(), 'client/public/models/infection-detection'));
console.log('   ✅ Placeholder models created (for structure reference)\n');

console.log('✨ Setup complete!');
console.log('\n📖 For detailed instructions, see:');
console.log('   - MODEL_REPOSITORIES.md (where to find models)');
console.log('   - AI_MODELS_GUIDE.md (how to convert and use models)');

