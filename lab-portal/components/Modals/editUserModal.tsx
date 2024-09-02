import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

const EditUserModal = ({ visible, user, onClose, onSave }) => {
  const [selectedPosition, setSelectedPosition] = useState(user?.position?.toString() || 'NULL');

  useEffect(() => {
    if (user && user.position !== undefined) {
      setSelectedPosition(user.position.toString());
    } else {
      setSelectedPosition('NULL'); // Default to '0' if position is undefined
    }
  }, [user]);

  const handleSave = () => {
    const updatedUser = { ...user, position: parseInt(selectedPosition) };
    onSave(updatedUser);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>{user?.fName} {user?.lName}</Text>
        <RNPickerSelect
          onValueChange={(value: any) => setSelectedPosition(value)}
          items={[
            { label: 'Tutor', value: '0' },
            { label: 'Monitor', value: '1' },
            { label: 'Tutor/Monitor', value: '2' },
          ]}
          value={selectedPosition}
          style={pickerSelectStyles}
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

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is not behind the icon
    marginBottom: 20,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is not behind the icon
    marginBottom: 20,
  },
});

export default EditUserModal;
