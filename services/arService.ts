import { HeadGesture, ARData } from '@/types/game';
import { Face } from 'react-native-vision-camera-face-detector';

export class ARService {
  private static instance: ARService;
  private isInitialized = false;
  private callbacks: ((gesture: HeadGesture) => void)[] = [];
  private lastGesture: HeadGesture | null = null;
  private gestureThreshold = 15; // degrees
  private confidenceThreshold = 0.6;

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

  // Stop tracking
  stopTracking(callback?: (gesture: HeadGesture) => void): void {
    if (callback) {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    } else {
      this.callbacks = [];
    }
  }

  // Process face detection results
  handleFaceDetection = (faces: Face[]) => {
    if (faces.length === 0) {
      // No face detected
      const gesture: HeadGesture = {
        direction: 'center',
        confidence: 0,
        timestamp: Date.now(),
      };
      this.notifyCallbacks(gesture);
      return;
    }

    const face = faces[0]; // Use first detected face
    
    // Calculate head rotation from face landmarks
    const headRotation = this.calculateHeadRotation(face);
    const gesture = this.rotationToGesture(headRotation);
    
    // Apply smoothing to reduce jitter
    const smoothedGesture = this.smoothGesture(gesture);
    
    this.lastGesture = smoothedGesture;
    this.notifyCallbacks(smoothedGesture);
  };

  // Calculate head rotation from face landmarks
  private calculateHeadRotation(face: Face): { x: number; y: number; z: number } {
    // Use face bounds and landmarks to estimate head pose
    const bounds = face.bounds;
    const landmarks = face.landmarks;
    
    let yRotation = 0;
    let xRotation = 0;
    let zRotation = 0;

    if (landmarks) {
      // Calculate rotation based on eye and mouth positions
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
  private rotationToGesture(rotation: { x: number; y: number; z: number }): HeadGesture {
    const absY = Math.abs(rotation.y);
    
    let direction: 'left' | 'right' | 'center' = 'center';
    let confidence = 0;

    // Use a smaller threshold for initial detection to be more responsive
    const initialThreshold = 5; // degrees

    if (absY > initialThreshold) {
      direction = rotation.y > 0 ? 'right' : 'left';
      // Scale confidence based on how far past the threshold the rotation is
      confidence = Math.min(1.0, (absY - initialThreshold) / (this.gestureThreshold - initialThreshold));
    } else {
      // If within initialThreshold, confidence is low or zero
      confidence = 0;
    }

    // Ensure confidence doesn't drop to zero immediately if a gesture was just active
    if (this.lastGesture && this.lastGesture.direction === direction && this.lastGesture.confidence > 0 && confidence === 0) {
      confidence = this.lastGesture.confidence * 0.5; // Decay confidence slowly
    }

    return {
      direction,
      confidence,
      timestamp: Date.now(),
    };
  }

  // Apply smoothing to reduce gesture jitter
  private smoothGesture(gesture: HeadGesture): HeadGesture {
    if (!this.lastGesture) return gesture;

    const smoothingFactor = 0.7;
    const smoothedConfidence = 
      gesture.confidence * smoothingFactor + 
      this.lastGesture.confidence * (1 - smoothingFactor);

    // Only change direction if confidence is high enough
    const direction = smoothedConfidence > this.confidenceThreshold 
      ? gesture.direction 
      : this.lastGesture.direction;

    return {
      direction,
      confidence: smoothedConfidence,
      timestamp: gesture.timestamp,
    };
  }

  // Notify all callbacks
  private notifyCallbacks(gesture: HeadGesture): void {
    this.callbacks.forEach(callback => callback(gesture));
  }

  // Get current AR data
  getCurrentARData(): ARData {
    const mockData: ARData = {
      headRotation: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0.8 },
      isTracking: this.isInitialized,
    };

    if (this.lastGesture) {
      // Convert gesture back to rotation for display
      switch (this.lastGesture.direction) {
        case 'left':
          mockData.headRotation.y = -this.lastGesture.confidence * 30;
          break;
        case 'right':
          mockData.headRotation.y = this.lastGesture.confidence * 30;
          break;
      }
    }

    return mockData;
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

  // Clean up resources
  dispose(): void {
    this.callbacks = [];
    this.lastGesture = null;
    this.isInitialized = false;
  }
}

// Utility functions for AR gesture detection
export const ARUtils = {
  // No longer needed as functionality is handled within ARService
};