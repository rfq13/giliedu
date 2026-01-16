import { useState, useRef } from 'react';
import { Audio } from 'expo-av';
import { Alert, Platform } from 'react-native';

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  uri: string | null;
}

export const useAudioRecorder = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    uri: null,
  });
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Izin Mikrofon Diperlukan',
          'Gili membutuhkan akses mikrofon untuk merekam ceritamu.'
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  const startRecording = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Create recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;

      // Start duration counter
      let seconds = 0;
      intervalRef.current = setInterval(() => {
        seconds += 1;
        setRecordingState(prev => ({ ...prev, duration: seconds }));
        
        // Auto-stop at 3 minutes (180 seconds) as per PRD
        if (seconds >= 180) {
          stopRecording();
        }
      }, 1000);

      setRecordingState({
        isRecording: true,
        isPaused: false,
        duration: 0,
        uri: null,
      });

      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Gagal memulai rekaman. Silakan coba lagi.');
    }
  };

  const pauseRecording = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.pauseAsync();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setRecordingState(prev => ({ ...prev, isPaused: true }));
        console.log('Recording paused');
      }
    } catch (error) {
      console.error('Failed to pause recording:', error);
    }
  };

  const resumeRecording = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.startAsync();
        
        // Resume duration counter
        intervalRef.current = setInterval(() => {
          setRecordingState(prev => {
            const newDuration = prev.duration + 1;
            if (newDuration >= 180) {
              stopRecording();
            }
            return { ...prev, duration: newDuration };
          });
        }, 1000);

        setRecordingState(prev => ({ ...prev, isPaused: false }));
        console.log('Recording resumed');
      }
    } catch (error) {
      console.error('Failed to resume recording:', error);
    }
  };

  const stopRecording = async (): Promise<string | null> => {
    try {
      if (!recordingRef.current) return null;

      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      setRecordingState({
        isRecording: false,
        isPaused: false,
        duration: 0,
        uri,
      });

      console.log('Recording stopped, saved to:', uri);
      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Gagal menghentikan rekaman.');
      return null;
    }
  };

  const cancelRecording = async () => {
    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
        recordingRef.current = null;
      }

      setRecordingState({
        isRecording: false,
        isPaused: false,
        duration: 0,
        uri: null,
      });

      console.log('Recording cancelled');
    } catch (error) {
      console.error('Failed to cancel recording:', error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    recordingState,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
    formatDuration,
  };
};
