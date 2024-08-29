import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Switch, TouchableOpacity, StyleSheet } from 'react-native';

const ConfirmMonitorModal = ({ visible, user, onClose, onSave }) => {
  const [isMonitor, setIsMonitor] = useState(user?.position === 1);

  useEffect(() => {
    if (user) {
      setIsMonitor(user.position === 1);
    }
  }, [user]);
  
  const handleSave = () => {
    const updatedUser = { ...user, position: isMonitor ? 1 : 0 };
    onSave(updatedUser);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Set Monitor Status</Text>
        <Text>{user?.fName} {user?.lName}</Text>
        <View style={styles.switchContainer}>
          <Text>No</Text>
          <Switch
            value={isMonitor}
            onValueChange={setIsMonitor}
          />
          <Text>Yes</Text>
        </View>
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

export default ConfirmMonitorModal;
