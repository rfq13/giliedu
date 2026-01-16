import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Mic,
  Edit3,
  Sparkles,
  ChevronRight,
  Clock,
  Pause,
  Play,
  X,
  Send,
} from 'lucide-react-native';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { storyAPI } from '../../services/api';

interface StoryPrompt {
  id: string;
  title: string;
  description: string;
  ageGroup: 'sd' | 'smp' | 'sma';
  icon: string;
}

const storyPrompts: StoryPrompt[] = [
  {
    id: '1',
    title: 'Liburan Terbaik',
    description: 'Ceritakan pengalaman liburan paling berkesan yang pernah kamu alami.',
    ageGroup: 'sd',
    icon: '🏖️',
  },
  {
    id: '2',
    title: 'Pahlawanku',
    description: 'Siapa orang yang paling kamu kagumi? Ceritakan mengapa!',
    ageGroup: 'sd',
    icon: '🦸',
  },
  {
    id: '3',
    title: 'Jika Aku Jadi...',
    description: 'Jika kamu bisa jadi siapa saja sehari, siapa yang kamu pilih?',
    ageGroup: 'smp',
    icon: '✨',
  },
  {
    id: '4',
    title: 'Cerita Bebas',
    description: 'Ceritakan apa saja yang ada di pikiranmu hari ini.',
    ageGroup: 'sd',
    icon: '💭',
  },
];

