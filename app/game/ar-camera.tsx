import React, { 
  useEffect, 
  useState,
  useRef,
  useCallback,
} from 'react';
import {
  StyleSheet, 
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import {
  Camera,
  runAsync,
  useCameraDevice,
  useCameraFormat,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { 
  Face,
  useFaceDetector,
} from 'react-native-vision-camera-face-detector';
import { Worklets } from 'react-native-worklets-core';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const QUIZ_DATA = [
  { question: "Apa nama ibukota Indonesia?", left: "Jakarta", right: "Bandung", answer: "left" },
  { question: "Planet terdekat dari Matahari?", left: "Mars", right: "Merkurius", answer: "right" },
  { question: "Simbol kimia untuk air?", left: "H2O", right: "CO2", answer: "left" },
  { question: "Siapa penemu lampu?", left: "Tesla", right: "Thomas Edison", answer: "right" },
];

export default function ARCameraScreen() {
  const [faces, setFaces] = useState<Face[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'left' | 'right' | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [score, setScore] = useState(0);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);

  // Constants for thresholds
  const TILT_THRESHOLD = 15; // Degrees
  const SELECTION_DELAY = 1000; // ms to hold gesture

  const faceDetectionOptions = useRef({
    performanceMode: 'fast',
    contourMode: 'none',
    landmarkMode: 'none',
    classificationMode: 'all' // Enable classification for detailed pose
  }).current;
  
  const device = useCameraDevice('front');
  
  const { detectFaces } = useFaceDetector(faceDetectionOptions);

  const format = useCameraFormat(device, [
    { videoResolution: { width: 1280, height: 720 }, fps: 30 }
  ]);

  const currentQuestion = QUIZ_DATA[currentQuestionIndex];
  
  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setIsPermissionGranted(status === 'granted');
    })();
  }, []);

  const handleDetectedFaces = Worklets.createRunOnJS((detected: Face[]) => {
    setFaces(detected);
  });

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet'
    const detected = detectFaces(frame);
    handleDetectedFaces(detected);
  }, [handleDetectedFaces, detectFaces]);

  // Gesture Recognition Logic
  useEffect(() => {
    if (faces.length > 0 && !isProcessingAnswer) {
      const face = faces[0];
      const rollAngle = face.rollAngle; // Tilt head left/right
      // Note: On Android front camera, rollAngle might be:
      // Positive -> Tilt Left (Ear to Left Shoulder)
      // Negative -> Tilt Right (Ear to Right Shoulder)
      // Need to verify in testing, but typically this is the standard.
      
      // Let's assume standard orientation first
      if (rollAngle > TILT_THRESHOLD) {
         // Head Tilted Left -> Select Left Option
         if (selectedAnswer !== 'left') setSelectedAnswer('left');
      } else if (rollAngle < -TILT_THRESHOLD) {
         // Head Tilted Right -> Select Right Option
         if (selectedAnswer !== 'right') setSelectedAnswer('right');
      } else {
         // Head Upright
         if (selectedAnswer !== null) setSelectedAnswer(null);
      }
    }
  }, [faces, isProcessingAnswer]);

  // Handle Answer Selection Confirmation
  useEffect(() => {
    if (selectedAnswer && !isProcessingAnswer) {
      const timer = setTimeout(() => {
        submitAnswer(selectedAnswer);
      }, SELECTION_DELAY);
      return () => clearTimeout(timer);
    }
  }, [selectedAnswer, isProcessingAnswer]);

  const submitAnswer = (answer: 'left' | 'right') => {
    setIsProcessingAnswer(true);
    const isCorrect = answer === currentQuestion.answer;
    
    if (isCorrect) {
      setScore(s => s + 1);
      Alert.alert('Benar!', `Jawaban ${answer === 'left' ? 'Kiri' : 'Kanan'} benar!`);
    } else {
      Alert.alert('Salah!', `Jawaban yang benar adalah ${currentQuestion.answer === 'left' ? 'Kiri' : 'Kanan'}`);
    }

    setTimeout(() => {
      handleNextQuestion();
      setIsProcessingAnswer(false);
      setSelectedAnswer(null);
    }, 1500);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUIZ_DATA.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      Alert.alert(
        'Quiz Selesai!', 
        `Skor Akhir: ${score}/${QUIZ_DATA.length}`,
        [
          {
            text: 'Mulai Lagi',
            onPress: () => {
              setCurrentQuestionIndex(0);
              setScore(0);
            }
          }
        ]
      );
    }
  };

  if (!device) return <View style={styles.container}><Text style={styles.errorText}>No Device</Text></View>;
  if (!isPermissionGranted) return <View style={styles.container}><Text style={styles.errorText}>No Permission</Text></View>;

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        format={format}
        pixelFormat="yuv"
      />

      <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
        <ArrowLeft color="white" size={24} />
      </TouchableOpacity>

      {/* AR Elements Overlay */}
      {faces.map((face, idx) => {
        // Coordinate mapping
        // Camera coordinates are usually relative to the frame resolution.
        // We need to scale them to the screen size.
        // Simple scaling approach (assuming aspect fill):
        
        // Note: This scaling is approximate and assumes specific aspect ratios.
        // For production, use more robust coordinate mapping logic.
        const scaleX = screenWidth / 1280; // Assuming 720p width mapped to screen width (landscape frame)
        // Wait, format is { width: 1280, height: 720 }. 
        // In portrait mode, the frame is rotated 90deg.
        // Width becomes Height, Height becomes Width in the view.
        // So frame width (1280) maps to screen height? No, frame width is usually the long edge.
        
        // Let's use simple bounds directly for now as they often come pre-scaled or we rely on visual feedback.
        // Or better, center around the face bounds provided by the detector.
        
        // Using face.bounds directly (assuming they match view coordinates or close enough for overlay)
        const faceX = face.bounds.x;
        const faceY = face.bounds.y;
        const faceW = face.bounds.width;
        
        // Calculate Positions
        const foreheadY = faceY - 100; // Above face
        const centerX = faceX + (faceW / 2);
        
        const leftOptionX = faceX - 120; // Left of face
        const rightOptionX = faceX + faceW + 20; // Right of face
        const optionY = faceY + 50; // Eye level

        return (
          <View key={idx} style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* Face Box (Debug) */}
            <View style={{
              position: 'absolute',
              borderWidth: 2,
              borderColor: 'rgba(0,255,0,0.3)',
              left: faceX,
              top: faceY,
              width: face.bounds.width,
              height: face.bounds.height
            }} />

            {/* Question (Forehead) */}
            <View style={[styles.arBubble, {
              top: foreheadY,
              left: centerX - 100, // Center the 200px wide bubble
              width: 200,
            }]}>
              <Text style={styles.questionText}>{currentQuestion.question}</Text>
            </View>

            {/* Left Option */}
            <View style={[styles.optionBubble, {
              top: optionY,
              left: leftOptionX,
              backgroundColor: selectedAnswer === 'left' ? '#10B981' : 'rgba(255,255,255,0.8)',
              transform: [{ scale: selectedAnswer === 'left' ? 1.2 : 1 }]
            }]}>
              <Text style={styles.optionText}>{currentQuestion.left}</Text>
              <Text style={styles.hintText}>Miring Kiri</Text>
            </View>

            {/* Right Option */}
            <View style={[styles.optionBubble, {
              top: optionY,
              left: rightOptionX,
              backgroundColor: selectedAnswer === 'right' ? '#10B981' : 'rgba(255,255,255,0.8)',
              transform: [{ scale: selectedAnswer === 'right' ? 1.2 : 1 }]
            }]}>
              <Text style={styles.optionText}>{currentQuestion.right}</Text>
              <Text style={styles.hintText}>Miring Kanan</Text>
            </View>
          </View>
        );
      })}

      {/* Score & Instructions */}
      <View style={styles.hudContainer}>
        <Text style={styles.scoreText}>Skor: {score}</Text>
        <Text style={styles.instructionText}>
          Miringkan kepala ke Kiri/Kanan untuk memilih jawaban
        </Text>
        {isProcessingAnswer && <Text style={styles.processingText}>Memproses Jawaban...</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  headerButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 2000,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  arBubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionBubble: {
    position: 'absolute',
    width: 100,
    padding: 10,
    borderRadius: 50, // Circular/Oval
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  questionText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1F2937',
  },
  optionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  hintText: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  hudContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  scoreText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  instructionText: {
    color: '#E5E7EB',
    fontSize: 14,
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  processingText: {
    color: '#FCD34D',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  }
});
