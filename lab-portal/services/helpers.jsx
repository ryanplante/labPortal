import { Alert, Platform } from 'react-native';

export const crossPlatformAlert = (title, message) => {
    if (Platform.OS === 'web') {
      // Use the native browser alert for web
      window.alert(`${title}\n\n${message}`);
    } else {
      // Use the React Native Alert for iOS and Android
      Alert.alert(title, message);
    }
  };