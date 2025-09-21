import { HeadGesture, ARData } from '@/types/game';
import { Face } from 'react-native-vision-camera-face-detector';

export const defaultHeadGesture: HeadGesture = {
    direction: 'center',
    confidence: 0,
    timestamp: 0,
    intensity: 0,
    duration: 0,
    rotation: { yaw: 0, pitch: 0, roll: 0 },
    velocity: 0,
    isStable: false,
    previousDirection: 'center',
  }
   export interface FacePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  detected: boolean;
}

export class ARService {
  private static instance: ARService;
  private isInitialized = false;
  private callbacks: ((gesture: HeadGesture) => void)[] = [];
  private facePositionCallbacks: ((position: FacePosition) => void)[] = [];
  private lastGesture: HeadGesture | null = null;
  private lastFacePosition: FacePosition | null = null;
  private gestureThreshold = 15; // degrees
  private confidenceThreshold = 0.6;
  private lastActionTime = 0;
  private actionCooldown = 1000; // 1 second cooldown between actions
  private gestureHistory: HeadGesture[] = [];
  private maxHistorySize = 5;

  static getInstance(): ARService {
    if (!ARService.instance) {
      ARService.instance = new ARService();
    }
    return ARService.instance;
  }

  // Initialize AR tracking with real face detection
  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing AR service with face detection...');
      
