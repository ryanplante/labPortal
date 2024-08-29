import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import userService from '../../services/userService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PanGestureHandler } from 'react-native-gesture-handler';

const FuzzySearchModal = ({ visible, onClose, onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const handleSearch = async () => {
        if (!searchTerm.trim() || isNaN(Number(searchTerm))) {
            setSearchResults([]); // Clear results if searchTerm is empty or not a number
            return;
        }

        try {
            const results = await userService.fuzzySearchById(Number(searchTerm));
            setSearchResults(results.$values);
        } catch (error) {
            console.error('Error during fuzzy search:', error);
        }
    };

    handleSearch();
}, [searchTerm]);

const handleGesture = ({ nativeEvent }) => {
  if (nativeEvent.translationY > 50) {  // Adjust the threshold as needed
    onClose();
  }
};


return (
  <Modal 
    visible={visible}
    animationType="slide"
    presentationStyle="pageSheet"
    onRequestClose={onClose}
  >
    <PanGestureHandler onGestureEvent={handleGesture}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Search User by ID</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter ID"
          value={searchTerm}
          onChangeText={setSearchTerm}
          keyboardType="numeric"
        />
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.userId.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => onSelectUser(item)} style={styles.resultItem}>
              <Text>{item.userId}: {item.fName} {item.lName}</Text>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </PanGestureHandler>
    
  </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#000',
    fontSize: 16,
  },
});

export default FuzzySearchModal;
