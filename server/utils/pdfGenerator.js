const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function generatePDF(user, images, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Cover Page
      doc.fontSize(24).text('Skin Health Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).text(`Patient: ${user.name}`, { align: 'center' });
      doc.text(`Email: ${user.email}`, { align: 'center' });
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.addPage();

      // Executive Summary
      doc.fontSize(20).text('Executive Summary', { underline: true });
      doc.moveDown(0.5);
      
      const analyzedImages = images.filter(img => img.analysis);
      const avgRisk = analyzedImages.length > 0
        ? analyzedImages.reduce((sum, img) => sum + img.analysis.cancerPercentage, 0) / analyzedImages.length
        : 0;
      const highRiskCount = analyzedImages.filter(img => img.analysis.cancerPercentage >= 20).length;

      doc.fontSize(12).text(`Total Scans: ${images.length}`);
      doc.text(`Analyzed Scans: ${analyzedImages.length}`);
      doc.text(`Average Risk Level: ${avgRisk.toFixed(1)}%`);
      doc.text(`High Risk Scans (≥20%): ${highRiskCount}`);
      doc.moveDown();

      if (highRiskCount > 0) {
        doc.fontSize(14).fillColor('red').text('⚠️ IMPORTANT: High-risk findings detected. Please consult a dermatologist immediately.', { align: 'center' });
        doc.fillColor('black');
      }
      doc.addPage();

      // Timeline Images with Analysis
      doc.fontSize(20).text('Timeline Analysis', { underline: true });
      doc.moveDown();

      analyzedImages.forEach((image, index) => {
        if (index > 0 && index % 2 === 0) {
          doc.addPage();
        }

        doc.fontSize(14).text(`Scan ${index + 1} - ${new Date(image.uploadedAt).toLocaleDateString()}`, { underline: true });
        doc.moveDown(0.5);
        
        doc.fontSize(12).text(`Risk Level: ${image.analysis.cancerPercentage}%`);
        doc.text(`Size: ${image.analysis.sizes.width} × ${image.analysis.sizes.height} (Area: ${image.analysis.sizes.area})`);
        
        doc.text('Pattern Analysis:');
        Object.entries(image.analysis.patterns).forEach(([key, value]) => {
          doc.text(`  • ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value ? '⚠️ Detected' : '✓ Normal'}`, { indent: 20 });
        });

        if (image.notes) {
          doc.moveDown(0.5);
          doc.text(`Notes: ${image.notes}`);
        }

        doc.moveDown();
      });

      // Recommendations
      doc.addPage();
      doc.fontSize(20).text('Recommendations', { underline: true });
      doc.moveDown();

      const recommendations = [
        'Continue regular monthly self-examinations',
        'Schedule annual dermatologist checkups',
        'Use SPF 30+ sunscreen daily',
        'Avoid peak sun hours (10 AM - 4 PM)',
        'Wear protective clothing when outdoors',
        'Monitor any changes in existing moles',
        'Document new findings with photos'
      ];

      recommendations.forEach(rec => {
        doc.fontSize(12).text(`• ${rec}`, { indent: 20 });
      });

      if (user.quizAnswers) {
        doc.moveDown();
        doc.fontSize(16).text('Personalized Recommendations', { underline: true });
        doc.moveDown(0.5);

        if (user.quizAnswers.skinType === 'fair') {
          doc.fontSize(12).text('• Use SPF 50+ sunscreen (recommended for fair skin)', { indent: 20 });
        }
        if (user.quizAnswers.familyHistory === 'yes') {
          doc.fontSize(12).text('• Schedule more frequent checkups due to family history', { indent: 20 });
        }
        if (user.quizAnswers.sunExposure === 'high') {
          doc.fontSize(12).text('• Consider protective clothing and seeking shade more often', { indent: 20 });
        }
      }

      // Next Steps
      doc.addPage();
      doc.fontSize(20).text('Next Steps', { underline: true });
      doc.moveDown();

      doc.fontSize(12).text('1. Review this report with your healthcare provider');
      doc.text('2. Schedule a dermatologist appointment if you have concerns');
      doc.text('3. Continue tracking your skin health using SkinGuard');
      doc.text('4. Follow the prevention recommendations listed above');
      doc.text('5. Keep this report for your medical records');

      doc.end();

      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generatePDF };

