#!/usr/bin/env node

/**
 * Example script for downloading models from various sources
 * Customize this script based on the model source you choose
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

console.log('📥 Model Download Example Script');
console.log('=================================\n');

// Example 1: Download from GitHub Release
async function downloadFromGitHubRelease() {
  const repo = 'username/repo-name'; // Replace with actual repo
  const version = 'v1.0.0'; // Replace with actual version
  const files = [
    'cancer-model.json',
    'cancer-weights.bin'
  ];

  console.log('📦 Downloading from GitHub Release...');
  
  for (const file of files) {
    const url = `https://github.com/${repo}/releases/download/${version}/${file}`;
    const outputPath = path.join('client/public/models/cancer-detection', file);
    
    try {
      await downloadFile(url, outputPath);
      console.log(`   ✅ Downloaded ${file}`);
    } catch (error) {
      console.error(`   ❌ Failed to download ${file}:`, error.message);
    }
  }
}

// Example 2: Download from direct URL
async function downloadFromURL() {
  const modelURLs = {
    cancer: {
      model: 'https://example.com/models/cancer/model.json',
      weights: 'https://example.com/models/cancer/weights.bin'
    },
    infection: {
      model: 'https://example.com/models/infection/model.json',
      weights: 'https://example.com/models/infection/weights.bin'
    }
  };

  console.log('🌐 Downloading from URLs...');
  
  for (const [type, urls] of Object.entries(modelURLs)) {
    const dir = path.join('client/public/models', `${type}-detection`);
    
    for (const [fileType, url] of Object.entries(urls)) {
      const filename = fileType === 'model' ? 'model.json' : 'weights.bin';
      const outputPath = path.join(dir, filename);
      
      try {
        await downloadFile(url, outputPath);
        console.log(`   ✅ Downloaded ${type} ${fileType}`);
      } catch (error) {
        console.error(`   ❌ Failed to download ${type} ${fileType}:`, error.message);
      }
    }
  }
}

// Example 3: Download from Hugging Face
async function downloadFromHuggingFace() {
  const modelName = 'username/model-name'; // Replace with actual model
  const baseURL = `https://huggingface.co/${modelName}/resolve/main`;
  const files = ['model.json', 'weights.bin'];

  console.log('🤗 Downloading from Hugging Face...');
  
  for (const file of files) {
    const url = `${baseURL}/${file}`;
    const outputPath = path.join('client/public/models/cancer-detection', file);
    
    try {
      await downloadFile(url, outputPath);
      console.log(`   ✅ Downloaded ${file}`);
    } catch (error) {
      console.error(`   ❌ Failed to download ${file}:`, error.message);
    }
  }
}

// Helper function to download files
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(outputPath);
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirects
        return downloadFile(response.headers.location, outputPath)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(outputPath);
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      fs.unlinkSync(outputPath);
      reject(err);
    });
  });
}

// Main execution
async function main() {
  console.log('Choose a download method:');
  console.log('1. GitHub Release (customize repo/version)');
  console.log('2. Direct URL (customize URLs)');
  console.log('3. Hugging Face (customize model name)');
  console.log('\n⚠️  This is an example script.');
  console.log('   Customize it with actual model URLs before running.\n');

  // Uncomment the method you want to use:
  // await downloadFromGitHubRelease();
  // await downloadFromURL();
  // await downloadFromHuggingFace();

  console.log('\n💡 To use this script:');
  console.log('   1. Find actual model URLs (see MODEL_REPOSITORIES.md)');
  console.log('   2. Update the URLs in this script');
  console.log('   3. Run: node scripts/download-model-example.js');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { downloadFile, downloadFromGitHubRelease, downloadFromURL, downloadFromHuggingFace };

