import { useFocusEffect } from '@react-navigation/native';
import { useAudioPlayer } from 'expo-audio';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { deleteAudioFile, loadSessions, saveSessions } from '../utils/storage';

export default function SessionsTab() {
  const [sessions, setSessions] = useState([]);
  const [currentUri, setCurrentUri] = useState(null); // URI of currently playing session
  const [playingId, setPlayingId] = useState(null);

  // Load sessions whenever the component mounts
  useFocusEffect(
  useCallback(() => {
    // Reload sessions every time the tab is focused
    loadSessionsData();
  }, [])
);

  const loadSessionsData = async () => {
    const saved = await loadSessions();
    setSessions(saved);
  };

  // Hook at top level for playback
  const player = useAudioPlayer();

  // Play a session
  const playSession = async (session) => {
    try {
      // Stop current player
      if (currentUri) {
        player.pause();
      }

      // Set new URI for hook
      setCurrentUri(session.audioUri);
      setPlayingId(session.id);
      player.replace(session.audioUri);
      console.log('Playing URI:', session.audioUri);

      // Start playing
      player.seekTo(0);
      player.play();

      // Optionally monitor playback completion
      const interval = setInterval(() => {
        if (player.didJustFinish) {
          clearInterval(interval);
        //   setPlayingId(null);
        //   setCurrentUri(null);
        }
      }, 200);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not play recording');
    }
  };

  const stopPlaying = () => {
    if (currentUri) {
      player.pause();
      setPlayingId(null);
      setCurrentUri(null);
    }
  };

  const deleteSession = async (session) => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete audio file
              await deleteAudioFile(session.audioUri);

              // Remove from sessions and save
              const updated = sessions.filter((s) => s.id !== session.id);
              setSessions(updated);
              await saveSessions(updated);

              // Stop if currently playing
              if (playingId === session.id) stopPlaying();
            } catch (error) {
              console.error('Error deleting session:', error);
              Alert.alert('Error', 'Could not delete recording');
            }
          },
        },
      ]
    );
  };

  const renderSession = ({ item }) => (
    <View style={styles.sessionItem}>
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionName}>{item.name}</Text>
        <Text style={styles.sessionDate}>
          {item.date} — Duration: {item.duration}s
        </Text>
      </View>

      <View style={styles.sessionButtons}>
        <Pressable
          style={[styles.button, styles.playButton]}
          onPress={() =>
            playingId === item.id ? stopPlaying() : playSession(item)
          }
        >
          <Text style={styles.buttonText}>
            {playingId === item.id ? '⏹ Stop' : '▶️ Play'}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.deleteButton]}
          onPress={() => deleteSession(item)}
        >
          <Text style={styles.buttonText}>🗑️ Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.analysisBox}>
        <Text style={styles.analysisTitle}>Analysis</Text>
        <Text style={styles.analysisText}>To be developed...</Text>
      </View>

      <Text style={styles.title}>Your Sessions</Text>

      {sessions.length === 0 ? (
        <Text style={styles.emptyText}>No sessions recorded yet.</Text>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={renderSession}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  analysisBox: { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 16 },
  analysisTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  analysisText: { color: '#666' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 20 },
  list: { paddingBottom: 100 },
  sessionItem: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#ddd' },
  sessionInfo: { marginBottom: 12 },
  sessionName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  sessionDate: { fontSize: 14, color: '#666' },
  sessionButtons: { flexDirection: 'row', gap: 8 },
  button: { flex: 1, padding: 10, borderRadius: 6, alignItems: 'center' },
  playButton: { backgroundColor: '#2196F3' },
  deleteButton: { backgroundColor: '#f44336' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
