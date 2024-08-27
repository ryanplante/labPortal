import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, Keyboard, SafeAreaView, StatusBar } from 'react-native';
import { Picker } from '@react-native-picker/picker';
const MobileChat = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>('');
  const [status, setStatus] = useState<string>('available');

  // useEffect(() => {
  //   const handleKeyPress = (e: KeyboardEvent) => {
  //     if (e.key === 'Enter' && !e.shiftKey && Platform.OS === 'web') {
  //       e.preventDefault();
  //       handleSend();
  //     }
  //   };

  //   document.addEventListener('keydown', handleKeyPress);

  //   return () => {
  //     document.removeEventListener('keydown', handleKeyPress);
  //   };
  // }, [input]);

// -- NOTE: --
  //above code crashes the app when run, commented out for styling purposes

  const handleSend = () => {
    if (input.trim() !== '') {
      setMessages([...messages, `You: ${input}`]);
      setInput('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Mobile Chat</Text>
      <Picker
        selectedValue={status}
        style={styles.picker}
        onValueChange={(itemValue) => setStatus(itemValue)}
      >
        <Picker.Item label="Available" value="available" />
        <Picker.Item label="Not Available" value="not available" />
      </Picker>
      {status === 'available' ? (
        <>
          <Text style={styles.subHeader}>Tutor [tutor] is available to help!</Text>
          <ScrollView style={styles.chatBox}>
            {messages.map((message, index) => (
              <Text key={index} style={styles.message}>
                {message}
              </Text>
            ))}
          </ScrollView>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type here..."
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.notAvailableContainer}>
          <Text style={styles.notAvailableText}>No tutors are available to help right now.</Text>
          <Text style={styles.notAvailableText}>Please try again in a few minutes.</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop:StatusBar.currentHeight,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 18,
    marginBottom: 20,
  },
  chatBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#ffc107',
    padding: 10,
    borderRadius: 5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  picker: {
    height: 50,
    width: 200,
    marginBottom: 20,
  },
  notAvailableContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notAvailableText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default MobileChat;
