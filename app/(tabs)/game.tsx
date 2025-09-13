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
  Users,
  Settings,
  BookOpen,
  Zap,
  Trophy,
} from 'lucide-react-native';

export default function GameScreen() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'science', name: 'Science', icon: '🔬', color: '#10B981' },
    { id: 'history', name: 'History', icon: '🏛️', color: '#8B5CF6' },
    { id: 'math', name: 'Math', icon: '🧮', color: '#F59E0B' },
    { id: 'language', name: 'Language', icon: '📚', color: '#EF4444' },
    { id: 'geography', name: 'Geography', icon: '🌍', color: '#06B6D4' },
    { id: 'art', name: 'Art', icon: '🎨', color: '#EC4899' },
  ];

  const difficulties = [
    { level: 'easy', name: 'Easy', points: '10-20 pts', color: '#10B981' },
    { level: 'medium', name: 'Medium', points: '30-50 pts', color: '#F59E0B' },
    { level: 'hard', name: 'Hard', points: '60-100 pts', color: '#EF4444' },
  ];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#1F2937', '#374151']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Choose Your Game</Text>
        <Text style={styles.headerSubtitle}>
          Test your knowledge with AR-powered questions
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Game Mode Selection */}
        <Text style={styles.sectionTitle}>Game Mode</Text>
        <View style={styles.gameModeContainer}>
          <TouchableOpacity
            style={styles.gameModeButton}
            onPress={() => router.push('/game/single-player')}
          >
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              style={styles.gameModeGradient}
            >
              <Play size={28} color="white" />
              <Text style={styles.gameModeText}>Single Player</Text>
              <Text style={styles.gameModeDescription}>
                AR head gestures • Solo practice
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gameModeButton}
            onPress={() => router.push('/game/party-mode')}
          >
            <LinearGradient
              colors={['#F59E0B', '#EF4444']}
              style={styles.gameModeGradient}
            >
              <Users size={28} color="white" />
              <Text style={styles.gameModeText}>Party Mode</Text>
              <Text style={styles.gameModeDescription}>
                Multiplayer • Friends can see the question
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Difficulty Selection */}
        <Text style={styles.sectionTitle}>Difficulty Level</Text>
        <View style={styles.difficultyContainer}>
          {difficulties.map((difficulty) => (
            <TouchableOpacity
              key={difficulty.level}
              style={[
                styles.difficultyButton,
                selectedDifficulty === difficulty.level && styles.selectedDifficulty,
                { borderColor: difficulty.color }
              ]}
              onPress={() => setSelectedDifficulty(difficulty.level as any)}
            >
              <View style={styles.difficultyHeader}>
                <Text style={[
                  styles.difficultyName,
                  selectedDifficulty === difficulty.level && { color: difficulty.color }
                ]}>
                  {difficulty.name}
                </Text>
                <Text style={[
                  styles.difficultyPoints,
                  { color: difficulty.color }
                ]}>
                  {difficulty.points}
                </Text>
              </View>
              {selectedDifficulty === difficulty.level && (
                <Zap size={16} color={difficulty.color} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Category Selection */}
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategory === category.id && styles.selectedCategory,
                { borderColor: category.color }
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
              {selectedCategory === category.id && (
                <View style={[styles.selectedIndicator, { backgroundColor: category.color }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Start Options */}
        <View style={styles.quickStartContainer}>
          <TouchableOpacity
            style={styles.quickStartButton}
            onPress={() => router.push('/game/ar-camera')}
          >
            <LinearGradient
              colors={['#06B6D4', '#3B82F6']}
              style={styles.quickStartGradient}
            >
              <BookOpen size={24} color="white" />
              <Text style={styles.quickStartText}>Start AR Game Now</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(tabs)/leaderboard')}
          >
            <Trophy size={20} color="#8B5CF6" />
            <Text style={styles.secondaryButtonText}>View Leaderboard</Text>
          </TouchableOpacity>
        </View>
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
    marginTop: 20,
  },
  gameModeContainer: {
    gap: 12,
  },
  gameModeButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gameModeGradient: {
    padding: 20,
    alignItems: 'center',
  },
  gameModeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  gameModeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  difficultyContainer: {
    gap: 12,
  },
  difficultyButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedDifficulty: {
    backgroundColor: '#F8FAFC',
  },
  difficultyHeader: {
    flex: 1,
  },
  difficultyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  difficultyPoints: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  selectedCategory: {
    backgroundColor: '#F8FAFC',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  quickStartContainer: {
    marginTop: 30,
    gap: 12,
  },
  quickStartButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickStartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 8,
  },
  quickStartText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
});