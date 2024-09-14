import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

const EditUserModal = ({ visible, user, onClose, onSave }) => {
  const [selectedPrivLvl, setSelectedPrivLvl] = useState(user?.privLvl?.toString() || 'NULL');

  useEffect(() => {
    if (user && user.privLvl !== undefined) {
      setSelectedPrivLvl(user.privLvl.toString());
    } else {
      setSelectedPrivLvl('NULL'); // Default to '0' if position is undefined
    }
  }, [user]);

  const handleSave = () => {
    const updatedUser = { ...user, privLvl: parseInt(selectedPrivLvl) };
    onSave(updatedUser);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>{user?.fName} {user?.lName}</Text>
        <RNPickerSelect
          onValueChange={(value: any) => setSelectedPrivLvl(value)}
          items={[
            { label: 'Monitor', value: '1' },
            { label: 'Tutor', value: '2' },
            { label: 'Tutor/Monitor', value: '3' },
          ]}
          value={selectedPrivLvl}
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
