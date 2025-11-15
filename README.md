# SkinGuard - AI-Powered Skin Cancer Detection System

A comprehensive mobile-responsive web application for skin cancer detection using AI analysis, featuring blockchain-encrypted cloud storage, personalized health advice, and progress tracking.

## 🎯 Features

- **AI-Powered Cancer Detection**: Analyzes skin images using pattern, shape, and size recognition
- **Mobile-First Design**: Fully responsive interface optimized for mobile devices
- **Blockchain Encryption**: Secure data storage with blockchain-based encryption
- **AI Chatbot**: Personalized health advice based on user profile and quiz responses
- **Progress Timeline**: Track skin condition changes over time with visual timeline
- **Modern UI**: Bold, interactive design with green and white color scheme
- **User Profiles**: Comprehensive health assessment quiz for personalized recommendations

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd cancer-detection-app
   ```

2. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```
   PORT=5000
   JWT_SECRET=your-secret-key-here
   OPENAI_API_KEY=your-openai-api-key-here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend React app on `http://localhost:3000`

## 📁 Project Structure

```
cancer-detection-app/
├── client/                 # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── CameraCapture.js
│   │   │   ├── Timeline.js
│   │   │   ├── Chatbot.js
│   │   │   └── Profile.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/                 # Express backend
│   ├── index.js           # Main server file
│   ├── blockchain.js      # Blockchain encryption
│   └── .env.example
├── uploads/                # Uploaded images (created automatically)
├── package.json
└── README.md
```

## 🎮 Usage

1. **Register/Login**: Create an account and complete the health assessment quiz
2. **Capture Images**: Use the camera feature to take photos of skin areas
3. **View Analysis**: Get AI-powered analysis with risk percentage and recommendations
4. **Track Progress**: View timeline of all scans to monitor changes over time
5. **Chat with AI**: Get personalized advice from the AI chatbot based on your profile
6. **View Profile**: See your health profile and personalized recommendations

## 🔧 Features in Detail

### AI Cancer Detection
- Analyzes patterns (asymmetry, border, color, diameter, evolving)
- Measures shapes and sizes
- Calculates cancer risk percentage (5-35% range for demo)
- Provides actionable recommendations

### Blockchain Encryption
- All user data encrypted using blockchain technology
- Secure cloud storage with hash verification
- Data integrity checks

### Personalized Chatbot
- Answers skin cancer-related questions
- Provides medication and lifestyle recommendations
- Highlights symptoms requiring follow-up
- Tailored advice based on user health profile

### Progress Tracking
- Visual timeline of all scans
- Risk trend charts using Chart.js
- Image comparison over time
- Notes and annotations

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router
- Framer Motion (animations)
- TensorFlow.js (AI analysis)
- Chart.js (progress visualization)
- React Webcam (camera capture)
- Lucide React (icons)

### Backend
- Node.js
- Express.js
- Multer (file uploads)
- Blockchain integration (Web3)
- Minimal backend architecture

## 🔒 Security Considerations

- Implement proper password hashing (bcrypt) in production
- Add JWT authentication for production use
- Use HTTPS in production
- Implement rate limiting
- Add input validation and sanitization
- Use environment variables for sensitive data

## 📝 Development Notes

- The current implementation uses simulated AI analysis for demonstration
- In production, integrate with actual TensorFlow.js models or ML APIs
- Blockchain encryption is simulated; integrate with actual blockchain networks for production
- Backend uses in-memory storage; replace with database (MongoDB, PostgreSQL) for production
- Add proper authentication (JWT tokens) for production use

## 🚨 Important Disclaimer

**This application is for educational and informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health providers with any questions regarding medical conditions.**

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on the repository.

