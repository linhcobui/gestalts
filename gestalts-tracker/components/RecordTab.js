import {
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
    useAudioRecorder,
    useAudioRecorderState,
} from 'expo-audio';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { loadSessions, saveAudioFile, saveSessions } from '../utils/storage';

export default function RecordTab() {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission Denied', 'Please allow microphone access');
        return;
      }

      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      setIsReady(true);
    })();
  }, []);

  const startRecording = async () => {
    try {
      if (!isReady) return;
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Could not start recording');
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (!uri) throw new Error('Recording failed');

      // Save permanently
      const permanentUri = await saveAudioFile(uri);

      // Save session metadata
      const sessions = await loadSessions();
      const session = {
        id: Date.now().toString(),
        name: `Session ${new Date().toLocaleString()}`,
        date: new Date().toLocaleString(),
        duration: Math.round(recorderState.durationMillis / 1000) || 0,
        audioUri: permanentUri,
      };
      sessions.push(session);
      await saveSessions(sessions);

      Alert.alert('Success', 'Recording saved!');
      console.log('Saved at:', permanentUri);
      console.log('Session metadata:', session);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not save recording');
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Record Session</Text>

      {recorderState.isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>Recording...</Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.recordButton,
          recorderState.isRecording && styles.recordButtonActive,
        ]}
        onPress={recorderState.isRecording ? stopRecording : startRecording}
      >
        <Text style={styles.recordButtonText}>
          {recorderState.isRecording ? 'Stop Recording' : 'Start Recording'}
        </Text>
      </TouchableOpacity>

      {recorderState.isRecording && (
        <Text style={styles.hint}>Keep the app open while recording</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  recordButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 50,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recordButtonActive: {
    backgroundColor: '#f44336',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f44336',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 18,
    color: '#f44336',
    fontWeight: 'bold',
  },
  hint: {
    marginTop: 20,
    color: '#666',
    textAlign: 'center',
  },
});
