import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import ARSunglassesScene from '../../components/ARSunglassesScene';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const QUIZ_DATA = [
  {
    question: 'Apa nama ibukota Indonesia?',
    left: 'Jakarta',
    right: 'Bandung',
    answer: 'left',
  },
  {
    question: 'Planet terdekat dari Matahari?',
    left: 'Mars',
    right: 'Merkurius',
    answer: 'right',
  },
  {
    question: 'Simbol kimia untuk air?',
    left: 'H2O',
    right: 'CO2',
    answer: 'left',
  },
  {
    question: 'Siapa penemu lampu?',
    left: 'Tesla',
    right: 'Thomas Edison',
    answer: 'right',
  },
];

export default function ARCameraScreen() {
  const [faces, setFaces] = useState<Face[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'left' | 'right' | null>(
    null
  );
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [score, setScore] = useState(0);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const [canDetect, setCanDetect] = useState(true);
  const [detectedDirection, setDetectedDirection] = useState<
    'left' | 'right' | null
  >(null);
  const [maskType, setMaskType] = useState<'glasses' | 'mustache'>('glasses');
  const [is3DEnabled, setIs3DEnabled] = useState(false);
  const [threeStatus, setThreeStatus] = useState<string>('3d_off');
  // ViroReact handles model loading internally

  // Constants for thresholds
  const YAW_THRESHOLD = 20;
  const NEUTRAL_THRESHOLD = 8;
  const CONFIRM_DELAY = 500;
  const COOLDOWN_MS = 1000;

  const faceDetectionOptions = useRef({
    performanceMode: 'fast',
    contourMode: 'all',
    landmarkMode: 'all',
    classificationMode: 'none',
  }).current;

  const device = useCameraDevice('front');

  const { detectFaces } = useFaceDetector(faceDetectionOptions);

  const format = useCameraFormat(device, [
    { videoResolution: { width: 1280, height: 720 }, fps: 30 },
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

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      const detected = detectFaces(frame);
      handleDetectedFaces(detected);
    },
    [handleDetectedFaces, detectFaces]
  );

  useEffect(() => {
    if (faces.length === 0) return;
    if (!canDetect || isProcessingAnswer) return;
    const face = faces[0];
    const yawRaw = face.yawAngle;
    const yaw = device?.position === 'front' ? -yawRaw : yawRaw;
    if (yaw > YAW_THRESHOLD) {
      setDetectedDirection('right');
      setSelectedAnswer('right');
      setCanDetect(false);
      setTimeout(() => {
        Alert.alert(
          'Konfirmasi Pilihan',
          'Anda memilih jawaban kanan. Lanjutkan?',
          [
            {
              text: 'Batal',
              style: 'cancel',
              onPress: () => {
                setSelectedAnswer(null);
                setDetectedDirection(null);
              },
            },
            { text: 'Proses', onPress: () => submitAnswer('right') },
          ]
        );
        setTimeout(() => {
          setCanDetect(true);
          setDetectedDirection(null);
        }, COOLDOWN_MS);
      }, CONFIRM_DELAY);
    } else if (yaw < -YAW_THRESHOLD) {
      setDetectedDirection('left');
      setSelectedAnswer('left');
      setCanDetect(false);
      setTimeout(() => {
        Alert.alert(
          'Konfirmasi Pilihan',
          'Anda memilih jawaban kiri. Lanjutkan?',
          [
            {
              text: 'Batal',
              style: 'cancel',
              onPress: () => {
                setSelectedAnswer(null);
                setDetectedDirection(null);
              },
            },
            { text: 'Proses', onPress: () => submitAnswer('left') },
          ]
        );
        setTimeout(() => {
          setCanDetect(true);
          setDetectedDirection(null);
        }, COOLDOWN_MS);
      }, CONFIRM_DELAY);
    } else if (
      Math.abs(yaw) < NEUTRAL_THRESHOLD &&
      !isProcessingAnswer &&
      !selectedAnswer
    ) {
      setCanDetect(true);
    }
  }, [faces, canDetect, isProcessingAnswer, device, selectedAnswer]);

  const submitAnswer = (answer: 'left' | 'right') => {
    setIsProcessingAnswer(true);
    const isCorrect = answer === currentQuestion.answer;

    if (isCorrect) {
      setScore((s) => s + 1);
      Alert.alert(
        'Benar!',
        `Jawaban ${answer === 'left' ? 'Kiri' : 'Kanan'} benar!`
      );
    } else {
      Alert.alert(
        'Salah!',
        `Jawaban yang benar adalah ${currentQuestion.answer === 'left' ? 'Kiri' : 'Kanan'
        }`
      );
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
      Alert.alert('Quiz Selesai!', `Skor Akhir: ${score}/${QUIZ_DATA.length}`, [
        {
          text: 'Mulai Lagi',
          onPress: () => {
            setCurrentQuestionIndex(0);
            setScore(0);
          },
        },
      ]);
    }
  };

  if (!device)
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No Device</Text>
      </View>
    );
  if (!isPermissionGranted)
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No Permission</Text>
      </View>
    );

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

      {is3DEnabled && (
        <View style={StyleSheet.absoluteFill}>
          <ViroARSceneNavigator
            initialScene={{ scene: ARSunglassesScene }}
            style={{ flex: 1 }}
          />
        </View>
      )}

      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => router.back()}
      >
        <ArrowLeft color="white" size={24} />
      </TouchableOpacity>

      <View
        style={{
          position: 'absolute',
          bottom: 120, // Adjusted position to be above HUD
          left: 0,
          right: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            gap: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => setMaskType('glasses')}
            style={{
              backgroundColor: maskType === 'glasses' ? '#10B981' : '#3B82F6',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>Glasses</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMaskType('mustache')}
            style={{
              backgroundColor: maskType === 'mustache' ? '#10B981' : '#3B82F6',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>Mustache</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIs3DEnabled((v) => !v)}
            style={{
              backgroundColor: is3DEnabled ? '#EF4444' : '#10B981',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>
              {is3DEnabled ? '3D Off' : '3D On'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.arBubbleStatic}>
          <Text style={{ color: 'red' }}>Faces: {faces.length}</Text>
          <Text style={{ color: '#111827' }}>
            3D: {is3DEnabled ? 'on' : 'off'}
          </Text>
          <Text style={{ color: '#111827' }}>{threeStatus}</Text>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>
        <View style={[styles.optionBubbleStatic, { left: 20 }]}>
          <View
            style={[
              styles.optionBubble,
              {
                backgroundColor:
                  selectedAnswer === 'left'
                    ? '#10B981'
                    : 'rgba(255,255,255,0.9)',
                transform: [{ scale: selectedAnswer === 'left' ? 1.15 : 1 }],
              },
            ]}
          >
            <Text style={styles.optionText}>{currentQuestion.left}</Text>
            <Text style={styles.hintText}>
              {detectedDirection === 'left' ? 'Terdeteksi' : 'Geleng Kiri'}
            </Text>
          </View>
        </View>
        <View style={[styles.optionBubbleStatic, { right: 20 }]}>
          <View
            style={[
              styles.optionBubble,
              {
                backgroundColor:
                  selectedAnswer === 'right'
                    ? '#10B981'
                    : 'rgba(255,255,255,0.9)',
                transform: [{ scale: selectedAnswer === 'right' ? 1.15 : 1 }],
              },
            ]}
          >
            <Text style={styles.optionText}>{currentQuestion.right}</Text>
            <Text style={styles.hintText}>
              {detectedDirection === 'right' ? 'Terdeteksi' : 'Geleng Kanan'}
            </Text>
          </View>
        </View>
      </View>

      {/* Score & Instructions */}
      <View style={styles.hudContainer}>
        <Text style={styles.scoreText}>Skor: {score}</Text>
        <Text style={styles.instructionText}>
          Miringkan kepala ke Kiri/Kanan untuk memilih jawaban
        </Text>
        {isProcessingAnswer && (
          <Text style={styles.processingText}>Memproses Jawaban...</Text>
        )}
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
    shadowColor: '#000',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  arBubbleStatic: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    marginHorizontal: 40,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBubbleStatic: {
    position: 'absolute',
    top: Math.floor(screenHeight * 0.45),
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
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
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
  },
});
