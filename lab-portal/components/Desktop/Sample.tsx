import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ConfirmationModal from '../Modals/ConfirmationModal';

const SampleScreen = () => {
  // State to control the visibility of the modal
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'yesNo' | 'yesNoDanger' | 'okCancel' | 'ok'>('yesNo'); // State to control the type of modal

  // Function to handle the confirmation action
  const handleConfirm = () => {
    // Action to take when the user confirms the action
    console.log('User confirmed the action');
    setIsModalVisible(false); // Hide the modal after confirmation
  };

  // Function to handle the cancellation of the modal
  const handleCancel = () => {
    // Action to take when the user cancels the modal
    console.log('User canceled the action');
    setIsModalVisible(false); // Hide the modal after cancellation
  };

  // Function to show the modal when a button is pressed
  const showModal = (type: 'yesNo' | 'yesNoDanger' | 'okCancel' | 'ok') => {
    setModalType(type);
    setIsModalVisible(true); // Show the modal
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sample Screen</Text>

      {/* Button to trigger a "Yes/No" confirmation modal */}
      <TouchableOpacity style={styles.button} onPress={() => showModal('yesNo')}>
        <Text style={styles.buttonText}>Show Yes/No Modal</Text>
      </TouchableOpacity>

      {/* Button to trigger a "Yes/No Danger" confirmation modal */}
      <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={() => showModal('yesNoDanger')}>
        <Text style={styles.buttonText}>Show Yes/No Danger Modal</Text>
      </TouchableOpacity>

      {/* Button to trigger an "OK/Cancel" confirmation modal */}
      <TouchableOpacity style={styles.button} onPress={() => showModal('okCancel')}>
        <Text style={styles.buttonText}>Show OK/Cancel Modal</Text>
      </TouchableOpacity>

      {/* Button to trigger an "OK" modal */}
      <TouchableOpacity style={styles.button} onPress={() => showModal('ok')}>
        <Text style={styles.buttonText}>Show OK Modal</Text>
      </TouchableOpacity>

      {/* The Confirmation Modal */}
      <ConfirmationModal
        visible={isModalVisible} // Controls the visibility of the modal
        onConfirm={handleConfirm} // Function to call when the user confirms the action
        onCancel={handleCancel}   // Function to call when the user cancels the modal
        type={modalType}          // Type of modal to display (Yes/No, Yes/No Danger, OK/Cancel, OK)
        title={<Text style={{ fontSize: 18, fontWeight: 'bold' }}>Confirmation Required</Text>} // Customizable title for the modal
        description={<Text style={{ fontSize: 14 }}>Are you sure you want to proceed?</Text>}   // Customizable description for the modal
      />
    </View>
  );
};

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
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#ff4d4d', // Red background for the danger button
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SampleScreen;
