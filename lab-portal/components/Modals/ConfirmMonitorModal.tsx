import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

const ConfirmMonitorModal = ({ visible, user, onClose, onSave }) => {
  const [selectedPrivLvl, setSelectedPrivLvl] = useState(user?.privLvl?.toString() || 'NULL');

  useEffect(() => {
    if (user && user.privLvl !== undefined) {
      setSelectedPrivLvl(user.privLvl.toString());
    } else {
      setSelectedPrivLvl('NULL'); // Default to '0' if position is undefined
    }
  }, [user]);

  const handleSave = () => {
    if (user) {
      const updatedUser = { ...user, privLvl: parseInt(selectedPrivLvl) };
      onSave(updatedUser);  // Call the onSave function passed as a prop
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Set Privacy Level</Text>
        <Text>{user?.fName} {user?.lName}</Text>
        
        <RNPickerSelect
          onValueChange={(value) => setSelectedPrivLvl(value)}
          items={[
            { label: 'Monitor', value: '1' },
            { label: 'Tutor', value: '2' },
            { label: 'Tutor/Monitor', value: '3' },
          ]}
          value={selectedPrivLvl}
          style={pickerSelectStyles}
        />

        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Cancel</Text>
        </TouchableOpacity>
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
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

export default ConfirmMonitorModal;
