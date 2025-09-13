import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Users,
  Plus,
  X,
  Play,
  Settings,
  Clock,
  Trophy,
} from 'lucide-react-native';

interface Player {
  id: string;
  name: string;
  avatar: string;
}

export default function PartyModeScreen() {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'You', avatar: '😊' },
  ]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [gameSettings, setGameSettings] = useState({
    questionsPerPlayer: 5,
    timeLimit: 30,
    difficulty: 'mixed' as 'easy' | 'medium' | 'hard' | 'mixed',
  });

  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < 8) {
      const avatars = ['🤓', '😎', '🥸', '🤠', '🤩', '😊', '🙂', '😄'];
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
        avatar: avatars[players.length % avatars.length],
      };
      setPlayers([...players, newPlayer]);
      setNewPlayerName('');
      setShowAddPlayer(false);
    }
  };

  const removePlayer = (playerId: string) => {
    if (players.length > 1) {
      setPlayers(players.filter(player => player.id !== playerId));
    }
  };

  const startPartyGame = () => {
    router.push({
      pathname: '/game/party-play',
      params: {
        players: JSON.stringify(players),
        settings: JSON.stringify(gameSettings),
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#F59E0B', '#EF4444']}
        style={styles.header}
      >
        <Users size={32} color="white" />
        <Text style={styles.headerTitle}>Party Mode</Text>
        <Text style={styles.headerSubtitle}>
          Play with friends and family
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Players Section */}
        <View style={styles.playersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Players ({players.length}/8)
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddPlayer(true)}
              disabled={players.length >= 8}
            >
              <Plus size={20} color="#8B5CF6" />
            </TouchableOpacity>
          </View>

          <View style={styles.playersList}>
            {players.map((player, index) => (
              <View key={player.id} style={styles.playerCard}>
                <Text style={styles.playerAvatar}>{player.avatar}</Text>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerRole}>
                  {index === 0 ? 'Host' : 'Player'}
                </Text>
                {index > 0 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removePlayer(player.id)}
                  >
                    <X size={16} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Add Player Form */}
          {showAddPlayer && (
            <View style={styles.addPlayerForm}>
              <TextInput
                style={styles.playerNameInput}
                placeholder="Enter player name"
                value={newPlayerName}
                onChangeText={setNewPlayerName}
                maxLength={20}
              />
              <View style={styles.addPlayerButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddPlayer(false);
                    setNewPlayerName('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={addPlayer}
                  disabled={!newPlayerName.trim()}
                >
                  <Text style={styles.confirmButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Game Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Game Settings</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Clock size={20} color="#6B7280" />
              <Text style={styles.settingTitle}>Questions per Player</Text>
            </View>
            <View style={styles.settingOptions}>
              {[3, 5, 10].map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.settingOption,
                    gameSettings.questionsPerPlayer === count && styles.activeOption
                  ]}
                  onPress={() => setGameSettings(prev => ({ ...prev, questionsPerPlayer: count }))}
                >
                  <Text style={[
                    styles.optionText,
                    gameSettings.questionsPerPlayer === count && styles.activeOptionText
                  ]}>
                    {count}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Trophy size={20} color="#6B7280" />
              <Text style={styles.settingTitle}>Time per Question</Text>
            </View>
            <View style={styles.settingOptions}>
              {[15, 30, 60].map((seconds) => (
                <TouchableOpacity
                  key={seconds}
                  style={[
                    styles.settingOption,
                    gameSettings.timeLimit === seconds && styles.activeOption
                  ]}
                  onPress={() => setGameSettings(prev => ({ ...prev, timeLimit: seconds }))}
                >
                  <Text style={[
                    styles.optionText,
                    gameSettings.timeLimit === seconds && styles.activeOptionText
                  ]}>
                    {seconds}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Settings size={20} color="#6B7280" />
              <Text style={styles.settingTitle}>Difficulty</Text>
            </View>
            <View style={styles.settingOptions}>
              {[
                { key: 'easy', label: 'Easy', color: '#10B981' },
                { key: 'mixed', label: 'Mixed', color: '#8B5CF6' },
                { key: 'hard', label: 'Hard', color: '#EF4444' },
              ].map((difficulty) => (
                <TouchableOpacity
                  key={difficulty.key}
                  style={[
                    styles.settingOption,
                    gameSettings.difficulty === difficulty.key && styles.activeOption,
                    { borderColor: difficulty.color }
                  ]}
                  onPress={() => setGameSettings(prev => ({ ...prev, difficulty: difficulty.key as any }))}
                >
                  <Text style={[
                    styles.optionText,
                    gameSettings.difficulty === difficulty.key && { color: difficulty.color }
                  ]}>
                    {difficulty.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Game Rules */}
        <View style={styles.rulesSection}>
          <Text style={styles.sectionTitle}>How to Play</Text>
          <View style={styles.rulesCard}>
            <Text style={styles.ruleText}>
              • Each player takes turns answering questions
            </Text>
            <Text style={styles.ruleText}>
              • The question appears on the player's forehead using AR
            </Text>
            <Text style={styles.ruleText}>
              • Other players can see the question and give hints
            </Text>
            <Text style={styles.ruleText}>
              • Tilt your head left or right to answer
            </Text>
            <Text style={styles.ruleText}>
              • Points are awarded for correct answers
            </Text>
            <Text style={styles.ruleText}>
              • Player with the most points wins!
            </Text>
          </View>
        </View>

        {/* Start Game Button */}
        <TouchableOpacity
          style={[
            styles.startButton,
            players.length < 2 && styles.disabledButton
          ]}
          onPress={startPartyGame}
          disabled={players.length < 2}
        >
          <LinearGradient
            colors={players.length >= 2 ? ['#F59E0B', '#EF4444'] : ['#9CA3AF', '#6B7280']}
            style={styles.startButtonGradient}
          >
            <Play size={24} color="white" />
            <Text style={styles.startButtonText}>Start Party Game</Text>
          </LinearGradient>
        </TouchableOpacity>

        {players.length < 2 && (
          <Text style={styles.minimumPlayersText}>
            Add at least one more player to start the game
          </Text>
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
  playersSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  playersList: {
    gap: 12,
  },
  playerCard: {
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
  playerAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  playerRole: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  addPlayerForm: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderStyle: 'dashed',
  },
  playerNameInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  addPlayerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  settingsSection: {
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
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  settingOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  settingOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  activeOption: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F8FAFC',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeOptionText: {
    color: '#8B5CF6',
  },
  rulesSection: {
    marginBottom: 32,
  },
  rulesCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  ruleText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
    lineHeight: 20,
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.6,
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
  minimumPlayersText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});