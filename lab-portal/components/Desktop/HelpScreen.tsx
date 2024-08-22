import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Platform } from 'react-native';
import { 
  getErrorLogsFromAsyncStorage, 
  getLatestErrorLog, 
  clearErrorLogs, 
  ErrorLog 
} from '../../services/errorLogService';
import { clearAppDataAndCache, reload } from '../../services/helpers';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import ConfirmationModal from '../Modals/ConfirmationModal';

const HelpScreen = () => {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]); 
  const [isConfirmationVisible, setIsConfirmationVisible] = useState<boolean>(false); 
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false); 
  const [alertMessage, setAlertMessage] = useState<string>(''); 
  const [confirmationType, setConfirmationType] = useState<'clearLogs' | 'clearData' | null>(null);
  const navigation = useNavigation<NavigationProp<any>>();

  useEffect(() => {
    const fetchErrorLogs = async () => {
      const logs = await getErrorLogsFromAsyncStorage();
      setErrorLogs(logs);
    };

    fetchErrorLogs();
  }, []);

  const generateLogsString = (): string => {
    return errorLogs.map(log => (
      `Timestamp: ${log.timestamp}\nDescription: ${log.description}\nStack: ${log.stack}\nSource: ${log.source}\nPlatform: ${log.platform}\nVersion: ${log.version}\n\n`
    )).join('-----\n');
  };

  const sendErrorLogs = () => {
    if (errorLogs.length === 0) {
      setAlertMessage('There are no logs to send.');
      setIsAlertVisible(true);
      return;
    }

    const logsString = generateLogsString();
    const subject = encodeURIComponent("Error Logs");
    const body = encodeURIComponent(`Please find the error logs below:\n\n${logsString}`);

    if (Platform.OS === 'web') {
      const element = document.createElement("a");
      const file = new Blob([logsString], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = "errorLogs.txt";
      document.body.appendChild(element);
      element.click();
    } else {
      Linking.openURL(`mailto:support@neit.edu?subject=${subject}&body=${body}`)
        .catch(err => console.error('Failed to open mail client:', err));
    }
  };

  const sendLatestLogToHelpDesk = async () => {
    try {
      const latestLog = await getLatestErrorLog();
      if (latestLog) {
        const subject = encodeURIComponent("Latest Error Log");
        const body = encodeURIComponent(`Please find the latest error log below:\n\nTimestamp: ${latestLog.timestamp}\nDescription: ${latestLog.description}\nStack: ${latestLog.stack}\nSource: ${latestLog.source}\nPlatform: ${latestLog.platform}\nVersion: ${latestLog.version}`);
        Linking.openURL(`mailto:support@neit.edu?subject=${subject}&body=${body}`)
          .catch(err => console.error('Failed to open mail client:', err));
      } else {
        setAlertMessage('There are no logs to send.');
        setIsAlertVisible(true);
      }
    } catch (error) {
      console.error('Failed to send latest log:', error);
      setAlertMessage('Failed to send the latest log.');
      setIsAlertVisible(true);
    }
  };

  const handleClearLogs = async () => {
    try {
      await clearErrorLogs();
      setErrorLogs([]);  
      setAlertMessage('All logs have been cleared successfully.');
      setIsAlertVisible(true);
    } catch (error) {
      console.error('Failed to clear logs:', error);
      setAlertMessage('Failed to clear logs.');
      setIsAlertVisible(true);
    }
  };

  const handleClearAllData = async () => {
    try {
      await clearAppDataAndCache();
      setAlertMessage('All app data and cache have been cleared successfully.');
      setIsAlertVisible(true);
      setConfirmationType('clearData'); // Keep track of this for reloading after OK
    } catch (error) {
      console.error('Failed to clear app data and cache:', error);
      setAlertMessage('Failed to clear app data and cache.');
      setIsAlertVisible(true);
    }
  };

  const handleClearDataPress = () => {
    setConfirmationType('clearData');
    setIsConfirmationVisible(true);
  };

  const handleClearLogsPress = () => {
    setConfirmationType('clearLogs');
    setIsConfirmationVisible(true);
  };

  const handleConfirm = () => {
    setIsConfirmationVisible(false);
    if (confirmationType === 'clearData') {
      handleClearAllData();
    } else if (confirmationType === 'clearLogs') {
      handleClearLogs();
    }
    setConfirmationType(null);
  };

  const handleCancel = () => {
    setIsConfirmationVisible(false);
  };

  const handleAlertDismiss = async () => {
    if (confirmationType === 'clearData') {
      await reload();
    }
    setIsAlertVisible(false);
    setConfirmationType(null); // Reset confirmation type after handling
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.instructions}>
          If you're experiencing issues, you can send the error logs to our support team.
          {Platform.OS === 'web' ? 
            "Click the button below to download the logs and attach them to your email." :
            "Click the button below to send the logs directly."}
        </Text>
        <TouchableOpacity style={styles.button} onPress={sendErrorLogs}>
          <Text style={styles.buttonText}>
            {Platform.OS === 'web' ? "Download Error Logs" : "Send Error Logs"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={sendLatestLogToHelpDesk}>
          <Text style={styles.buttonText}>Send Latest Log to Help Desk</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => Linking.openURL('mailto:support@neit.edu')}>
          <Text style={styles.buttonText}>Email Help Desk</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => Linking.openURL('https://labportal-wiki.netlify.app/')}>
          <Text style={styles.buttonText}>View Help & Documentation</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleClearLogsPress}>
          <Text style={styles.buttonText}>Clear Logs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.redButton]} onPress={handleClearDataPress}>
          <Text style={styles.buttonText}>Clear All App Data & Cache</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>

      <ConfirmationModal
        visible={isConfirmationVisible}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        type={confirmationType === 'clearData' ? 'yesNoDanger' : 'yesNo'} 
        title={<Text style={{ fontSize: 18, fontWeight: 'bold' }}>Are you sure you want to proceed?</Text>}
        description={
          confirmationType === 'clearData' 
            ? <Text style={{ fontSize: 14, color: 'red' }}>Warning: This action will log you out and cannot be undone!</Text>
            : <Text style={{ fontSize: 14 }}>Are you sure you want to clear all logs? Support won't be able to help you if you haven't sent them!</Text>
        }
      />

      <ConfirmationModal
        visible={isAlertVisible}
        onConfirm={handleAlertDismiss}
        onCancel={handleAlertDismiss}
        type="ok" 
        title={<Text style={{ fontSize: 18, fontWeight: 'bold' }}>Notice</Text>}
        description={<Text style={{ fontSize: 14 }}>{alertMessage}</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#ffc107',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  redButton: {
    backgroundColor: '#ff4d4d', 
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
});

export default HelpScreen;