      // Check camera permissions
      // Permissions are now handled in ARCameraScreen.tsx using useCameraPermission hook
      // This method will now just ensure the service is ready.

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize AR:', error);
      return false;
    }
  }

  // Start head gesture detection with face tracking
  startTracking(callback: (gesture: HeadGesture) => void): void {
    this.callbacks.push(callback);
    
    if (!this.isInitialized) {
      this.initialize();
    }
  }

  // Start face position tracking
  startFacePositionTracking(callback: (position: FacePosition) => void): void {
    this.facePositionCallbacks.push(callback);
  }

  // Stop tracking
  stopTracking(callback?: (gesture: HeadGesture) => void): void {
    if (callback) {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    } else {
      this.callbacks = [];
    }
  }

  // Stop face position tracking
  stopFacePositionTracking(callback?: (position: FacePosition) => void): void {
    if (callback) {
      this.facePositionCallbacks = this.facePositionCallbacks.filter(cb => cb !== callback);
    } else {
      this.facePositionCallbacks = [];
    }
  }

  // Process face detection results
  handleFaceDetection = (faces: Face[]) => {
    if (faces.length === 0) {
      // No face detected
      const gesture: HeadGesture = {
        ...defaultHeadGesture,
        timestamp: Date.now(),
      };
      const facePosition: FacePosition = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        detected: false,
      };
      this.notifyCallbacks(gesture);
      this.notifyFacePositionCallbacks(facePosition);
      return;
    }

    const face = faces[0]; // Use first detected face
    
    // Calculate face position for question overlay
    const facePosition = this.calculateFacePosition(face);
    this.lastFacePosition = facePosition;
    this.notifyFacePositionCallbacks(facePosition);
    
    // Calculate head rotation from face landmarks
    const headRotation = this.calculateHeadRotation(face);
    const gesture = this.rotationToGesture(headRotation);
    
    // Apply smoothing to reduce jitter
    const smoothedGesture = this.smoothGesture(gesture);
    
    this.lastGesture = smoothedGesture;
    this.notifyCallbacks(smoothedGesture);
  };

  // Calculate head rotation from face landmarks and euler angles
  calculateHeadRotation(face: Face): { x: number; y: number; z: number } {
    // Use face bounds and landmarks to estimate head pose
    const bounds = face.bounds;
    const landmarks = face.landmarks;
    
    let yRotation = 0;
    let xRotation = 0;
    let zRotation = 0;

    // Use yawAngle for horizontal head rotation (more accurate)
    if (face.yawAngle !== undefined) {
      yRotation = face.yawAngle;
    }
    
    if (face.pitchAngle !== undefined) {
      xRotation = face.pitchAngle;
    }
    
    if (face.rollAngle !== undefined) {
      zRotation = face.rollAngle;
    }

    // Fallback to landmark-based calculation if euler angles not available
    if (face.yawAngle === undefined && landmarks) {
      const leftEye = landmarks.LEFT_EYE;
      const rightEye = landmarks.RIGHT_EYE;
      const mouthBottom = landmarks.MOUTH_BOTTOM;

      if (leftEye && rightEye && mouthBottom) {
        // Calculate Y rotation (left/right head turn)
        const eyeCenterX = (leftEye.x + rightEye.x) / 2;
        const faceWidth = bounds.width;
        const faceCenterX = bounds.x + faceWidth / 2;
        
        // Normalize to -1 to 1 range, then convert to degrees
        const normalizedX = (eyeCenterX - faceCenterX) / (faceWidth / 2);
        yRotation = normalizedX * 30; // Max 30 degrees

        // Calculate X rotation (up/down head tilt)
        const eyeCenterY = (leftEye.y + rightEye.y) / 2;
        const faceHeight = bounds.height;
        const expectedEyeY = bounds.y + faceHeight * 0.4; // Eyes typically at 40% from top
        
        const normalizedY = (eyeCenterY - expectedEyeY) / (faceHeight / 2);
        xRotation = normalizedY * 20; // Max 20 degrees

        // Calculate Z rotation (head roll)
        const eyeAngle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
        zRotation = (eyeAngle * 180) / Math.PI;
      }
    }

    return { x: xRotation, y: yRotation, z: zRotation };
  }

  // Convert head rotation to gesture
  rotationToGesture(rotation: { x: number; y: number; z: number }): HeadGesture {
    const absY = Math.abs(rotation.y);
    const absX = Math.abs(rotation.x);
    const currentTime = Date.now();
    
    let direction: 'left' | 'right' | 'center' | 'up' | 'down' = 'center';
    let confidence = 0;
    let intensity = 0;

    // Use improved thresholds for better accuracy
    const initialThreshold = 8; // degrees - slightly higher for better accuracy
    const maxThreshold = 25; // degrees - maximum meaningful rotation
    const upDownThreshold = 10; // threshold for up/down gestures

    // Determine primary direction based on strongest rotation
    if (absY > initialThreshold && absY > absX) {
      // Horizontal movement (left/right)
      direction = rotation.y > 0 ? 'right' : 'left';
      
      // Calculate confidence and intensity
      const rotationRange = maxThreshold - initialThreshold;
      const normalizedRotation = Math.min(absY - initialThreshold, rotationRange);
      confidence = normalizedRotation / rotationRange;
      intensity = Math.min(absY / maxThreshold, 1.0);
      
      // Apply sigmoid-like curve for smoother confidence scaling
      confidence = Math.min(1.0, confidence * 1.2);
      
      // Boost confidence for strong gestures
      if (absY > 20) {
        confidence = Math.min(1.0, confidence * 1.1);
      }
    } else if (absX > upDownThreshold && absX > absY) {
      // Vertical movement (up/down)
      direction = rotation.x > 0 ? 'down' : 'up';
      
      // Calculate confidence and intensity for vertical gestures
      const rotationRange = maxThreshold - upDownThreshold;
      const normalizedRotation = Math.min(absX - upDownThreshold, rotationRange);
      confidence = normalizedRotation / rotationRange;
      intensity = Math.min(absX / maxThreshold, 1.0);
      
      confidence = Math.min(1.0, confidence * 1.1);
    } else {
      // If within thresholds, confidence is low or zero
      confidence = 0;
      intensity = 0;
    }

    // Calculate velocity based on previous gesture
    let velocity = 0;
    if (this.lastGesture) {
      const timeDiff = currentTime - this.lastGesture.timestamp;
      if (timeDiff > 0) {
        const rotationDiff = Math.sqrt(
          Math.pow(rotation.y - this.lastGesture.rotation.yaw, 2) +
          Math.pow(rotation.x - this.lastGesture.rotation.pitch, 2)
        );
        velocity = rotationDiff / timeDiff * 1000; // degrees per second
      }
    }

    // Calculate duration of current gesture
    let duration = 0;
    if (this.lastGesture && this.lastGesture.direction === direction) {
      duration = currentTime - this.lastGesture.timestamp + (this.lastGesture.duration || 0);
    }

    // Determine if gesture is stable
    const isStable = confidence > 0.5 && duration > 200 && velocity < 50;

    // Improved gesture persistence - maintain direction for brief moments
    if (this.lastGesture && this.lastGesture.direction === direction && this.lastGesture.confidence > 0.3 && confidence < 0.2) {
      confidence = Math.max(confidence, this.lastGesture.confidence * 0.7); // Slower decay
    }

    return {
      direction,
      confidence,
      timestamp: currentTime,
      intensity,
      duration,
      rotation: {
        yaw: rotation.y,
        pitch: rotation.x,
        roll: rotation.z
      },
      velocity,
      isStable,
      previousDirection: this.lastGesture?.direction
    };
  }

  // Apply smoothing to reduce gesture jitter
  private smoothGesture(gesture: HeadGesture): HeadGesture {
    if (!this.lastGesture) return gesture;

    // Adaptive smoothing based on gesture strength
    const baseSmoothing = 0.6;
    const confidenceDiff = Math.abs(gesture.confidence - this.lastGesture.confidence);
    const smoothingFactor = Math.max(0.3, baseSmoothing - (confidenceDiff * 0.3));
    
    const smoothedConfidence = 
      gesture.confidence * smoothingFactor + 
      this.lastGesture.confidence * (1 - smoothingFactor);

    // Improved direction change logic
    let direction = gesture.direction;
    
    // Only change direction if:
    // 1. New gesture has high confidence (> 0.7), OR
    // 2. Current confidence is low (< 0.3), OR
    // 3. Direction change is supported by strong confidence
    if (gesture.direction !== this.lastGesture.direction) {
      if (gesture.confidence < 0.7 && this.lastGesture.confidence > 0.3) {
        direction = this.lastGesture.direction; // Keep previous direction
      }
    }

    // Apply minimum confidence threshold for direction changes
    if (smoothedConfidence < this.confidenceThreshold && this.lastGesture.confidence > this.confidenceThreshold) {
      direction = this.lastGesture.direction;
    }

    // Smooth other properties as well
    const smoothedIntensity = this.lastGesture.intensity !== undefined 
      ? gesture.intensity * smoothingFactor + this.lastGesture.intensity * (1 - smoothingFactor)
      : gesture.intensity;

    const smoothedVelocity = this.lastGesture.velocity !== undefined
      ? gesture.velocity * smoothingFactor + this.lastGesture.velocity * (1 - smoothingFactor)
      : gesture.velocity;

    return {
      direction,
      confidence: smoothedConfidence,
      timestamp: gesture.timestamp,
      intensity: smoothedIntensity,
      duration: gesture.duration, // Duration doesn't need smoothing
      rotation: gesture.rotation, // Rotation is already processed
      velocity: smoothedVelocity,
      isStable: gesture.isStable, // Stability is calculated based on other factors
      previousDirection: gesture.previousDirection
    };
  }

  // Calculate face position for UI overlay
  private calculateFacePosition(face: Face): FacePosition {
    const bounds = face.bounds;
    
    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      detected: true,
    };
  }

  // Notify all callbacks
  private notifyCallbacks(gesture: HeadGesture): void {
    this.callbacks.forEach(callback => callback(gesture));
  }

  // Notify face position callbacks
  private notifyFacePositionCallbacks(position: FacePosition): void {
    this.facePositionCallbacks.forEach(callback => callback(position));
  }

  // Check if device supports AR
  static async isARSupported(): Promise<boolean> {
    // react-native-vision-camera handles permissions directly in the component
    // For ARService, we assume if it's initialized, it's supported.
    return true;
  }

  // Calibrate AR tracking
  async calibrate(): Promise<boolean> {
    return new Promise((resolve) => {
      console.log('Calibrating AR tracking...');
      // Reset thresholds and smoothing
      this.gestureThreshold = 15;
      this.lastGesture = null;
      
      setTimeout(() => {
        console.log('AR calibration completed');
        resolve(true);
      }, 2000);
    });
  }

  // Get current face position
  getCurrentFacePosition(): FacePosition | null {
    return this.lastFacePosition;
  }

  // Process head gesture and return corresponding action
  processHeadGesture(gesture: HeadGesture): 'select_left' | 'select_right' | 'select_up' | 'select_down' | 'no_action' {
    // Only process gestures with sufficient confidence and stability
    if (gesture.confidence < this.confidenceThreshold || !gesture.isStable) {
      return 'no_action';
    }

    // Require minimum intensity for action
    if (gesture.intensity < 0.3) {
      return 'no_action';
    }

    // Map gesture direction to action
    switch (gesture.direction) {
      case 'left':
        return 'select_left';
      case 'right':
        return 'select_right';
      case 'up':
        return 'select_up';
      case 'down':
        return 'select_down';
      case 'center':
      default:
        return 'no_action';
    }
  }

  // Advanced head gesture processing with debouncing and history
  processHeadGestureAdvanced(gesture: HeadGesture): 'select_left' | 'select_right' | 'select_up' | 'select_down' | 'no_action' {
    const currentTime = Date.now();
    
    // Add gesture to history
    this.addToGestureHistory(gesture);
    
    // Check cooldown period
    if (currentTime - this.lastActionTime < this.actionCooldown) {
      return 'no_action';
    }
    
    // Only process gestures with sufficient confidence and stability
    if (gesture.confidence < this.confidenceThreshold || !gesture.isStable) {
      return 'no_action';
    }
    
    // Require minimum intensity and duration for advanced processing
    if (gesture.intensity < 0.4 || gesture.duration < 150) {
      return 'no_action';
    }
    
    // Check velocity - reject gestures that are too fast (likely noise)
    if (gesture.velocity > 100) {
      return 'no_action';
    }
    
    // Check for consistent gesture direction in recent history
    const consistentDirection = this.getConsistentDirection();
    if (!consistentDirection || consistentDirection === 'center') {
      return 'no_action';
    }
    
    // Update last action time
    this.lastActionTime = currentTime;
    
    // Map gesture direction to action
    switch (consistentDirection) {
      case 'left':
        return 'select_left';
      case 'right':
        return 'select_right';
      case 'up':
        return 'select_up';
      case 'down':
        return 'select_down';
      default:
        return 'no_action';
    }
  }

  // Add gesture to history for tracking consistency
  private addToGestureHistory(gesture: HeadGesture): void {
    this.gestureHistory.push(gesture);
    
    // Keep history size manageable
    if (this.gestureHistory.length > this.maxHistorySize) {
      this.gestureHistory.shift();
    }
  }

  // Get consistent direction from recent gesture history
  private getConsistentDirection(): 'left' | 'right' | 'center' | 'up' | 'down' | null {
    if (this.gestureHistory.length < 3) {
      return null;
    }
    
    // Get recent high-confidence gestures
    const recentGestures = this.gestureHistory
      .slice(-3)
      .filter(g => g.confidence >= this.confidenceThreshold);
    
    if (recentGestures.length < 2) {
      return null;
    }
    
    // Check if majority of recent gestures have the same direction
    const leftCount = recentGestures.filter(g => g.direction === 'left').length;
    const rightCount = recentGestures.filter(g => g.direction === 'right').length;
    const upCount = recentGestures.filter(g => g.direction === 'up').length;
    const downCount = recentGestures.filter(g => g.direction === 'down').length;
    
    if (leftCount >= 2) {
      return 'left';
    } else if (rightCount >= 2) {
      return 'right';
    } else if (upCount >= 2) {
      return 'up';
    } else if (downCount >= 2) {
      return 'down';
    }
    
    return null;
  }

  // Reset gesture processing state
  resetGestureState(): void {
    this.gestureHistory = [];
    this.lastActionTime = 0;
  }

  // Set action cooldown period
  setActionCooldown(milliseconds: number): void {
    this.actionCooldown = milliseconds;
  }

  // Set confidence threshold
  setConfidenceThreshold(threshold: number): void {
    this.confidenceThreshold = Math.max(0, Math.min(1, threshold));
  }

  // Clean up resources
  dispose(): void {
    this.callbacks = [];
    this.facePositionCallbacks = [];
    this.lastGesture = null;
    this.lastFacePosition = null;
    this.gestureHistory = [];
    this.lastActionTime = 0;
    this.isInitialized = false;
  }
}

// Utility functions for AR gesture detection
export const ARUtils = {
  // No longer needed as functionality is handled within ARService
};