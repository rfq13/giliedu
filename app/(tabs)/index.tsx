import React from 'react';
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
  Mic,
  BookOpen,
  Clock,
  CheckCircle,
  ChevronRight,
} from 'lucide-react-native';

interface TimelineItem {
  id: string;
  type: 'story' | 'feedback' | 'milestone';
  title: string;
  description: string;
  date: string;
  status?: 'completed' | 'pending';
}

const mockTimeline: TimelineItem[] = [
  {
    id: '1',
    type: 'story',
    title: 'Cerita: Liburan ke Pantai',
    description: 'Kamu bercerita tentang pengalaman liburan',
    date: 'Hari ini',
    status: 'completed',
  },
  {
    id: '2',
    type: 'feedback',
    title: 'Feedback AI',
    description: 'Alur ceritamu sudah bagus! Coba tambahkan detail perasaan.',
    date: 'Hari ini',
  },
  {
    id: '3',
    type: 'milestone',
    title: 'Level Naik!',
    description: 'Selamat! Kamu naik ke Level 3 - Pencerita Muda',
    date: 'Kemarin',
  },
  {
    id: '4',
    type: 'story',
    title: 'Cerita: Hewan Peliharaanku',
    description: 'Kamu bercerita tentang kucing kesayangan',
    date: '2 hari lalu',
    status: 'completed',
  },
];

export default function TimelineScreen() {
  const userName = 'Siswa';
  const userLevel = 3;
  const totalStories = 5;

  const getIconForType = (type: TimelineItem['type']) => {
    switch (type) {
      case 'story':
        return <Mic size={20} color="#8B5CF6" />;
      case 'feedback':
        return <BookOpen size={20} color="#10B981" />;
      case 'milestone':
        return <CheckCircle size={20} color="#F59E0B" />;
    }
  };

  const getColorForType = (type: TimelineItem['type']) => {
    switch (type) {
      case 'story':
        return '#8B5CF6';
      case 'feedback':
        return '#10B981';
      case 'milestone':
        return '#F59E0B';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#8B5CF6', '#6366F1']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Selamat datang,</Text>
          <Text style={styles.userName}>{userName}!</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Level {userLevel}</Text>
              <Text style={styles.statLabel}>Pencerita Muda</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalStories}</Text>
              <Text style={styles.statLabel}>Cerita</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/(tabs)/game')}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.ctaGradient}
          >
            <Mic size={24} color="white" />
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaTitle}>Mulai Bercerita</Text>
              <Text style={styles.ctaSubtitle}>Rekam atau tulis ceritamu</Text>
            </View>
            <ChevronRight size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.timelineHeader}>
          <Clock size={20} color="#6B7280" />
          <Text style={styles.sectionTitle}>Riwayat Aktivitas</Text>
        </View>
        
        <View style={styles.timeline}>
          {mockTimeline.map((item, index) => (
            <View key={item.id} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, { backgroundColor: getColorForType(item.type) }]}>
                  {getIconForType(item.type)}
                </View>
                {index < mockTimeline.length - 1 && <View style={styles.timelineLine} />}
              </View>
              
              <View style={styles.timelineContent}>
                <View style={styles.timelineCard}>
                  <Text style={styles.timelineDate}>{item.date}</Text>
                  <Text style={styles.timelineTitle}>{item.title}</Text>
                  <Text style={styles.timelineDescription}>{item.description}</Text>
                  {item.status === 'completed' && (
                    <View style={styles.statusBadge}>
                      <CheckCircle size={12} color="#10B981" />
                      <Text style={styles.statusText}>Selesai</Text>
                    </View>
                  )}
                </View>
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
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 24,
  },
  content: {
    padding: 20,
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  ctaTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  ctaSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  timeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
    width: 48,
  },
  timelineDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  timelineDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
});