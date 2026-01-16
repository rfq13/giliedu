// Minimal stub to keep legacy imports compiling after AR removal.
// If you re-enable AR later, replace this file with real implementation.
export type HeadGesture = {
  direction: 'left' | 'right' | 'center' | 'up' | 'down';
  confidence: number;
  timestamp: number;
  intensity: number;
  duration: number;
  rotation: { yaw: number; pitch: number; roll: number };
  velocity?: number;
  isStable?: boolean;
  previousDirection?: HeadGesture['direction'];
};

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
};

export interface FacePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  detected: boolean;
}

export class ARService {
  private static instance: ARService;

  static getInstance(): ARService {
    if (!ARService.instance) {
      ARService.instance = new ARService();
    }
    return ARService.instance;
  }

  async initialize(): Promise<boolean> {
    console.log('AR disabled: initialize noop');
    return false;
  }

  startTracking(): void {
    console.log('AR disabled: startTracking noop');
  }

  startFacePositionTracking(): void {
    console.log('AR disabled: startFacePositionTracking noop');
  }

  stopTracking(): void {}
  stopFacePositionTracking(): void {}
  handleFaceDetection(): void {}
  resetGestureState(): void {}
  setActionCooldown(): void {}
  setConfidenceThreshold(): void {}
  dispose(): void {}

  processHeadGesture(): 'no_action' {
    return 'no_action';
  }

  processHeadGestureAdvanced(): 'no_action' {
    return 'no_action';
  }

  getCurrentFacePosition(): FacePosition | null {
    return null;
  }

  static async isARSupported(): Promise<boolean> {
    return false;
  }

  async calibrate(): Promise<boolean> {
    return true;
  }
}

// Utility functions for AR gesture detection
export const ARUtils = {
  // No longer needed as functionality is handled within ARService
};