import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TrendingUp,
  MessageCircle,
  Lightbulb,
  Heart,
  Star,
  Award,
} from 'lucide-react-native';

interface Skill {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  progress: number;
  icon: React.ReactNode;
  color: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  date: string;
  type: 'story' | 'achievement';
  score?: number;
}

export default function ProgressScreen() {
  const skills: Skill[] = [
    {
      id: '1',
      name: 'Kejelasan Bertutur',
      description: 'Kemampuan menyampaikan ide dengan jelas',
      level: 3,
      maxLevel: 10,
      progress: 65,
      icon: <MessageCircle size={24} color="#8B5CF6" />,
      color: '#8B5CF6',
    },
    {
      id: '2',
      name: 'Alur Cerita',
      description: 'Kemampuan menyusun cerita yang runtut',
      level: 2,
      maxLevel: 10,
      progress: 45,
      icon: <Lightbulb size={24} color="#F59E0B" />,
      color: '#F59E0B',
    },
    {
      id: '3',
      name: 'Ekspresi Perasaan',
      description: 'Kemampuan mengungkapkan emosi dalam cerita',
      level: 4,
      maxLevel: 10,
      progress: 80,
      icon: <Heart size={24} color="#EC4899" />,
      color: '#EC4899',
    },
    {
      id: '4',
      name: 'Kreativitas',
      description: 'Kemampuan mengembangkan ide unik',
      level: 2,
      maxLevel: 10,
      progress: 35,
      icon: <Star size={24} color="#10B981" />,
      color: '#10B981',
    },
  ];

  const portfolio: PortfolioItem[] = [
    { id: '1', title: 'Cerita: Liburan ke Pantai', date: 'Hari ini', type: 'story', score: 85 },
    { id: '2', title: 'Pencerita Pemula', date: 'Kemarin', type: 'achievement' },
    { id: '3', title: 'Cerita: Hewan Peliharaanku', date: '2 hari lalu', type: 'story', score: 78 },
    { id: '4', title: '5 Cerita Selesai!', date: '3 hari lalu', type: 'achievement' },
  ];

  const totalStories = 5;
  const overallLevel = 3;

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        style={styles.header}
      >
        <TrendingUp size={32} color="white" />
        <Text style={styles.headerTitle}>Progress Belajar</Text>
        <Text style={styles.headerSubtitle}>
          Lihat perkembangan skill komunikasimu
        </Text>

        <View style={styles.overviewCard}>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewValue}>Level {overallLevel}</Text>
            <Text style={styles.overviewLabel}>Pencerita Muda</Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewItem}>
            <Text style={styles.overviewValue}>{totalStories}</Text>
            <Text style={styles.overviewLabel}>Total Cerita</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Skill Komunikasi</Text>
        
        <View style={styles.skillsContainer}>
          {skills.map((skill) => (
            <View key={skill.id} style={styles.skillCard}>
              <View style={styles.skillHeader}>
                <View style={[styles.skillIconContainer, { backgroundColor: `${skill.color}20` }]}>
                  {skill.icon}
                </View>
                <View style={styles.skillInfo}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <Text style={styles.skillDescription}>{skill.description}</Text>
                </View>
                <View style={styles.skillLevel}>
                  <Text style={[styles.skillLevelText, { color: skill.color }]}>
                    Lv.{skill.level}
                  </Text>
                </View>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${skill.progress}%`, backgroundColor: skill.color }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{skill.progress}%</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Portofolio</Text>
        
        <View style={styles.portfolioContainer}>
          {portfolio.map((item) => (
            <View key={item.id} style={styles.portfolioCard}>
              <View style={[
                styles.portfolioIcon,
                { backgroundColor: item.type === 'achievement' ? '#FEF3C7' : '#EDE9FE' }
              ]}>
                {item.type === 'achievement' ? (
                  <Award size={20} color="#F59E0B" />
                ) : (
                  <MessageCircle size={20} color="#8B5CF6" />
                )}
              </View>
              <View style={styles.portfolioContent}>
                <Text style={styles.portfolioTitle}>{item.title}</Text>
                <Text style={styles.portfolioDate}>{item.date}</Text>
              </View>
              {item.score && (
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreText}>{item.score}</Text>
                  <Text style={styles.scoreLabel}>skor</Text>
                </View>
              )}
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
    marginBottom: 20,
  },
  overviewCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  overviewItem: {
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  overviewLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  overviewDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 32,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  skillsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  skillCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skillIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  skillDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  skillLevel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  skillLevelText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    width: 36,
    textAlign: 'right',
  },
  portfolioContainer: {
    gap: 12,
  },
  portfolioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  portfolioIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  portfolioContent: {
    flex: 1,
  },
  portfolioTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  portfolioDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
});