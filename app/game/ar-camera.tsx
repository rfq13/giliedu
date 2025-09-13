import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Camera,
  useFrameProcessor,
  useCameraDevice,
  useCameraPermission
} from 'react-native-vision-camera';

import { Worklets } from 'react-native-worklets-core';
import { Face, useFaceDetector, FaceDetectionOptions } from 'react-native-vision-camera-face-detector';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  X,
  RotateCcw,
  Zap,
  ArrowLeft,
  ArrowRight,
  CircleCheck as CheckCircle,
  Circle as XCircle,
} from 'lucide-react-native';
import { Question, HeadGesture } from '@/types/game';
import { ARService } from '@/services/arService';

const { width, height } = Dimensions.get('window');

// Mock questions data
const mockQuestions = [
  {
    id: '1',
    category: 'Science',
    text: 'What is the largest planet in our solar system?',
    options: ['Jupiter', 'Saturn'],
    correctAnswer: 0,
    difficulty: 'easy',
    points: 10,
  },
  {
    id: '2',
    category: 'History',
    text: 'In which year did World War II end?',
    options: ['1944', '1945'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 20,
  },
  {
    id: '3',
    category: 'Math',
    text: 'What is 7 × 8?',
    options: ['54', '56'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 15,
  },
];

export default function ARCameraScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const device = useCameraDevice(facing);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<{
    correct: boolean,
    selectedOption: string
  } | null>(null);
  const [headGesture, setHeadGesture] = useState<HeadGesture>({
    direction: 'center',
    confidence: 0,
    timestamp: 0,
  });
  const [arService] = useState(() => ARService.getInstance());
  const [isARReady, setIsARReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = mockQuestions[currentQuestionIndex];

  // Initialize AR and camera permissions
  useEffect(() => {
    const initialize = async () => {
      // Request camera permission
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          setError('Camera permission denied');
          return;
        }
      }

      // Initialize AR service
      try {
        const initialized = await arService.initialize();
        setIsARReady(initialized);

        if (initialized) {
          arService.startTracking((gesture: HeadGesture) => {
            setHeadGesture(gesture);

            // Auto-answer based on confident gestures
            if (gameStarted && !showFeedback && gesture.confidence > 0.8) {
              if (gesture.direction === 'left') {
                handleAnswer(0);
              } else if (gesture.direction === 'right') {
                handleAnswer(1);
              }
            }
          });
        } else {
          setError('Failed to initialize AR service');
        }
      } catch (err) {
        setError('Error initializing AR service');
        console.error(err);
      }
    };

    initialize();

    return () => {
      arService.stopTracking();
    };
  }, [hasPermission, gameStarted, showFeedback]);

  // Frame processor for face detection
  const faceDetectionOptions = useRef<FaceDetectionOptions>({
    performanceMode: 'fast',
    contourMode: 'all',
    landmarkMode: 'all',
    classificationMode: 'all',
    minFaceSize: 0.15,
    trackingEnabled: true,
  }).current;

  const { detectFaces, stopListeners } = useFaceDetector(faceDetectionOptions);

  useEffect(() => {
    return () => {
      stopListeners();
    };
  }, []);

  useEffect(() => {
    if (!device) {
      stopListeners();
      return;
    }

    (async () => {
      const status = await Camera.requestCameraPermission();
      console.log({ status });
    })();
  }, [device]);

  const handleDetectedFaces = Worklets.createRunOnJS((faces: Face[]) => {
    if (faces.length > 0) {
      const firstFace = faces[0];
      // console.log('Detected face:', firstFace);
      // console.log('Head Euler Y:', firstFace.headEulerAngleY);
      // console.log('Head Euler Z:', firstFace.headEulerAngleZ);
      // console.log('Smiling Probability:', firstFace.smilingProbability);
      // console.log('Left Eye Open Probability:', firstFace.leftEyeOpenProbability);
      // console.log('Right Eye Open Probability:', firstFace.rightEyeOpenProbability);
      // console.log('Face Bounds:', firstFace.bounds);

      // Update ARService with the new face data
      ARService.getInstance().handleFaceDetection([firstFace]);
    }
  });

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    runAsync(frame, () => {
      'worklet';
      const faces = detectFaces(frame);
      handleDetectedFaces(faces);
    });
  }, [handleDetectedFaces]);

  // Handle answer selection
  const handleAnswer = useCallback(
    (selectedIndex: number) => {
      if (showFeedback) return;

      const isCorrect = selectedIndex === currentQuestion.correctAnswer;
      const selectedOption = currentQuestion.options[selectedIndex];

      setLastAnswer({ correct: isCorrect, selectedOption });
      setShowFeedback(true);

      if (isCorrect) {
        setScore((prev) => prev + currentQuestion.points);
      }

      setTimeout(() => {
        if (currentQuestionIndex < mockQuestions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
          setShowFeedback(false);
          setLastAnswer(null);
        } else {
          Alert.alert(
            'Game Complete!',
            `Your final score: ${
              score + (isCorrect ? currentQuestion.points : 0)
            } points`,
            [
              {
                text: 'Play Again',
                onPress: () => router.replace('/game/ar-camera'),
              },
            ]
          );
        }
      }, 2000);
    },
    [
      showFeedback,
      currentQuestion,
      currentQuestionIndex,
      score,
      mockQuestions.length,
    ]
  );

  // Toggle camera facing
  const toggleCameraFacing = useCallback(() => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }, []);

  // Render error or permission denied states
  if (error) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>{error}</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => router.back()}
        >
          <Text style={styles.permissionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera access is required for AR features
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera not available or not found.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => router.back()}
        >
          <Text style={styles.permissionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {device == null ? (
        <Text>Camera not available</Text>
      ) : (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
        >
          {/* Header */}
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.7)', 'transparent']}
            style={styles.header}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => router.back()}
            >
              <X size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.gameInfo}>
              <Text style={styles.scoreText}>Score: {score}</Text>
              <Text style={styles.questionCounter}>
                {currentQuestionIndex + 1}/{mockQuestions.length}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.flipButton}
              onPress={toggleCameraFacing}
            >
              <RotateCcw size={24} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          {/* AR Question Overlay (positioned on forehead area) */}
          {gameStarted && (
            <View style={styles.questionOverlay}>
              <View style={styles.questionBox}>
                <Text style={styles.questionCategory}>
                  {currentQuestion.category}
                </Text>
                <Text style={styles.questionText}>{currentQuestion.text}</Text>
                <View style={styles.pointsIndicator}>
                  <Zap size={12} color="#F59E0B" />
                  <Text style={styles.pointsText}>
                    {currentQuestion.points} pts
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Head Gesture Indicator */}
          {gameStarted && (
            <View style={styles.gestureIndicator}>
              <View
                style={[
                  styles.gestureDirection,
                  headGesture.direction === 'left' &&
                    headGesture.confidence > 0.6 &&
                    styles.activeGesture,
                ]}
              >
                <ArrowLeft size={16} color="white" />
              </View>
              <Text style={styles.gestureText}>
                {headGesture.confidence > 0.6
                  ? headGesture.direction === 'left'
                    ? 'Left Tilt'
                    : headGesture.direction === 'right'
                    ? 'Right Tilt'
                    : 'Center'
                  : 'Center'}
              </Text>
              <View
                style={[
                  styles.gestureDirection,
                  headGesture.direction === 'right' &&
                    headGesture.confidence > 0.6 &&
                    styles.activeGesture,
                ]}
              >
                <ArrowRight size={16} color="white" />
              </View>

              {/* Confidence indicator */}
              <View style={styles.confidenceIndicator}>
                <Text style={styles.confidenceText}>
                  {Math.round(headGesture.confidence * 100)}%
                </Text>
              </View>
            </View>
          )}

          {/* Answer Options */}
          {gameStarted && (
            <View style={styles.answersContainer}>
              <TouchableOpacity
                style={[
                  styles.answerButton,
                  styles.leftAnswer,
                  showFeedback &&
                    currentQuestion.correctAnswer === 0 &&
                    styles.correctAnswer,
                  showFeedback &&
                    lastAnswer?.selectedOption ===
                      currentQuestion.options[0] &&
                    !lastAnswer.correct &&
                    styles.incorrectAnswer,
                ]}
                onPress={() => handleAnswer(0)}
                disabled={showFeedback}
              >
                <Text style={styles.answerLabel}>A</Text>
                <Text style={styles.answerText}>
                  {currentQuestion.options[0]}
                </Text>
                <ArrowLeft size={20} color="white" style={styles.answerIcon} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.answerButton,
                  styles.rightAnswer,
                  showFeedback &&
                    currentQuestion.correctAnswer === 1 &&
                    styles.correctAnswer,
                  showFeedback &&
                    lastAnswer?.selectedOption ===
                      currentQuestion.options[1] &&
                    !lastAnswer.correct &&
                    styles.incorrectAnswer,
                ]}
                onPress={() => handleAnswer(1)}
                disabled={showFeedback}
              >
                <ArrowRight
                  size={20}
                  color="white"
                  style={styles.answerIcon}
                />
                <Text style={styles.answerLabel}>B</Text>
                <Text style={styles.answerText}>
                  {currentQuestion.options[1]}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Feedback Overlay */}
          {showFeedback && lastAnswer && (
            <View style={styles.feedbackOverlay}>
              <LinearGradient
                colors={
                  lastAnswer.correct
                    ? ['#10B981', '#059669']
                    : ['#EF4444', '#DC2626']
                }
                style={styles.feedbackCard}
              >
                {lastAnswer.correct ? (
                  <CheckCircle size={32} color="white" />
                ) : (
                  <XCircle size={32} color="white" />
                )}
                <Text style={styles.feedbackText}>
                  {lastAnswer.correct ? 'Correct!' : 'Wrong Answer'}
                </Text>
                <Text style={styles.feedbackDetail}>
                  {lastAnswer.correct
                    ? `+${currentQuestion.points} points`
                    : `Correct answer: ${
                        currentQuestion.options[currentQuestion.correctAnswer]
                      }`}
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Instructions */}
          {!gameStarted && (
            <View style={styles.instructionsOverlay}>
              <LinearGradient
                colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.6)']}
                style={styles.instructionsCard}
              >
                <Text style={styles.instructionsTitle}>How to Play</Text>
                <Text style={styles.instructionsText}>
                  • Position your face in the camera view
                </Text>
                <Text style={styles.instructionsText}>
                  • The question appears above your head (others can see it)
                </Text>
                <Text style={styles.instructionsText}>
                  • Tilt your head LEFT for Answer A, RIGHT for Answer B
                </Text>
                <Text style={styles.instructionsText}>
                  • Hold the gesture until the confidence reaches 80%
                </Text>
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => setGameStarted(true)}
                >
                  <Text style={styles.startButtonText}>Start Game</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}
        </Camera>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  gameInfo: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  questionCounter: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  questionOverlay: {
    position: 'absolute',
    top: height * 0.15,
    left: width * 0.1,
    right: width * 0.1,
    alignItems: 'center',
  },
  questionBox: {
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    width: width * 0.8,
  },
  questionCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  pointsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FCD34D',
    marginLeft: 4,
  },
  gestureIndicator: {
    position: 'absolute',
    top: height * 0.35,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gestureDirection: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
    marginHorizontal: 8,
  },
  activeGesture: {
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
  },
  gestureText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  confidenceIndicator: {
    position: 'absolute',
    bottom: -30,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  answersContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  answerButton: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  leftAnswer: {
    alignItems: 'flex-start',
  },
  rightAnswer: {
    alignItems: 'flex-end',
  },
  correctAnswer: {
    backgroundColor: 'rgba(16, 185, 129, 0.8)',
  },
  incorrectAnswer: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  answerLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  answerIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  feedbackOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  feedbackCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 40,
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
  },
  feedbackDetail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  instructionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionsCard: {
    borderRadius: 20,
    padding: 32,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  instructionsText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});
