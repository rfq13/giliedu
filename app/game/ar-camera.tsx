import React, { 
  useEffect, 
  useState,
  useRef,
} from 'react';
import {
  StyleSheet, 
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Alert,
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

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const QUIZ_DATA = [
  { question: "Apa nama ibukota Indonesia?", answer: "Jakarta" },
  { question: "Planet terdekat dari Matahari?", answer: "Merkurius" },
  { question: "Simbol kimia untuk air?", answer: "H2O" },
  { question: "Siapa penemu lampu?", answer: "Thomas Edison" },
];

export default function App() {
  const [faces, setFaces] = useState<Face[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [score, setScore] = useState(0);

  const faceDetectionOptions = useRef({}).current;
  const device = useCameraDevice('front');
  
  const { detectFaces, stopListeners } = useFaceDetector(faceDetectionOptions);

  const format = useCameraFormat(device, [
    { videoResolution: { width: 1280, height: 720 }, fps: 30 }
  ]);

  const currentQuestion = QUIZ_DATA[currentQuestionIndex];
  
  useEffect(() => stopListeners, []);
  
  useEffect(() => {
    if (device) {
      (async () => {
        const status = await Camera.requestCameraPermission();
        setIsPermissionGranted(status === 'granted');
      })();
    }
  }, [device]);

  const handleDetectedFaces = Worklets.createRunOnJS((detected: Face[], frame) => {
    setFaces(detected);
  });

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet'
    if (detectFaces) {
      runAsync(frame, () => {
        'worklet'
        const detected = detectFaces(frame);
        handleDetectedFaces(detected, frame);
      });
    }
  }, [handleDetectedFaces, detectFaces]);

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUIZ_DATA.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswer(false);
    } else {
      Alert.alert(
        'Quiz Selesai!', 
        `Anda telah menyelesaikan semua pertanyaan!\nSkor: ${score}/${QUIZ_DATA.length}`,
        [
          {
            text: 'Mulai Lagi',
            onPress: () => {
              setCurrentQuestionIndex(0);
              setShowAnswer(false);
              setScore(0);
            }
          }
        ]
      );
    }
  };

  const handleCorrectAnswer = () => {
    setScore(score + 1);
    Alert.alert('Benar!', 'Jawaban Anda benar!');
    setTimeout(handleNextQuestion, 1500);
  };

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Kamera tidak tersedia</Text>
      </View>
    );
  }

  if (!isPermissionGranted) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Izin kamera diperlukan untuk AR</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        format={format}
      />

      {/* Face Detection Overlay */}
      {faces.map((face, idx) => {
        // Remove unnecessary scaling since we're already in screen coordinates
        let top = face.bounds.y;
        let left = face.bounds.x;
        let boxWidth = face.bounds.width;
        let boxHeight = face.bounds.height;

        // Adjust for front camera mirroring
        if (device?.position === "front") {
          left = screenWidth - (left + boxWidth);
        }

        // Center the box more precisely on the face
        const adjustedWidth = boxWidth * 0.8; // Reduce width by 20%
        const adjustedHeight = boxHeight * 0.8; // Reduce height by 20%
        const centerOffsetX = (boxWidth - adjustedWidth) / 2;
        const centerOffsetY = (boxHeight - adjustedHeight) / 2;

        return (
          <View
            key={idx}
            style={{
              position: "absolute",
              borderWidth: 2,
              borderColor: "lime",
              left: left + centerOffsetX,
              top: top + centerOffsetY,
              width: adjustedWidth,
              height: adjustedHeight,
              zIndex: 1000,
            }}
          />
        );
      })}

      {/* AR Quiz Overlay */}
      <View style={styles.overlay}>
        {/* Question Card */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>
            Pertanyaan {currentQuestionIndex + 1}/{QUIZ_DATA.length}
          </Text>
          <Text style={styles.questionContent}>{currentQuestion.question}</Text>
          
          {showAnswer && (
            <View style={styles.answerContainer}>
              <Text style={styles.answerText}>Jawaban: {currentQuestion.answer}</Text>
              <TouchableOpacity style={styles.correctButton} onPress={handleCorrectAnswer}>
                <Text style={styles.buttonText}>Benar ✓</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {!showAnswer && (
            <TouchableOpacity style={styles.showAnswerButton} onPress={handleShowAnswer}>
              <Text style={styles.buttonText}>Tampilkan Jawaban</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Score Display */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Skor: {score}/{QUIZ_DATA.length}</Text>
        </View>

        {/* Face Detection Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {faces.length > 0 ? `${faces.length} wajah terdeteksi` : 'Arahkan kamera ke wajah'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    padding: 20,
  },
  questionCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    padding: 20,
    marginTop: 50,
    borderWidth: 2,
    borderColor: '#00ff00',
  },
  questionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  questionContent: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  answerContainer: {
    alignItems: 'center',
  },
  answerText: {
    color: '#00ff00',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  showAnswerButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  correctButton: {
    backgroundColor: '#50C878',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});
