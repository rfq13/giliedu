import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Filter,
} from 'lucide-react-native';

interface LeaderboardPlayer {
  id: string;
  name: string;
  points: number;
  level: number;
  rank: number;
  streak: number;
  avatar: string;
}

export default function LeaderboardScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'all-time'>('weekly');

  const leaderboardData: LeaderboardPlayer[] = [
    { id: '1', name: 'Sarah Chen', points: 4250, level: 18, rank: 1, streak: 12, avatar: '👩‍🎓' },
    { id: '2', name: 'Alex Rivera', points: 3890, level: 16, rank: 2, streak: 8, avatar: '🧑‍🚀' },
    { id: '3', name: 'Maya Johnson', points: 3720, level: 15, rank: 3, streak: 15, avatar: '👩‍🔬' },
    { id: '4', name: 'David Kim', points: 3480, level: 14, rank: 4, streak: 6, avatar: '🧑‍💻' },
    { id: '5', name: 'Emma Wilson', points: 3210, level: 13, rank: 5, streak: 9, avatar: '👩‍🎨' },
    { id: '6', name: 'Lucas Brown', points: 2940, level: 12, rank: 6, streak: 4, avatar: '🧑‍🏫' },
    { id: '7', name: 'Zoe Davis', points: 2840, level: 12, rank: 7, streak: 7, avatar: '👩‍⚕️' },
    { id: '8', name: 'You', points: 2780, level: 11, rank: 8, streak: 5, avatar: '😊' },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={24} color="#FFD700" />;
      case 2:
        return <Medal size={24} color="#C0C0C0" />;
      case 3:
        return <Medal size={24} color="#CD7F32" />;
      default:
        return (
          <View style={styles.rankNumber}>
            <Text style={styles.rankText}>{rank}</Text>
          </View>
        );
    }
  };

  const periods = [
    { key: 'daily', label: 'Today' },
    { key: 'weekly', label: 'This Week' },
    { key: 'all-time', label: 'All Time' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#EC4899']}
        style={styles.header}
      >
        <Trophy size={32} color="white" />
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <Text style={styles.headerSubtitle}>
          Compete with players worldwide
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Time Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.selectedPeriod
              ]}
              onPress={() => setSelectedPeriod(period.key as any)}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period.key && styles.selectedPeriodText
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Top 3 Podium */}
        <View style={styles.podiumContainer}>
          {/* Second Place */}
          <View style={styles.podiumPosition}>
            <View style={[styles.podiumCard, styles.secondPlace]}>
              <Text style={styles.podiumAvatar}>{leaderboardData[1].avatar}</Text>
              <Text style={styles.podiumName}>{leaderboardData[1].name}</Text>
              <Text style={styles.podiumPoints}>{leaderboardData[1].points}</Text>
            </View>
            <View style={[styles.podiumBase, { height: 60, backgroundColor: '#C0C0C0' }]}>
              <Text style={styles.podiumRank}>2</Text>
            </View>
          </View>

          {/* First Place */}
          <View style={styles.podiumPosition}>
            <View style={[styles.podiumCard, styles.firstPlace]}>
              <Crown size={20} color="#FFD700" />
              <Text style={styles.podiumAvatar}>{leaderboardData[0].avatar}</Text>
              <Text style={styles.podiumName}>{leaderboardData[0].name}</Text>
              <Text style={styles.podiumPoints}>{leaderboardData[0].points}</Text>
            </View>
            <View style={[styles.podiumBase, { height: 80, backgroundColor: '#FFD700' }]}>
              <Text style={styles.podiumRank}>1</Text>
            </View>
          </View>

          {/* Third Place */}
          <View style={styles.podiumPosition}>
            <View style={[styles.podiumCard, styles.thirdPlace]}>
              <Text style={styles.podiumAvatar}>{leaderboardData[2].avatar}</Text>
              <Text style={styles.podiumName}>{leaderboardData[2].name}</Text>
              <Text style={styles.podiumPoints}>{leaderboardData[2].points}</Text>
            </View>
            <View style={[styles.podiumBase, { height: 40, backgroundColor: '#CD7F32' }]}>
              <Text style={styles.podiumRank}>3</Text>
            </View>
          </View>
        </View>

        {/* Full Leaderboard */}
        <View style={styles.leaderboardList}>
          <Text style={styles.sectionTitle}>Full Rankings</Text>
          
          {leaderboardData.map((player) => (
            <View
              key={player.id}
              style={[
                styles.playerCard,
                player.name === 'You' && styles.currentPlayerCard
              ]}
            >
              <View style={styles.playerRank}>
                {getRankIcon(player.rank)}
              </View>

              <View style={styles.playerInfo}>
                <Text style={styles.playerAvatar}>{player.avatar}</Text>
                <View style={styles.playerDetails}>
                  <Text style={[
                    styles.playerName,
                    player.name === 'You' && styles.currentPlayerName
                  ]}>
                    {player.name}
                  </Text>
                  <Text style={styles.playerLevel}>Level {player.level}</Text>
                </View>
              </View>

              <View style={styles.playerStats}>
                <Text style={styles.playerPoints}>{player.points.toLocaleString()}</Text>
                <View style={styles.streakContainer}>
                  <TrendingUp size={12} color="#10B981" />
                  <Text style={styles.streakText}>{player.streak} streak</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Your Stats */}
        <View style={styles.yourStatsContainer}>
          <LinearGradient
            colors={['#1F2937', '#374151']}
            style={styles.yourStatsCard}
          >
            <Text style={styles.yourStatsTitle}>Your Performance</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>8</Text>
                <Text style={styles.statLabel}>Rank</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>2,780</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>11</Text>
                <Text style={styles.statLabel}>Level</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>5</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
            </View>
          </LinearGradient>
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
    marginTop: 8,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    padding: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedPeriod: {
    backgroundColor: '#8B5CF6',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedPeriodText: {
    color: 'white',
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  podiumPosition: {
    alignItems: 'center',
  },
  podiumCard: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  firstPlace: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  secondPlace: {
    borderWidth: 2,
    borderColor: '#C0C0C0',
  },
  thirdPlace: {
    borderWidth: 2,
    borderColor: '#CD7F32',
  },
  podiumAvatar: {
    fontSize: 32,
    marginBottom: 4,
  },
  podiumName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 2,
  },
  podiumPoints: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  podiumBase: {
    width: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumRank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  leaderboardList: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  playerCard: {
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
  currentPlayerCard: {
    borderWidth: 2,
    borderColor: '#8B5CF6',
    backgroundColor: '#F8FAFC',
  },
  playerRank: {
    width: 40,
    alignItems: 'center',
  },
  rankNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  playerAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  currentPlayerName: {
    color: '#8B5CF6',
  },
  playerLevel: {
    fontSize: 12,
    color: '#6B7280',
  },
  playerStats: {
    alignItems: 'flex-end',
  },
  playerPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 2,
  },
  yourStatsContainer: {
    marginTop: 8,
  },
  yourStatsCard: {
    borderRadius: 16,
    padding: 20,
  },
  yourStatsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});