export default function RuangCeritaScreen() {
  const [inputMode, setInputMode] = useState<'audio' | 'text'>('audio');
  const [selectedPrompt, setSelectedPrompt] = useState<StoryPrompt | null>(null);
  const [storyText, setStoryText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    recordingState,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
    formatDuration,
  } = useAudioRecorder();

  const handleStartRecording = async () => {
    if (!selectedPrompt) {
      Alert.alert('Pilih Topik', 'Silakan pilih topik cerita terlebih dahulu.');
      return;
    }
    await startRecording();
  };

  const handleStopRecording = async () => {
    const uri = await stopRecording();
    if (uri) {
      Alert.alert(
        'Rekaman Selesai',
        'Rekaman berhasil disimpan. Kirim untuk evaluasi AI?',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Kirim', onPress: () => handleSubmitStory(uri) },
        ]
      );
    }
  };

  const handleSubmitStory = async (audioUri?: string) => {
    if (!selectedPrompt) {
      Alert.alert('Error', 'Silakan pilih topik cerita terlebih dahulu.');
      return;
    }

    if (inputMode === 'text' && !storyText.trim()) {
      Alert.alert('Error', 'Silakan tulis cerita terlebih dahulu.');
      return;
    }

    if (inputMode === 'audio' && !audioUri) {
      Alert.alert('Error', 'Silakan rekam cerita terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);

    try {
      const storyData = {
        prompt_id: selectedPrompt.id,
        prompt_title: selectedPrompt.title,
        input_type: inputMode,
        content: inputMode === 'text' ? storyText : undefined,
        audio_url: inputMode === 'audio' ? audioUri : undefined,
      };

      await storyAPI.createStory(storyData);

      Alert.alert(
        'Berhasil!',
        'Ceritamu telah dikirim untuk evaluasi AI. Hasilnya akan muncul di timeline.',
        [
          {
            text: 'OK',
            onPress: () => {
              setStoryText('');
              setSelectedPrompt(null);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting story:', error);
      Alert.alert(
        'Error',
        'Gagal mengirim cerita. Pastikan kamu sudah login dan coba lagi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#10B981', '#059669']}
        style={styles.header}
      >
        <Sparkles size={32} color="white" />
        <Text style={styles.headerTitle}>Ruang Cerita</Text>
        <Text style={styles.headerSubtitle}>
          Ceritakan kisahmu dengan suara atau tulisan
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Input Mode Toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeButton, inputMode === 'audio' && styles.modeButtonActive]}
            onPress={() => setInputMode('audio')}
          >
            <Mic size={20} color={inputMode === 'audio' ? 'white' : '#6B7280'} />
            <Text style={[styles.modeButtonText, inputMode === 'audio' && styles.modeButtonTextActive]}>
              Rekam Suara
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, inputMode === 'text' && styles.modeButtonActive]}
            onPress={() => setInputMode('text')}
          >
            <Edit3 size={20} color={inputMode === 'text' ? 'white' : '#6B7280'} />
            <Text style={[styles.modeButtonText, inputMode === 'text' && styles.modeButtonTextActive]}>
              Tulis Cerita
            </Text>
          </TouchableOpacity>
        </View>

        {/* Story Prompts */}
        <Text style={styles.sectionTitle}>Pilih Topik Cerita</Text>
        <View style={styles.promptsContainer}>
          {storyPrompts.map((prompt) => (
            <TouchableOpacity
              key={prompt.id}
              style={[
                styles.promptCard,
                selectedPrompt?.id === prompt.id && styles.promptCardSelected,
              ]}
              onPress={() => setSelectedPrompt(prompt)}
            >
              <Text style={styles.promptIcon}>{prompt.icon}</Text>
              <View style={styles.promptContent}>
                <Text style={styles.promptTitle}>{prompt.title}</Text>
                <Text style={styles.promptDescription}>{prompt.description}</Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Input Area */}
        {selectedPrompt && (
          <View style={styles.inputSection}>
            <View style={styles.selectedPromptBanner}>
              <Text style={styles.selectedPromptIcon}>{selectedPrompt.icon}</Text>
              <Text style={styles.selectedPromptTitle}>{selectedPrompt.title}</Text>
            </View>

            {inputMode === 'audio' ? (
              <View style={styles.audioSection}>
                {!recordingState.isRecording ? (
                  <>
                    <TouchableOpacity
                      style={styles.recordButton}
                      onPress={handleStartRecording}
                    >
                      <LinearGradient
                        colors={['#EF4444', '#DC2626']}
                        style={styles.recordButtonGradient}
                      >
                        <Mic size={48} color="white" />
                      </LinearGradient>
                    </TouchableOpacity>
                    <Text style={styles.recordHint}>Tekan untuk mulai merekam</Text>
                    <View style={styles.recordInfo}>
                      <Clock size={16} color="#6B7280" />
                      <Text style={styles.recordInfoText}>Maksimal 3 menit</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.recordingIndicator}>
                      <View style={styles.recordingDot} />
                      <Text style={styles.recordingText}>Merekam...</Text>
                    </View>
                    <Text style={styles.recordingDuration}>
                      {formatDuration(recordingState.duration)} / 3:00
                    </Text>
                    <View style={styles.recordingControls}>
                      {recordingState.isPaused ? (
                        <TouchableOpacity
                          style={styles.controlButton}
                          onPress={resumeRecording}
                        >
                          <Play size={24} color="#10B981" />
                          <Text style={styles.controlButtonText}>Lanjutkan</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.controlButton}
                          onPress={pauseRecording}
                        >
                          <Pause size={24} color="#F59E0B" />
                          <Text style={styles.controlButtonText}>Jeda</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.controlButton}
                        onPress={cancelRecording}
                      >
                        <X size={24} color="#EF4444" />
                        <Text style={styles.controlButtonText}>Batal</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.controlButton, styles.stopButton]}
                        onPress={handleStopRecording}
                      >
                        <Send size={24} color="white" />
                        <Text style={[styles.controlButtonText, styles.stopButtonText]}>Selesai</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ) : (
              <View style={styles.textSection}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Mulai menulis ceritamu di sini..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={8}
                  value={storyText}
                  onChangeText={setStoryText}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{storyText.length} karakter</Text>
              </View>
            )}

            {inputMode === 'text' && (
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!storyText || isSubmitting) && styles.submitButtonDisabled,
                ]}
                onPress={() => handleSubmitStory()}
                disabled={!storyText || isSubmitting}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.submitButtonGradient}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Sparkles size={20} color="white" />
                      <Text style={styles.submitButtonText}>Kirim untuk Evaluasi AI</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  modeButtonActive: {
    backgroundColor: '#10B981',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  modeButtonTextActive: {
    color: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  promptsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  promptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  promptCardSelected: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  promptIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  promptContent: {
    flex: 1,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  promptDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  inputSection: {
    marginTop: 8,
  },
  selectedPromptBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  selectedPromptIcon: {
    fontSize: 24,
  },
  selectedPromptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  audioSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  recordButton: {
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 16,
  },
  recordButtonGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordHint: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
  },
  recordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recordInfoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  textSection: {
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 160,
    color: '#1F2937',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 8,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
  },
  recordingDuration: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  recordingControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minWidth: 90,
  },
  stopButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
  },
  stopButtonText: {
    color: 'white',
  },
});