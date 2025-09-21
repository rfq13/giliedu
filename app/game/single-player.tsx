import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Play,
  BookOpen,
  Zap,
  Clock,
  Target,
} from 'lucide-react-native';

export default function SinglePlayerScreen() {
  const [selectedMode, setSelectedMode] = useState<'quick' | 'practice' | 'challenge'>('quick');

  const gameModes = [
    {
      id: 'quick',
      title: 'Quick Play',
      description: 'AR head gestures • 10 random questions',
      duration: '5-10 min',
      points: '50-100 pts',
      color: '#06B6D4',
      icon: Play,
    },
    {
      id: 'practice',
      title: 'Practice Mode',
      description: 'Choose category • No time pressure',
      duration: 'Unlimited',
      points: 'Varies',
      color: '#10B981',
      icon: BookOpen,
    },
    {
      id: 'challenge',
      title: 'Daily Challenge',
      description: 'Special questions • Bonus points',
      duration: '15 min',
      points: '200+ pts',
      color: '#F59E0B',
      icon: Target,
    },
  ];

  const handleStartGame = () => {
    switch (selectedMode) {
      case 'quick':
        router.push('/game/ar-camera');
        break;
      case 'practice':
        router.push('/game/ar-camera');
        break;
      case 'challenge':
        router.push('/game/challenge');
        break;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#1F2937', '#374151']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Single Player</Text>
        <Text style={styles.headerSubtitle}>
          Choose your game mode and test your knowledge wongkoko
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Game Modes</Text>
        
        {gameModes.map((mode) => {
          const IconComponent = mode.icon;
          const isSelected = selectedMode === mode.id;
          
          return (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.modeCard,
                isSelected && styles.selectedModeCard,
                { borderLeftColor: mode.color }
              ]}
              onPress={() => setSelectedMode(mode.id as any)}
            >
              <View style={styles.modeHeader}>
                <View style={[styles.modeIcon, { backgroundColor: mode.color }]}>
                  <IconComponent size={24} color="white" />
                </View>
                <View style={styles.modeInfo}>
                  <Text style={styles.modeTitle}>{mode.title}</Text>
                  <Text style={styles.modeDescription}>{mode.description}</Text>
                </View>
                {isSelected && (
                  <View style={[styles.selectedIndicator, { backgroundColor: mode.color }]} />
                )}
              </View>
              
              <View style={styles.modeStats}>
                <View style={styles.statItem}>
                  <Clock size={16} color="#6B7280" />
                  <Text style={styles.statText}>{mode.duration}</Text>
                </View>
                <View style={styles.statItem}>
                  <Zap size={16} color="#6B7280" />
                  <Text style={styles.statText}>{mode.points}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Game Settings */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingCard}>
            <Text style={styles.settingTitle}>AR Sensitivity</Text>
            <View style={styles.sensitivityOptions}>
              {['Low', 'Medium', 'High'].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.sensitivityButton,
                    level === 'Medium' && styles.activeSensitivity
                  ]}
                >
                  <Text style={[
                    styles.sensitivityText,
                    level === 'Medium' && styles.activeSensitivityText
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingCard}>
            <Text style={styles.settingTitle}>Question Difficulty</Text>
            <View style={styles.difficultyOptions}>
              {[
                { level: 'Mixed', color: '#8B5CF6' },
                { level: 'Easy', color: '#10B981' },
                { level: 'Hard', color: '#EF4444' },
              ].map((difficulty) => (
                <TouchableOpacity
                  key={difficulty.level}
                  style={[
                    styles.difficultyButton,
                    difficulty.level === 'Mixed' && styles.activeDifficulty,
                    { borderColor: difficulty.color }
                  ]}
                >
                  <Text style={[
                    styles.difficultyText,
                    difficulty.level === 'Mixed' && { color: difficulty.color }
                  ]}>
                    {difficulty.level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartGame}
        >
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            style={styles.startButtonGradient}
          >
            <Play size={24} color="white" />
            <Text style={styles.startButtonText}>Start Game</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  modeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedModeCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  modeStats: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  settingsContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  settingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  sensitivityOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sensitivityButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  activeSensitivity: {
    backgroundColor: '#8B5CF6',
  },
  sensitivityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeSensitivityText: {
    color: 'white',
  },
  difficultyOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  activeDifficulty: {
    backgroundColor: '#F8FAFC',
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
});