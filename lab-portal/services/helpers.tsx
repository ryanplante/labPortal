import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import { CreateErrorLog } from './errorLogService';

export const crossPlatformAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      // Use the native browser alert for web
      window.alert(`${title}\n\n${message}`);
    } else {
      // Use the React Native Alert for iOS and Android
      Alert.alert(title, message);
    }
  };

  export const clearAppDataAndCache = async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
      console.log('App data and cache cleared.');
    } catch (error) {
      console.error('Failed to clear app data and cache:', error);
    }
  };

  export const reload = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Updates.reloadAsync(); // Reload the app using Expo's reload for iOS
      } else {
        window.location.reload(); // Restart the app using window.location.reload for other platforms
      }
    } catch (error) {
      await CreateErrorLog(error, 'reload', 99999999, 'error');
      throw new Error('An error occurred. Please contact the administrator.');
    }
  };