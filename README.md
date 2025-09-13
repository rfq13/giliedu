# AR Educational Guessing Game

A cross-platform mobile educational game with AR head gesture controls, built with Expo and React Native.

## 🎯 Features

### Core Gameplay
- **AR Head Tracking**: Questions appear on your forehead using camera overlay
- **Gesture Controls**: Tilt left/right to select answers A/B
- **Educational Content**: Science, History, Math, Language, Geography, and Art questions
- **Point System**: Earn points based on difficulty (Easy: 10pts, Medium: 20pts, Hard: 30pts)

### Game Modes
- **Single Player**: Practice mode with AR gesture detection
- **Party Mode**: Multiplayer fun where others can see the question
- **Daily Challenge**: Special high-difficulty questions with bonus points

### Progression System
- **Leveling**: Progress through levels based on total points
- **Achievements**: Unlock badges for various accomplishments
- **Category Progress**: Track mastery in different subjects
- **Leaderboard**: Compete with players worldwide

### Social Features
- **Multiplayer Support**: Up to 8 players in party mode
- **Real-time Leaderboards**: See your ranking among all players
- **Achievement Sharing**: Show off your educational progress

## 🏗️ Technical Architecture

### Frontend (React Native + Expo)
```
app/
├── (tabs)/                 # Tab navigation structure
│   ├── index.tsx          # Home screen with player stats
│   ├── game.tsx           # Game mode selection
│   ├── leaderboard.tsx    # Global rankings
│   └── profile.tsx        # User profile and settings
├── game/                  # Game screens
│   ├── ar-camera.tsx      # Main AR game interface
│   ├── single-player.tsx  # Single player setup
│   └── party-mode.tsx     # Multiplayer setup
└── _layout.tsx           # Root navigation setup
```

### Services Layer
```
services/
├── questionService.ts     # Question management and filtering
├── arService.ts          # AR tracking and gesture detection
└── gameService.ts        # Game session management
```

### Type Definitions
```
types/
└── game.ts               # TypeScript interfaces for all game objects
```

## 🔧 AR Implementation

### Current Status
The app includes a **simulation layer** that demonstrates all AR features:
- Mock head gesture detection
- Camera overlay with question positioning
- Gesture confidence calculation
- Real-time feedback visualization

### Production AR Integration

For full AR functionality, you'll need to integrate:

#### iOS (ARKit)
```bash
# Install ARKit dependencies
expo install expo-gl expo-gl-cpp expo-three

# Add to app.json
{
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription": "This app uses AR for educational games"
    }
  }
}
```

#### Android (ARCore)
```bash
# Install ARCore dependencies  
expo install expo-camera expo-gl

# Add to app.json
{
  "android": {
    "permissions": ["android.permission.CAMERA"],
    "versionCode": 1
  }
}
```

#### Native AR Code Integration
Replace the simulation in `services/arService.ts` with:

```typescript
// iOS ARKit integration
import { ARKit } from 'expo-arkit'; // Hypothetical package

// Android ARCore integration  
import { ARCore } from 'expo-arcore'; // Hypothetical package

export class ARService {
  async initializeNative(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      return await ARKit.initialize();
    } else {
      return await ARCore.initialize();
    }
  }

  startNativeTracking(): void {
    if (Platform.OS === 'ios') {
      ARKit.startFaceTracking(this.handleFaceData);
    } else {
      ARCore.startFaceTracking(this.handleFaceData);
    }
  }

  private handleFaceData = (faceData: any) => {
    const gesture = this.convertToGesture(faceData.headPose);
    this.callbacks.forEach(callback => callback(gesture));
  }
}
```

## 🎮 Game Mechanics

### Head Gesture Detection
```typescript
// Gesture thresholds
const GESTURE_THRESHOLD = 15; // degrees
const CONFIDENCE_THRESHOLD = 0.6;

// Detection logic
if (headRotation.y > GESTURE_THRESHOLD) {
  gesture = 'right'; // Answer B
} else if (headRotation.y < -GESTURE_THRESHOLD) {
  gesture = 'left';  // Answer A  
} else {
  gesture = 'center'; // Neutral
}
```

### Scoring System
- **Easy Questions**: 10 points
- **Medium Questions**: 20 points  
- **Hard Questions**: 30 points
- **Bonus Multipliers**: Speed bonuses, streak bonuses
- **Level Progression**: Every 100 points = 1 level

### Question Management
```typescript
// Dynamic question filtering
const questions = QuestionService.getRandomQuestions(10, {
  category: 'Science',      // Optional filter
  difficulty: 'medium',     // easy, medium, hard, or mixed
  excludeUsed: true        // Don't repeat questions
});
```

## 📱 Installation & Setup

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd ar-educational-game

# Install dependencies
npm install

# Start development server
npm run dev

# Run on iOS
npx expo run:ios

# Run on Android  
npx expo run:android
```

### Environment Setup
```bash
# For Supabase integration (optional)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎯 Recommended Next Steps

### 1. Database Integration
- Set up Supabase for question storage
- Implement user authentication  
- Add real-time leaderboards
- Store game session history

### 2. Native AR Implementation
- Integrate ARKit (iOS) and ARCore (Android)
- Implement face mesh detection
- Add 3D question positioning
- Optimize tracking performance

### 3. Enhanced Features
- Voice commands for accessibility
- Custom question creation
- Social features (friends, challenges)
- Offline mode support

### 4. Production Optimizations
- Image optimization
- Bundle size reduction
- Performance monitoring
- Crash reporting

## 🛠️ Development Tools

### Recommended Libraries
- **expo-camera**: Camera access and controls
- **expo-gl**: 3D graphics and AR rendering  
- **react-native-reanimated**: Smooth animations
- **@react-navigation/**: Navigation management
- **@supabase/supabase-js**: Backend services

### Testing Strategy
- **Unit Tests**: Services and utility functions
- **Integration Tests**: Game flow and AR detection  
- **E2E Tests**: Complete user journeys
- **Device Testing**: Multiple devices and OS versions

## 📊 Analytics & Monitoring

### Key Metrics
- **User Engagement**: Session duration, retention
- **Educational Impact**: Question accuracy, learning progress
- **Technical Performance**: AR tracking quality, crash rates
- **Social Features**: Multiplayer participation, leaderboard activity

### Implementation
```typescript
// Example analytics integration
import { Analytics } from 'expo-analytics';

// Track game events
Analytics.track('game_started', {
  mode: 'single_player',
  difficulty: 'medium',
  category: 'science'
});

Analytics.track('question_answered', {
  correct: true,
  time_taken: 5.2,
  confidence: 0.87
});
```

## 🚀 Deployment

### Expo Application Services (EAS)
```bash
# Configure EAS
npm install -g @expo/eos-cli
eas build:configure

# Build for production
eas build --platform ios
eas build --platform android

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

### App Store Requirements
- **iOS**: ARKit support requires iOS 11+
- **Android**: ARCore support requires Android 7.0+
- **Permissions**: Camera access for AR features
- **Age Rating**: Educational content appropriate for all ages

---

This educational AR game combines cutting-edge technology with engaging educational content to create a unique learning experience. The modular architecture makes it easy to extend with new features, question categories, and AR capabilities.