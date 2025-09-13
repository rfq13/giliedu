import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Settings, Trophy, Star, CreditCard as Edit3, Camera, Bell, Shield, LogOut, Zap } from 'lucide-react-native';

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [playerName, setPlayerName] = useState('Alex Rivera');

  const playerStats = {
    level: 12,
    points: 2840,
    gamesPlayed: 156,
    correctAnswers: 423,
    streak: 5,
    achievements: 8,
  };

  const achievements = [
    { id: 1, title: 'First Steps', description: 'Complete your first game', unlocked: true, icon: '🎯' },
    { id: 2, title: 'Science Whiz', description: 'Answer 50 science questions correctly', unlocked: true, icon: '🔬' },
    { id: 3, title: 'History Buff', description: 'Master 25 history questions', unlocked: true, icon: '🏛️' },
    { id: 4, title: 'Speed Demon', description: 'Answer 10 questions in 30 seconds', unlocked: false, icon: '⚡' },
    { id: 5, title: 'Perfect Score', description: 'Get 100% on a 20-question quiz', unlocked: false, icon: '💯' },
    { id: 6, title: 'Streak Master', description: 'Maintain a 10-day streak', unlocked: true, icon: '🔥' },
  ];

  const categories = [
    { name: 'Science', progress: 85, color: '#10B981' },
    { name: 'History', progress: 72, color: '#8B5CF6' },
    { name: 'Math', progress: 68, color: '#F59E0B' },
    { name: 'Language', progress: 91, color: '#EF4444' },
    { name: 'Geography', progress: 45, color: '#06B6D4' },
    { name: 'Art', progress: 33, color: '#EC4899' },
  ];

  const handleSaveName = () => {
    setIsEditing(false);
    // Here you would save to backend/storage
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <LinearGradient
        colors={['#8B5CF6', '#EC4899']}
        style={styles.header}
      >
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>🧑‍🚀</Text>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Camera size={16} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.nameContainer}>
            {isEditing ? (
              <View style={styles.editNameContainer}>
                <TextInput
                  style={styles.nameInput}
                  value={playerName}
                  onChangeText={setPlayerName}
                  onBlur={handleSaveName}
                  autoFocus
                />
                <TouchableOpacity onPress={handleSaveName}>
                  <Text style={styles.saveButton}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.nameRow}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.playerName}>{playerName}</Text>
                <Edit3 size={16} color="rgba(255, 255, 255, 0.7)" />
              </TouchableOpacity>
            )}
            
            <View style={styles.levelBadge}>
              <Star size={14} color="#FCD34D" />
              <Text style={styles.levelText}>Level {playerStats.level}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{playerStats.points.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{playerStats.gamesPlayed}</Text>
              <Text style={styles.statLabel}>Games Played</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{playerStats.correctAnswers}</Text>
              <Text style={styles.statLabel}>Correct Answers</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{playerStats.streak}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
          </View>
        </View>

        {/* Category Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.sectionTitle}>Category Progress</Text>
          {categories.map((category) => (
            <View key={category.name} style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={[styles.progressPercentage, { color: category.color }]}>
                  {category.progress}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${category.progress}%`, backgroundColor: category.color }
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Achievements */}
        <View style={styles.achievementsContainer}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  achievement.unlocked ? styles.unlockedAchievement : styles.lockedAchievement
                ]}
              >
                <Text style={[
                  styles.achievementIcon,
                  !achievement.unlocked && styles.lockedIcon
                ]}>
                  {achievement.icon}
                </Text>
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
                {achievement.unlocked && (
                  <View style={styles.achievementBadge}>
                    <Trophy size={12} color="#F59E0B" />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Bell size={20} color="#6B7280" />
            <Text style={styles.settingText}>Notifications</Text>
            <Text style={styles.settingValue}>On</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Shield size={20} color="#6B7280" />
            <Text style={styles.settingText}>Privacy</Text>
            <Text style={styles.settingValue}>Secure</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Zap size={20} color="#6B7280" />
            <Text style={styles.settingText}>AR Sensitivity</Text>
            <Text style={styles.settingValue}>Medium</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, styles.logoutItem]}
            onPress={() => Alert.alert('Logout', 'Are you sure you want to logout?')}
          >
            <LogOut size={20} color="#EF4444" />
            <Text style={[styles.settingText, styles.logoutText]}>Logout</Text>
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
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    fontSize: 60,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 6,
  },
  nameContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 8,
  },
  editNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    flex: 1,
  },
  saveButton: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  levelText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
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
  statsContainer: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  achievementsContainer: {
    marginBottom: 30,
  },
  achievementsGrid: {
    gap: 12,
  },
  achievementCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    position: 'relative',
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
    borderLeftColor: '#10B981',
  },
  lockedAchievement: {
    opacity: 0.6,
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  lockedText: {
    color: '#9CA3AF',
  },
  achievementBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  settingsContainer: {
    marginBottom: 30,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
    flex: 1,
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutItem: {
    marginTop: 12,
  },
  logoutText: {
    color: '#EF4444',
  },
});