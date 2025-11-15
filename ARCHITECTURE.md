# Architecture Overview

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with functional components and hooks
- **Routing**: React Router v6 for client-side navigation
- **State Management**: Local component state and React Context (can be extended with Redux)
- **Styling**: CSS Modules with CSS variables for theming
- **Animations**: Framer Motion for smooth UI transitions
- **API Communication**: Axios for HTTP requests

### Backend Architecture
- **Framework**: Express.js (minimal backend approach)
- **File Upload**: Multer for handling image uploads
- **Storage**: In-memory arrays (replace with database in production)
- **Encryption**: Blockchain-based encryption module
- **API**: RESTful API design

## Data Flow

### Image Upload & Analysis Flow
1. User captures/selects image → `CameraCapture.js`
2. Image sent to backend → `POST /api/upload`
3. Backend stores image → `uploads/` directory
4. Image data encrypted → `blockchain.encryptData()`
5. Encrypted hash stored → Blockchain storage
6. Frontend requests analysis → Simulated AI analysis
7. Results stored → In-memory `images` array
8. Timeline updated → `Timeline.js` displays results

### Chatbot Flow
1. User sends message → `Chatbot.js`
2. Message sent to backend → `POST /api/chat`
3. Backend fetches user profile → Quiz answers
4. Personalized response generated → Based on profile
5. Symptom detection → Keyword matching
6. Response returned → Displayed in chat UI

### Authentication Flow
1. User registers/logs in → `Register.js` / `Login.js`
2. Credentials sent → `POST /api/register` / `POST /api/login`
3. User data stored → In-memory `users` array
4. Session managed → LocalStorage (frontend)
5. Protected routes → React Router guards

## Component Structure

```
App.js (Root)
├── Login.js
├── Register.js
├── Dashboard.js
│   ├── Navigation cards
│   └── Quick stats
├── CameraCapture.js
│   ├── Webcam component
│   ├── Image preview
│   └── Analysis results
├── Timeline.js
│   ├── Chart visualization
│   └── Image grid
├── Chatbot.js
│   ├── Message list
│   ├── Input form
│   └── Quick questions
└── Profile.js
    ├── Health profile
    └── Recommendations
```

## API Endpoints

### User Management
- `POST /api/register` - Create new user account
- `POST /api/login` - Authenticate user
- `GET /api/user/:userId` - Get user profile

### Image Management
- `POST /api/upload` - Upload image file
- `GET /api/images/:userId` - Get user's images
- `POST /api/analyze/:imageId` - Store analysis results

### Chat
- `POST /api/chat` - Send message to chatbot

## Security Architecture

### Blockchain Encryption
- All image metadata encrypted before storage
- SHA-256 hashing for data integrity
- Blockchain hash stored with each image
- Timestamp verification

### Data Protection
- Passwords stored in plain text (demo only - use bcrypt in production)
- CORS enabled for frontend-backend communication
- File upload validation
- Input sanitization (add more in production)

## Scalability Considerations

### Current Limitations
- In-memory storage (data lost on restart)
- No database persistence
- Simulated AI analysis
- Single server instance

### Production Improvements
1. **Database**: MongoDB or PostgreSQL
2. **File Storage**: AWS S3 or Cloudinary
3. **AI Model**: TensorFlow.js models or ML API
4. **Authentication**: JWT tokens with refresh
5. **Caching**: Redis for session management
6. **Load Balancing**: Multiple server instances
7. **CDN**: Static asset delivery
8. **Monitoring**: Logging and error tracking

## Technology Choices

### Why React?
- Component reusability
- Large ecosystem
- Mobile-responsive design
- Fast development

### Why Express?
- Minimal backend approach
- Fast and lightweight
- Easy to extend
- Good middleware ecosystem

### Why Blockchain?
- Data integrity
- Immutable records
- Decentralized storage
- Security benefits

## Future Enhancements

1. **Real AI Integration**
   - TensorFlow.js models
   - Pre-trained skin cancer detection models
   - Continuous learning

2. **Advanced Features**
   - Multi-user collaboration
   - Doctor dashboard
   - Appointment scheduling
   - Report generation

3. **Mobile Apps**
   - React Native version
   - Native iOS/Android apps
   - Push notifications

4. **Analytics**
   - User behavior tracking
   - Health trend analysis
   - Predictive insights

