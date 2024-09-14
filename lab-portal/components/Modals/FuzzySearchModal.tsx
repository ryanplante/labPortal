import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import userService from '../../services/userService';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

const FuzzySearchModal = ({ visible, onClose, onSelectUser }) => {
  const [searchId, setSearchId] = useState('');
  const [searchFirstName, setSearchFirstName] = useState('');
  const [searchLastName, setSearchLastName] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    try {
      if (searchId.trim() === '' && searchFirstName.trim() === '' && searchLastName.trim() === '') {
        Alert.alert('Error', 'Please enter an ID, first name, or last name to search.');
        return;
      }

      let results;
      // If searching by ID
      if (searchId.trim() !== '') {
        results = await userService.fuzzySearchById(Number(searchId));
      } else {
        // Otherwise search by name
        results = await userService.fuzzySearchByName(searchFirstName, searchLastName);
      }

      if (results?.$values) {
        setSearchResults(results.$values);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error during fuzzy search:', error);
      Alert.alert('Error', 'There was an error performing the search.');
    }
  };

  const handleSelect = (user) => {
    onSelectUser(user);
  };

  const handleGesture = ({ nativeEvent }) => {
    if (nativeEvent.translationY > 50) {
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
          <Text style={styles.modalTitle}>Search User by ID or Name</Text>

          <Text style={styles.label}>Search by ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter ID"
            value={searchId}
            onChangeText={setSearchId}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Search by First Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter First Name"
            value={searchFirstName}
            onChangeText={setSearchFirstName}
          />

          <Text style={styles.label}>Search by Last Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Last Name"
            value={searchLastName}
            onChangeText={setSearchLastName}
          />

          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>

          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.userId.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelect(item)} style={styles.resultItem}>
                <Text>ID: {item.userId.toString().padStart(8, '0')} - {item.fName} {item.lName}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text>No users found.</Text>}
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
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  searchButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  closeButton: {
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
