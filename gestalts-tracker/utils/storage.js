import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

// Save recording metadata
export async function saveSessions(sessions) {
  try {
    await AsyncStorage.setItem('sessions', JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving sessions:', error);
  }
}

// Load recording metadata
export async function loadSessions() {
  try {
    const data = await AsyncStorage.getItem('sessions');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading sessions:', error);
    return [];
  }
}

// Save audio file to phone storage
export async function saveAudioFile(audioUri) {
  try {
    const fileName = `recording-${Date.now()}.m4a`;
    const permanentUri = FileSystem.documentDirectory + fileName;

    await FileSystem.moveAsync({
      from: audioUri,
      to: permanentUri,
    });

    return permanentUri;
  } catch (error) {
    console.error('Error saving audio file:', error);
    throw error;
  }
}

// Delete audio file
export async function deleteAudioFile(uri) {
  try {
    await FileSystem.deleteAsync(uri);
  } catch (error) {
    console.error('Error deleting audio file:', error);
  }
}
