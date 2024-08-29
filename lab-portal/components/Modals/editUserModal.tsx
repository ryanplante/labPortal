import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet } from 'react-native';

const EditUserModal = ({ visible, user, onClose, onSave }) => {
  const [fName, setFName] = useState(user?.fName || '');
  const [lName, setLName] = useState(user?.lName || '');

  useEffect(() => {
    if (user) {
      setFName(user.fName);
      setLName(user.lName);
    }
  }, [user]);

  const handleSave = () => {
    const updatedUser = { ...user, fName, lName };
    onSave(updatedUser);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Edit User</Text>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={fName}
          onChangeText={setFName}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lName}
          onChangeText={setLName}
        />
        <Button title="Save" onPress={handleSave} />
        <Button title="Cancel" onPress={onClose} />
      </View>
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
});

export default EditUserModal;
