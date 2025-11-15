const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const blockchain = require('./blockchain');
const cloudinary = require('./config/cloudinary');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static('uploads'));

// Storage configuration - Use memory storage for Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// In-memory storage (replace with database in production)
let users = [];
let images = [];
let chatHistory = [];

// Routes
app.post('/api/register', (req, res) => {
  const { name, email, password, quizAnswers } = req.body;
  const user = {
    id: Date.now().toString(),
    name,
    email,
    password, // In production, hash this
    quizAnswers,
    createdAt: new Date()
  };
  users.push(user);
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const { userId, notes } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    let cloudinaryUrl = null;
    let cloudinaryPublicId = null;

    // Try to upload to Cloudinary if configured
    const hasCloudinaryConfig = process.env.CLOUDINARY_CLOUD_NAME && 
                                 process.env.CLOUDINARY_API_KEY && 
                                 process.env.CLOUDINARY_API_SECRET;

    if (hasCloudinaryConfig) {
      try {
        console.log('📤 Uploading to Cloudinary...');
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'skin-cancer-detection',
              resource_type: 'image',
              transformation: [{ quality: 'auto', fetch_format: 'auto' }]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });
        cloudinaryUrl = uploadResult.secure_url;
        cloudinaryPublicId = uploadResult.public_id;
        console.log('✅ Cloudinary upload successful');
      } catch (cloudinaryError) {
        console.warn('⚠️ Cloudinary upload failed, using local storage:', cloudinaryError.message);
        // Continue without Cloudinary - we'll use a data URL instead
      }
    } else {
      console.log('ℹ️ Cloudinary not configured, using local storage');
    }

    // If Cloudinary failed or not configured, create a data URL from the buffer
    if (!cloudinaryUrl) {
      const base64Image = req.file.buffer.toString('base64');
      cloudinaryUrl = `data:${req.file.mimetype};base64,${base64Image}`;
    }

    const imageData = {
      id: Date.now().toString(),
      userId,
      filename: req.file.originalname,
      cloudinaryUrl: cloudinaryUrl,
      cloudinaryPublicId: cloudinaryPublicId,
      notes: notes || '',
      uploadedAt: new Date(),
      analysis: null
    };

    // Encrypt data using blockchain
    try {
      const encryptedData = await blockchain.encryptData(imageData, userId);
      imageData.blockchainHash = encryptedData.hash;
      imageData.blockchainTimestamp = encryptedData.timestamp;
      
      // Store encrypted metadata on blockchain
      await blockchain.storeOnBlockchain(encryptedData);
    } catch (blockchainError) {
      console.warn('⚠️ Blockchain encryption failed:', blockchainError.message);
      // Continue without blockchain encryption
    }

    images.push(imageData);
    console.log(`✅ Image saved successfully. Total images: ${images.length}`);
    
    res.json({ success: true, image: imageData });
  } catch (error) {
    console.error('❌ Upload error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: error.message || 'Failed to upload image',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.get('/api/images/:userId', (req, res) => {
  const userImages = images.filter(img => img.userId === req.params.userId);
  res.json({ images: userImages });
});

