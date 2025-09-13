import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Play,
  Users,
  Book,
  Trophy,
  Star,
  Zap,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const playerLevel = 12;
  const playerPoints = 2840;
  const nextLevelPoints = 3000;

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#8B5CF6', '#EC4899']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.playerName}>Alex</Text>
          
          <View style={styles.levelContainer}>
            <View style={styles.levelBadge}>
              <Star size={16} color="#FCD34D" />
              <Text style={styles.levelText}>Level {playerLevel}</Text>
            </View>
            
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsText}>{playerPoints} points</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${(playerPoints / nextLevelPoints) * 100}%` }
                  ]}
                />
              </View>
              <Text style={styles.nextLevelText}>
                {nextLevelPoints - playerPoints} to next level
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Quick Play</Text>
        
        <View style={styles.gameModesContainer}>
          <TouchableOpacity
            style={[styles.gameModeCard, styles.singlePlayerCard]}
            onPress={() => router.push('/game/single-player')}
          >
            <LinearGradient
              colors={['#06B6D4', '#3B82F6']}
              style={styles.gameModeGradient}
            >
              <Play size={32} color="white" />
              <Text style={styles.gameModeTitle}>Single Player</Text>
              <Text style={styles.gameModeSubtitle}>
                Practice and improve your knowledge
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gameModeCard, styles.partyModeCard]}
            onPress={() => router.push('/game/party-mode')}
          >
            <LinearGradient
              colors={['#F59E0B', '#EF4444']}
              style={styles.gameModeGradient}
            >
              <Users size={32} color="white" />
              <Text style={styles.gameModeTitle}>Party Mode</Text>
              <Text style={styles.gameModeSubtitle}>
                Play with friends and family
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Categories</Text>
        
        <View style={styles.categoriesContainer}>
          {[
            { name: 'Science', icon: '🔬', color: '#10B981' },
            { name: 'History', icon: '🏛️', color: '#8B5CF6' },
            { name: 'Math', icon: '🧮', color: '#F59E0B' },
            { name: 'Language', icon: '📚', color: '#EF4444' },
          ].map((category) => (
            <TouchableOpacity
              key={category.name}
              style={[
                styles.categoryCard,
                { borderLeftColor: category.color }
              ]}
              onPress={() => router.push(`/game/category/${category.name.toLowerCase()}`)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Zap size={16} color={category.color} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Achievements</Text>
        
        <View style={styles.achievementsContainer}>
          {[
            { title: 'First Win', description: 'Win your first game', unlocked: true },
            { title: 'Science Master', description: 'Answer 50 science questions', unlocked: true },
            { title: 'Speed Demon', description: 'Answer 10 questions in 30 seconds', unlocked: false },
          ].map((achievement, index) => (
            <View
              key={index}
              style={[
                styles.achievementCard,
                achievement.unlocked ? styles.unlockedAchievement : styles.lockedAchievement
              ]}
            >
              <Trophy
                size={20}
                color={achievement.unlocked ? '#F59E0B' : '#9CA3AF'}
              />
              <View style={styles.achievementText}>
                <Text style={[
                  styles.achievementTitle,
                  !achievement.unlocked && styles.lockedText
                ]}>
                  {achievement.title}
                </Text>
                <Text style={[
                  styles.achievementDescription,
                  !achievement.unlocked && styles.lockedText
                ]}>
                  {achievement.description}
                </Text>
              </View>
            </View>
          ))}
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
  },
  headerContent: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  playerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  levelContainer: {
    alignItems: 'center',
    width: '100%',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  levelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  pointsContainer: {
    alignItems: 'center',
    width: '100%',
  },
  pointsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FCD34D',
    borderRadius: 4,
  },
  nextLevelText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  gameModesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  gameModeCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  singlePlayerCard: {},
  partyModeCard: {},
  gameModeGradient: {
    padding: 20,
    alignItems: 'center',
  },
  gameModeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  gameModeSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  categoriesContainer: {
    gap: 12,
    marginBottom: 30,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
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
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  achievementsContainer: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  unlockedAchievement: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  lockedAchievement: {
    opacity: 0.6,
  },
  achievementText: {
    marginLeft: 12,
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  lockedText: {
    color: '#9CA3AF',
  },
});