app.post('/api/analyze/:imageId', (req, res) => {
  const { imageId } = req.params;
  const { cancerPercentage, patterns, shapes, sizes } = req.body;
  
  const image = images.find(img => img.id === imageId);
  if (image) {
    image.analysis = {
      cancerPercentage,
      patterns,
      shapes,
      sizes,
      analyzedAt: new Date()
    };
    res.json({ success: true, analysis: image.analysis });
  } else {
    res.status(404).json({ error: 'Image not found' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId, conversationHistory } = req.body;
    const lowerMessage = message.toLowerCase();
    
    // Get user profile for personalized responses
    const user = users.find(u => u.id === userId);
    
    // Natural response generation based on message content
    let responseMessage = '';
    
    // Check for symptom keywords (expanded)
    const symptomKeywords = ['mole', 'spot', 'lesion', 'change', 'growing', 'bleeding', 'itchy', 'pain', 'suspicious', 'unusual', 'wound', 'sore', 'lump', 'bump', 'rash', 'discoloration', 'texture', 'scaly', 'crusty'];
    const hasSymptoms = symptomKeywords.some(keyword => lowerMessage.includes(keyword));
    
    // Topic-based responses
    if (lowerMessage.includes('sign') || lowerMessage.includes('symptom') || lowerMessage.includes('look like')) {
      responseMessage = `The early signs of skin cancer can vary, but here are key things to watch for using the ABCDE rule:\n\n` +
        `• **Asymmetry**: One half doesn't match the other\n` +
        `• **Border**: Irregular, ragged, or blurred edges\n` +
        `• **Color**: Multiple colors or uneven pigmentation\n` +
        `• **Diameter**: Larger than 6mm (about the size of a pencil eraser)\n` +
        `• **Evolving**: Changes in size, shape, or color over time\n\n` +
        `Other warning signs include new growths, sores that don't heal, or changes in existing moles. If you notice any of these, it's important to consult a dermatologist.`;
    } 
    else if (lowerMessage.includes('prevent') || lowerMessage.includes('prevention') || lowerMessage.includes('protect')) {
      responseMessage = `Great question! Here are effective ways to prevent skin cancer:\n\n` +
        `• **Sunscreen**: Use SPF 30+ (or SPF 50+ for fair skin) daily, even on cloudy days\n` +
        `• **Avoid peak hours**: Stay out of direct sun between 10 AM and 4 PM\n` +
        `• **Protective clothing**: Wear long sleeves, wide-brimmed hats, and UV-blocking sunglasses\n` +
        `• **Seek shade**: Especially during peak sun hours\n` +
        `• **Regular checks**: Perform monthly self-examinations and annual dermatologist visits\n` +
        `• **Avoid tanning beds**: They significantly increase skin cancer risk\n\n` +
        `Remember, prevention is always better than treatment!`;
    }
    else if (lowerMessage.includes('dermatologist') || lowerMessage.includes('doctor') || lowerMessage.includes('when to see')) {
      responseMessage = `You should see a dermatologist if you notice:\n\n` +
        `• Any new or changing moles, spots, or growths\n` +
        `• Sores that don't heal within a few weeks\n` +
        `• Any skin changes that concern you\n` +
        `• A family history of skin cancer (annual checkups recommended)\n` +
        `• Multiple or unusual moles\n\n` +
        `Even without symptoms, annual skin exams are recommended, especially if you have risk factors like fair skin, high sun exposure, or family history. Early detection is key!`;
    }
    else if (lowerMessage.includes('mole') || lowerMessage.includes('suspicious')) {
      responseMessage = `A suspicious mole typically has one or more of these characteristics:\n\n` +
        `• Irregular shape or border\n` +
        `• Multiple colors (brown, black, red, white, blue)\n` +
        `• Larger than 6mm in diameter\n` +
        `• Changes over time (size, shape, color)\n` +
        `• Itches, bleeds, or becomes painful\n` +
        `• Looks different from your other moles\n\n` +
        `${hasSymptoms ? '⚠️ **Important**: Based on what you mentioned, I strongly recommend consulting a dermatologist as soon as possible. ' : ''}` +
        `When in doubt, it's always better to get it checked by a professional.`;
    }
    else if (lowerMessage.includes('check') || lowerMessage.includes('examination') || lowerMessage.includes('self-exam')) {
      responseMessage = `Here's how to perform a thorough skin self-examination:\n\n` +
        `1. **Use a full-length mirror** and a hand mirror\n` +
        `2. **Check everywhere**: Face, neck, ears, scalp, underarms, chest, back, arms, hands, legs, feet, and between toes\n` +
        `3. **Look for**: New moles, changes in existing moles, unusual spots, or sores\n` +
        `4. **Frequency**: Monthly is ideal\n` +
        `5. **Document**: Take photos to track changes over time\n\n` +
        `If you notice anything unusual, don't wait—schedule an appointment with a dermatologist.`;
    }
    else if (lowerMessage.includes('risk') || lowerMessage.includes('chance') || lowerMessage.includes('likely')) {
      responseMessage = `Skin cancer risk factors include:\n\n` +
        `• Fair skin that burns easily\n` +
        `• History of sunburns, especially in childhood\n` +
        `• Excessive sun exposure\n` +
        `• Family or personal history of skin cancer\n` +
        `• Many moles or unusual moles\n` +
        `• Weakened immune system\n` +
        `• Age (risk increases with age)\n\n` +
        `The good news is that most skin cancers are highly treatable when caught early, which is why regular monitoring is so important.`;
    }
    else if (lowerMessage.includes('type') || lowerMessage.includes('kind') || lowerMessage.includes('melanoma') || lowerMessage.includes('basal') || lowerMessage.includes('squamous')) {
      responseMessage = `There are three main types of skin cancer:\n\n` +
        `**1. Basal Cell Carcinoma (BCC)**\n` +
        `• Most common type\n` +
        `• Usually appears as a pearly or waxy bump\n` +
        `• Rarely spreads but should be treated\n\n` +
        `**2. Squamous Cell Carcinoma (SCC)**\n` +
        `• Second most common\n` +
        `• Often appears as a red, scaly patch or sore\n` +
        `• Can spread if not treated early\n\n` +
        `**3. Melanoma**\n` +
        `• Less common but most dangerous\n` +
        `• Can develop from existing moles or appear as new dark spots\n` +
        `• Early detection is crucial\n\n` +
        `All types are treatable when caught early, which is why regular skin checks are essential.`;
    }
    else if (lowerMessage.includes('spf') || lowerMessage.includes('sunscreen') || lowerMessage.includes('sun protection')) {
      responseMessage = `Here's what you need to know about sunscreen:\n\n` +
        `• **SPF 30+** is recommended for daily use (SPF 50+ for fair skin)\n` +
        `• **Broad-spectrum** protects against both UVA and UVB rays\n` +
        `• **Water-resistant** is important if swimming or sweating\n` +
        `• **Apply 15-30 minutes** before sun exposure\n` +
        `• **Reapply every 2 hours**, or after swimming/sweating\n` +
        `• **Use enough**: About 1 ounce (a shot glass full) for full body\n` +
        `• **Don't forget**: Ears, neck, hands, and feet\n\n` +
        `Sunscreen is important even on cloudy days, as UV rays can penetrate clouds.`;
    }
    else if (lowerMessage.includes('treatment') || lowerMessage.includes('treat') || lowerMessage.includes('therapy') || lowerMessage.includes('surgery')) {
      responseMessage = `Skin cancer treatment options depend on the type, size, location, and stage. Here are the main approaches:\n\n` +
        `**Surgical Options:**\n` +
        `• **Excision**: Surgical removal of the cancerous tissue with a margin of healthy skin\n` +
        `• **Mohs Surgery**: Layer-by-layer removal for precise treatment, especially for facial cancers\n` +
        `• **Curettage and Electrodesiccation**: Scraping away cancer cells followed by electric current\n\n` +
        `**Non-Surgical Options:**\n` +
        `• **Topical Medications**: Creams like imiquimod or 5-fluorouracil for superficial cancers\n` +
        `• **Cryotherapy**: Freezing cancer cells with liquid nitrogen\n` +
        `• **Radiation Therapy**: For cases where surgery isn't suitable\n` +
        `• **Photodynamic Therapy**: Light-activated treatment for certain types\n\n` +
        `**Advanced Treatments:**\n` +
        `• **Immunotherapy**: For advanced melanoma, helps immune system fight cancer\n` +
        `• **Targeted Therapy**: Medications targeting specific genetic mutations\n` +
        `• **Chemotherapy**: Usually reserved for advanced cases\n\n` +
        `Early-stage skin cancers are highly curable. Your dermatologist will recommend the best approach based on your specific situation.`;
    }
    else if (lowerMessage.includes('recovery') || lowerMessage.includes('heal') || lowerMessage.includes('after treatment') || lowerMessage.includes('post-treatment')) {
      responseMessage = `Recovery from skin cancer treatment varies by procedure type. Here's what to expect:\n\n` +
        `**Immediate Post-Treatment (First Week):**\n` +
        `• Keep the wound clean and dry as instructed\n` +
        `• Apply prescribed ointments or dressings\n` +
        `• Avoid strenuous activities that might stress the area\n` +
        `• Watch for signs of infection (redness, swelling, pus, fever)\n\n` +
        `**Healing Timeline:**\n` +
        `• Simple excisions: 1-2 weeks for initial healing\n` +
        `• Larger procedures: 2-4 weeks or longer\n` +
        `• Scars typically fade over 6-12 months\n\n` +
        `**Long-term Care:**\n` +
        `• Regular follow-up appointments (every 3-6 months initially)\n` +
        `• Continue sun protection - treated areas are more sensitive\n` +
        `• Monitor for recurrence or new lesions\n` +
        `• Maintain healthy lifestyle to support healing\n\n` +
        `**When to Call Your Doctor:**\n` +
        `• Excessive bleeding, signs of infection, or unusual pain\n` +
        `• New changes in the treated area\n` +
        `• Any concerns about healing progress\n\n` +
        `Most people recover fully and can return to normal activities within a few weeks. Follow your doctor's specific instructions for the best outcome.`;
    }
    else if (lowerMessage.includes('lifestyle') || lowerMessage.includes('diet') || lowerMessage.includes('nutrition') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
      responseMessage = `A healthy lifestyle can support skin health and potentially reduce cancer risk. Here's what research suggests:\n\n` +
        `**Nutrition for Skin Health:**\n` +
        `• **Antioxidant-rich foods**: Berries, leafy greens, tomatoes, carrots (vitamins A, C, E)\n` +
        `• **Omega-3 fatty acids**: Fish, walnuts, flaxseeds (anti-inflammatory)\n` +
        `• **Vitamin D**: Fatty fish, fortified foods (important for immune function)\n` +
        `• **Zinc**: Nuts, seeds, legumes (supports skin healing)\n` +
        `• **Stay hydrated**: Water helps maintain skin elasticity\n\n` +
        `**Lifestyle Factors:**\n` +
        `• **Regular exercise**: Improves circulation and immune function\n` +
        `• **Adequate sleep**: 7-9 hours supports cellular repair\n` +
        `• **Stress management**: Chronic stress can weaken immune system\n` +
        `• **Avoid smoking**: Significantly increases skin cancer risk\n` +
        `• **Limit alcohol**: Excessive consumption may increase risk\n\n` +
        `**Supplements (Consult Doctor First):**\n` +
        `• Vitamin D if deficient\n` +
        `• Omega-3 supplements if not getting from diet\n` +
        `• Avoid excessive vitamin E supplements (may increase risk)\n\n` +
        `Remember, no diet can completely prevent skin cancer, but a balanced, nutrient-rich diet supports overall health and may help your body's natural defenses.`;
    }
    else if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety') || lowerMessage.includes('worried') || lowerMessage.includes('fear')) {
      responseMessage = `It's completely normal to feel stressed or anxious about skin cancer. Here are strategies to manage these feelings:\n\n` +
        `**Emotional Support:**\n` +
        `• **Talk to someone**: Share concerns with family, friends, or a counselor\n` +
        `• **Support groups**: Connect with others who understand your experience\n` +
        `• **Professional help**: Consider therapy if anxiety is overwhelming\n` +
        `• **Stay informed**: Knowledge reduces fear, but avoid excessive online searching\n\n` +
        `**Stress Management Techniques:**\n` +
        `• **Mindfulness/Meditation**: Apps like Headspace or Calm can help\n` +
        `• **Deep breathing**: 4-7-8 technique (inhale 4, hold 7, exhale 8)\n` +
        `• **Regular exercise**: Releases endorphins and reduces stress\n` +
        `• **Adequate sleep**: Poor sleep increases anxiety\n` +
        `• **Limit news/online research**: Set boundaries on health information consumption\n\n` +
        `**Practical Steps:**\n` +
        `• **Focus on prevention**: Taking action (sunscreen, checks) reduces helplessness\n` +
        `• **Regular monitoring**: Knowing you're being proactive can ease worry\n` +
        `• **Prepare questions**: Write down concerns before doctor visits\n` +
        `• **Celebrate small wins**: Acknowledge positive steps you're taking\n\n` +
        `Remember, most skin cancers are highly treatable when caught early. Taking preventive action and staying vigilant gives you control and peace of mind.`;
    }
    else if (lowerMessage.includes('early detection') || lowerMessage.includes('catch early') || lowerMessage.includes('screening')) {
      responseMessage = `Early detection is crucial for successful treatment. Here are comprehensive methods:\n\n` +
        `**Self-Examination Techniques:**\n` +
        `• **Monthly full-body checks**: Use mirrors to see all areas\n` +
        `• **Photography**: Take photos of moles to track changes over time\n` +
        `• **Mole mapping**: Document location, size, and appearance of all moles\n` +
        `• **Partner assistance**: Have someone check hard-to-see areas (back, scalp)\n\n` +
        `**Professional Screening:**\n` +
        `• **Annual dermatologist exams**: Essential for high-risk individuals\n` +
        `• **Dermoscopy**: Specialized tool for detailed mole examination\n` +
        `• **Total body photography**: Professional baseline images for comparison\n` +
        `• **Digital mole mapping**: Computer-assisted tracking system\n\n` +
        `**Technology-Assisted Detection:**\n` +
        `• **AI-powered apps**: Can help identify suspicious lesions (not a replacement for doctor)\n` +
        `• **Smartphone attachments**: Dermoscopes that connect to phones\n` +
        `• **Telemedicine**: Remote consultations for initial assessments\n\n` +
        `**High-Risk Monitoring:**\n` +
        `• **More frequent exams**: Every 3-6 months if you have risk factors\n` +
        `• **Genetic testing**: May be recommended with strong family history\n` +
        `• **Specialized surveillance**: For those with many atypical moles\n\n` +
        `The key is consistency - regular monitoring helps catch changes early when treatment is most effective.`;
    }
    else if (lowerMessage.includes('family') || lowerMessage.includes('genetic') || lowerMessage.includes('hereditary') || lowerMessage.includes('inherited')) {
      responseMessage = `Family history is an important risk factor for skin cancer. Here's what you should know:\n\n` +
        `**Genetic Risk Factors:**\n` +
        `• **Family history**: Having a first-degree relative (parent, sibling, child) with melanoma increases your risk 2-3x\n` +
        `• **Multiple affected relatives**: Risk increases further\n` +
        `• **Genetic mutations**: Some families carry specific gene mutations (CDKN2A, CDK4)\n` +
        `• **Atypical mole syndrome**: Familial tendency to develop many unusual moles\n\n` +
        `**What This Means for You:**\n` +
        `• **More frequent screenings**: Annual or semi-annual dermatologist visits\n` +
        `• **Earlier screening**: Start regular exams in your 20s or earlier\n` +
        `• **Enhanced vigilance**: More thorough self-examinations\n` +
        `• **Genetic counseling**: May be recommended for strong family history\n\n` +
        `**Prevention Strategies:**\n` +
        `• **Strict sun protection**: SPF 50+, protective clothing, avoid peak hours\n` +
        `• **Avoid tanning beds**: Especially important with family history\n` +
        `• **Regular monitoring**: Monthly self-checks, professional exams\n` +
        `• **Educate family**: Share prevention strategies with relatives\n\n` +
        `**For Family Planning:**\n` +
        `• **Genetic counseling**: Discuss inheritance patterns if planning children\n` +
        `• **Early education**: Teach children sun safety from young age\n` +
        `• **Family screening**: Encourage relatives to get regular checkups\n\n` +
        `While family history increases risk, it doesn't guarantee you'll develop skin cancer. Proactive prevention and monitoring significantly reduce your risk.`;
    }
    else if (lowerMessage.includes('insurance') || lowerMessage.includes('cost') || lowerMessage.includes('price') || lowerMessage.includes('expensive') || lowerMessage.includes('afford')) {
      responseMessage = `Understanding insurance and costs for skin cancer care:\n\n` +
        `**Insurance Coverage:**\n` +
        `• **Preventive care**: Annual skin exams are often covered as preventive screening\n` +
        `• **Diagnostic procedures**: Biopsies and tests typically covered with copay\n` +
        `• **Treatment**: Surgery and procedures covered, but deductibles/coinsurance apply\n` +
        `• **Check your plan**: Review coverage for dermatology services\n\n` +
        `**Cost-Saving Strategies:**\n` +
        `• **Preventive focus**: Early detection is much cheaper than advanced treatment\n` +
        `• **In-network providers**: Use doctors within your insurance network\n` +
        `• **HSAs/FSAs**: Use health savings accounts for eligible expenses\n` +
        `• **Payment plans**: Many clinics offer payment arrangements\n` +
        `• **Financial assistance**: Some hospitals/clinics have assistance programs\n\n` +
        `**Typical Costs (Varies by Location/Insurance):**\n` +
        `• **Annual exam**: $100-300 (often covered as preventive)\n` +
        `• **Biopsy**: $200-500\n` +
        `• **Simple excision**: $500-1,500\n` +
        `• **Mohs surgery**: $1,000-3,000+\n` +
        `• **Advanced treatment**: Varies significantly\n\n` +
        `**Questions to Ask:**\n` +
        `• Is this procedure covered?\n` +
        `• What's my copay/coinsurance?\n` +
        `• Do I need pre-authorization?\n` +
        `• Are there less expensive alternatives?\n\n` +
        `Remember: Investing in prevention and early detection saves money and potentially your life. Don't delay care due to cost concerns - discuss payment options with your provider.`;
    }
    else if (lowerMessage.includes('support') || lowerMessage.includes('group') || lowerMessage.includes('community') || lowerMessage.includes('help')) {
      responseMessage = `Support resources are available for those dealing with skin cancer concerns:\n\n` +
        `**Support Groups:**\n` +
        `• **Local groups**: Check with hospitals, cancer centers, or dermatology clinics\n` +
        `• **Online communities**: Forums and social media groups for skin cancer survivors\n` +
        `• **National organizations**: American Cancer Society, Skin Cancer Foundation\n` +
        `• **Peer support**: Connect with others who've had similar experiences\n\n` +
        `**Professional Support:**\n` +
        `• **Oncology social workers**: Help navigate treatment and emotional challenges\n` +
        `• **Counselors/Therapists**: Specialized in cancer-related anxiety and stress\n` +
        `• **Patient navigators**: Help coordinate care and resources\n\n` +
        `**Educational Resources:**\n` +
        `• **Skin Cancer Foundation**: Comprehensive information and support\n` +
        `• **American Academy of Dermatology**: Patient resources and find-a-derm tool\n` +
        `• **Cancer support helplines**: 24/7 support and information\n\n` +
        `**For Caregivers:**\n` +
        `• **Caregiver support groups**: Resources for family members\n` +
        `• **Educational materials**: Understanding treatment and recovery\n` +
        `• **Respite care**: Taking care of yourself while supporting others\n\n` +
        `**Financial Support:**\n` +
        `• **Patient assistance programs**: Help with treatment costs\n` +
        `• **Transportation assistance**: Getting to appointments\n` +
        `• **Prescription assistance**: Programs for medication costs\n\n` +
        `You don't have to face this alone. Reach out to support resources - they can provide information, emotional support, and practical help.`;
    }
    else if (lowerMessage.includes('clinical trial') || lowerMessage.includes('research') || lowerMessage.includes('study') || lowerMessage.includes('experimental')) {
      responseMessage = `Clinical trials are research studies that test new treatments. Here's what you should know:\n\n` +
        `**What Are Clinical Trials?**\n` +
        `• Research studies testing new treatments, drugs, or procedures\n` +
        `• Carefully designed and monitored by medical professionals\n` +
        `• Follow strict ethical guidelines and safety protocols\n` +
        `• May offer access to cutting-edge treatments not yet widely available\n\n` +
        `**Types of Trials:**\n` +
        `• **Prevention trials**: Test ways to prevent skin cancer\n` +
        `• **Screening trials**: Better methods for early detection\n` +
        `• **Treatment trials**: New therapies for existing cancers\n` +
        `• **Quality of life trials**: Improving life during/after treatment\n\n` +
        `**Who Can Participate?**\n` +
        `• Eligibility varies by trial - specific criteria must be met\n` +
        `• May include age, cancer type/stage, previous treatments, health status\n` +
        `• Your doctor can help determine if you're a candidate\n\n` +
        `**Benefits and Considerations:**\n` +
        `• **Potential benefits**: Access to new treatments, close monitoring, contributing to research\n` +
        `• **Risks**: Unknown side effects, may not work, time commitment\n` +
        `• **Costs**: Often covered by trial sponsor, but verify coverage\n\n` +
        `**Finding Trials:**\n` +
        `• **ClinicalTrials.gov**: Comprehensive database of trials\n` +
        `• **Ask your doctor**: They may know of relevant trials\n` +
        `• **Cancer centers**: Major centers often conduct trials\n\n` +
        `Participation is always voluntary, and you can withdraw at any time. Discuss with your healthcare team whether a clinical trial might be right for you.`;
    }
    else if (lowerMessage.includes('medication') || lowerMessage.includes('drug') || lowerMessage.includes('medicine') || lowerMessage.includes('interaction')) {
      responseMessage = `Understanding medications and skin cancer:\n\n` +
        `**Medications That May Increase Risk:**\n` +
        `• **Immunosuppressants**: Used after organ transplants (significantly increase risk)\n` +
        `• **Some antibiotics**: Long-term use of certain types\n` +
        `• **Psoralen + UVA (PUVA)**: Used for psoriasis treatment\n` +
        `• **Always discuss**: Your doctor should know all medications you're taking\n\n` +
        `**Medications for Treatment:**\n` +
        `• **Topical treatments**: Imiquimod, 5-fluorouracil for superficial cancers\n` +
        `• **Targeted therapy**: For advanced melanoma with specific mutations\n` +
        `• **Immunotherapy**: Checkpoint inhibitors for advanced cases\n` +
        `• **Chemotherapy**: Usually for advanced/metastatic disease\n\n` +
        `**Drug Interactions:**\n` +
        `• **Tell all providers**: Dermatologist, primary care, specialists about all medications\n` +
        `• **Supplements matter**: Even vitamins can interact with treatments\n` +
        `• **Over-the-counter**: Some OTC drugs may affect healing or increase sensitivity\n\n` +
        `**During Treatment:**\n` +
        `• **Follow instructions**: Take medications exactly as prescribed\n` +
        `• **Report side effects**: Contact your doctor about any concerns\n` +
        `• **Don't stop abruptly**: Unless directed by your doctor\n` +
        `• **Keep a medication list**: Include all prescriptions, OTC, and supplements\n\n` +
        `**Prevention Considerations:**\n` +
        `• **Photosensitivity**: Some medications increase sun sensitivity\n` +
        `• **Extra protection needed**: If on photosensitizing drugs\n` +
        `• **Ask your pharmacist**: About sun sensitivity with new prescriptions\n\n` +
        `Always maintain open communication with your healthcare team about all medications you're taking.`;
    }
    else if (lowerMessage.includes('mole mapping') || lowerMessage.includes('dermoscopy') || lowerMessage.includes('dermatoscope')) {
      responseMessage = `Mole mapping and dermoscopy are advanced tools for tracking and examining skin lesions:\n\n` +
        `**Mole Mapping:**\n` +
        `• **Total body photography**: Professional photos of your entire body\n` +
        `• **Baseline documentation**: Creates a record to compare future changes\n` +
        `• **Digital tracking**: Computer systems help organize and compare images\n` +
        `• **Ideal for**: People with many moles or high risk\n\n` +
        `**Benefits:**\n` +
        `• **Early change detection**: Easier to spot subtle changes over time\n` +
        `• **Reduced unnecessary biopsies**: Better tracking means fewer false alarms\n` +
        `• **Peace of mind**: Knowing you have comprehensive documentation\n` +
        `• **Family history**: Especially valuable if you have genetic risk factors\n\n` +
        `**Dermoscopy:**\n` +
        `• **Specialized microscope**: Allows doctors to see beneath skin surface\n` +
        `• **Pattern recognition**: Identifies specific features of lesions\n` +
        `• **Improved accuracy**: Better than naked-eye examination\n` +
        `• **Non-invasive**: No cutting or discomfort\n\n` +
        `**What to Expect:**\n` +
        `• **Photography session**: 30-60 minutes for full body mapping\n` +
        `• **Regular updates**: Annual or semi-annual re-photography\n` +
        `• **Comparison analysis**: Doctor compares new images to baseline\n` +
        `• **Insurance coverage**: Often covered for high-risk patients\n\n` +
        `**At-Home Tools:**\n` +
        `• **Smartphone apps**: Can help track moles (not diagnostic)\n` +
        `• **Phone attachments**: Consumer dermoscopes available\n` +
        `• **Regular photos**: Simple camera can help track changes\n\n` +
        `These tools are especially valuable if you have many moles, atypical moles, or a family history of melanoma. Ask your dermatologist if mole mapping would benefit you.`;
    }
    else if (lowerMessage.includes('biopsy') || lowerMessage.includes('test') || lowerMessage.includes('diagnosis') || lowerMessage.includes('pathology')) {
      responseMessage = `Understanding biopsies and the diagnostic process:\n\n` +
        `**What is a Biopsy?**\n` +
        `• **Removal of tissue**: Small sample of suspicious skin for laboratory analysis\n` +
        `• **Definitive diagnosis**: Only way to confirm if something is cancerous\n` +
        `• **Quick procedure**: Usually takes 10-15 minutes\n` +
        `• **Local anesthesia**: Numbing makes it relatively painless\n\n` +
        `**Types of Biopsies:**\n` +
        `• **Shave biopsy**: Shaving off top layers (for surface lesions)\n` +
        `• **Punch biopsy**: Small circular tool removes deeper sample\n` +
        `• **Excisional biopsy**: Removing entire lesion (if small)\n` +
        `• **Incisional biopsy**: Removing part of larger lesion\n\n` +
        `**The Process:**\n` +
        `• **Preparation**: Area cleaned, local anesthetic injected\n` +
        `• **Sample removal**: Doctor removes tissue sample\n` +
        `• **Wound care**: Usually just a small bandage\n` +
        `• **Lab analysis**: Pathologist examines tissue under microscope\n` +
        `• **Results**: Typically available in 1-2 weeks\n\n` +
        `**After the Biopsy:**\n` +
        `• **Keep clean and dry**: Follow wound care instructions\n` +
        `• **Watch for infection**: Redness, swelling, pus, fever\n` +
        `• **Minimal scarring**: Usually heals with small mark\n` +
        `• **Results discussion**: Doctor will explain findings and next steps\n\n` +
        `**Understanding Results:**\n` +
        `• **Benign**: Not cancerous, no further treatment needed\n` +
        `• **Malignant**: Cancerous, treatment plan will be discussed\n` +
        `• **Atypical**: Unusual but not clearly cancerous, may need monitoring\n\n` +
        `Biopsies are routine, safe procedures. Don't hesitate to get one if your doctor recommends it - early diagnosis is crucial.`;
    }
    else if (lowerMessage.includes('alternative') || lowerMessage.includes('natural') || lowerMessage.includes('herbal') || lowerMessage.includes('home remedy')) {
      responseMessage = `It's important to approach alternative therapies with caution and medical guidance:\n\n` +
        `**Important First:**\n` +
        `• **Not a replacement**: Alternative therapies should never replace medical treatment\n` +
        `• **Discuss with doctor**: Always inform your healthcare team about any supplements or alternative treatments\n` +
        `• **Evidence-based**: Stick to treatments with scientific backing\n\n` +
        `**Complementary Approaches (Supportive, Not Curative):**\n` +
        `• **Stress reduction**: Meditation, yoga, acupuncture (may help with treatment side effects)\n` +
        `• **Nutrition**: Healthy diet supports overall health and healing\n` +
        `• **Exercise**: Moderate activity supports immune function\n` +
        `• **Sleep**: Adequate rest supports recovery\n\n` +
        `**What to Avoid:**\n` +
        `• **Unproven "cures"**: Be skeptical of claims to cure cancer\n` +
        `• **Dangerous substances**: Some "natural" treatments can be harmful\n` +
        `• **Delaying treatment**: Don't postpone medical care for unproven alternatives\n` +
        `• **Drug interactions**: Herbal supplements can interfere with medications\n\n` +
        `**Evidence-Based Supplements (Discuss with Doctor):**\n` +
        `• **Vitamin D**: If deficient, may support immune function\n` +
        `• **Omega-3**: Anti-inflammatory properties\n` +
        `• **Avoid megadoses**: More isn't always better, can be harmful\n\n` +
        `**Red Flags:**\n` +
        `• Claims to "cure" cancer\n` +
        `• Pressure to avoid medical treatment\n` +
        `• Secret formulas or ingredients\n` +
        `• Testimonials instead of research\n\n` +
        `The best approach combines proven medical treatments with healthy lifestyle choices. Always discuss any alternative therapies with your healthcare team to ensure they're safe and won't interfere with your treatment.`;
    }
    else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      responseMessage = `You're very welcome! I'm here to help with any questions about skin health, prevention, or early detection. Feel free to ask me anything else!`;
    }
    else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      responseMessage = `Hello! I'm here to help you with questions about skin cancer, prevention, early detection, and general skin health. What would you like to know?`;
    }
    else {
      // General helpful response
      responseMessage = `I understand you're asking about "${message}". `;
      
      if (hasSymptoms) {
        responseMessage += `\n\n⚠️ **Important**: Based on the symptoms you mentioned, I strongly recommend consulting a dermatologist as soon as possible. `;
      }
      
      responseMessage += `I'm here to help with skin cancer awareness, prevention, and early detection. `;
      
      // Add personalized advice if available
      if (user && user.quizAnswers) {
        const { quizAnswers } = user;
        if (quizAnswers.skinType === 'fair') {
          responseMessage += `Given your fair skin type, I'd especially recommend using SPF 50+ sunscreen and being extra cautious with sun exposure. `;
        }
        if (quizAnswers.familyHistory === 'yes') {
          responseMessage += `Since you have a family history of skin cancer, regular dermatologist checkups are particularly important. `;
        }
      }
      
      responseMessage += `\n\nCould you tell me more about what specifically you'd like to know? I can help with:\n` +
        `• Signs and symptoms of skin cancer\n` +
        `• Prevention strategies\n` +
        `• When to see a dermatologist\n` +
        `• How to perform self-examinations\n` +
        `• Understanding different types of skin cancer\n` +
        `• Treatment options and recovery\n` +
        `• Lifestyle and nutrition for skin health\n` +
        `• Stress management and support resources\n` +
        `• Insurance and cost considerations\n` +
        `• Family history and genetic factors\n` +
        `• Biopsy and diagnostic procedures\n` +
        `• Mole mapping and advanced screening`;
    }
    
    const response = {
      message: responseMessage
    };
    
    chatHistory.push({ userId, message, response, timestamp: new Date() });
    res.json({ success: true, response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`📤 Fetching user profile for ID: ${userId}`);
    console.log(`📊 Total users in database: ${users.length}`);
    
    const user = users.find(u => u.id === userId);
    if (user) {
      console.log(`✅ User found: ${user.name} (${user.email})`);
      res.json({ user });
    } else {
      console.warn(`⚠️ User not found with ID: ${userId}`);
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// OAuth Routes
app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    
    // Check if user exists by email or Google ID
    let user = users.find(u => u.email === email || u.googleId === googleId);
    
    if (!user) {
      // Create new user
      user = {
        id: Date.now().toString(),
        name,
        email,
        googleId,
        profilePicture: picture,
        createdAt: new Date(),
        quizAnswers: null
      };
      users.push(user);
    } else {
      // Update existing user with Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.profilePicture = picture;
      }
    }
    
    res.json({ 
      success: true, 
      user: { id: user.id, name: user.name, email: user.email, profilePicture: user.profilePicture } 
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(401).json({ success: false, error: 'Invalid Google token' });
  }
});

app.post('/api/auth/facebook', async (req, res) => {
  try {
    const { accessToken, userID, name, email, picture } = req.body;
    
    // Verify Facebook token (simplified - in production, verify with Facebook API)
    // For now, we'll trust the client-side verification
    
    // Check if user exists
    let user = users.find(u => u.email === email || u.facebookId === userID);
    
    if (!user) {
      // Create new user
      user = {
        id: Date.now().toString(),
        name,
        email,
        facebookId: userID,
        profilePicture: picture?.data?.url,
        createdAt: new Date(),
        quizAnswers: null
      };
      users.push(user);
    } else {
      // Update existing user
      if (!user.facebookId) {
        user.facebookId = userID;
        user.profilePicture = picture?.data?.url;
      }
    }
    
    res.json({ 
      success: true, 
      user: { id: user.id, name: user.name, email: user.email, profilePicture: user.profilePicture } 
    });
  } catch (error) {
    console.error('Facebook OAuth error:', error);
    res.status(401).json({ success: false, error: 'Invalid Facebook token' });
  }
});

// PDF Generation Endpoint
app.get('/api/generate-pdf/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userImages = images.filter(img => img.userId === userId);
    
    if (userImages.length === 0) {
      return res.status(400).json({ error: 'No images found for this user' });
    }

    const pdfGenerator = require('./utils/pdfGenerator');
    const outputPath = path.join(__dirname, '..', 'temp', `report-${userId}-${Date.now()}.pdf`);
    
    // Ensure temp directory exists
    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    await pdfGenerator.generatePDF(user, userImages, outputPath);
    
    res.download(outputPath, `SkinGuard-Report-${user.name}-${Date.now()}.pdf`, (err) => {
      if (err) {
        console.error('PDF download error:', err);
        res.status(500).json({ error: 'Error downloading PDF' });
      } else {
        // Clean up temp file after a delay
        setTimeout(() => {
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
          }
        }, 5000);
      }
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

