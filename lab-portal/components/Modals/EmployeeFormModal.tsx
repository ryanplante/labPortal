import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Image } from 'react-native';
import FuzzySearchModal from './FuzzySearchModal';
import { Picker } from '@react-native-picker/picker';

const EmployeeFormModal = ({
  isEmployeeFormVisible,
  isEditing,
  setEmployeeFormVisible,
  setEditingUser,
  setIsEditing,
  editingUser,
  handleCreateOrUpdateUser,
  formError,
}) => {
  const [userId, setUserId] = useState(editingUser?.userId?.toString() || '');
  const [fName, setFName] = useState(editingUser?.fName || '');
  const [lName, setLName] = useState(editingUser?.lName || '');
  const [role, setRole] = useState(editingUser?.privLvl?.toString() || '1');
  const [isSearchModalVisible, setSearchModalVisible] = useState(false);

  // Ensure the form gets updated with editing user's values when editing
  useEffect(() => {
    if (editingUser) {
      setUserId(editingUser.userId?.toString() || ''); // Ensure userId is a string
      setFName(editingUser.fName || '');
      setLName(editingUser.lName || '');
      setRole(editingUser.privLvl?.toString() || '1');
    }
  }, [editingUser]);

  const handleSelectUser = (user) => {
    setEditingUser(user);
    setUserId(user.userId?.toString() || ''); // Ensure it's a string
    setFName(user.fName || '');
    setLName(user.lName || '');
    setRole(user.privLvl?.toString() || '1');
    setSearchModalVisible(false);
  };

  const handleFormSubmit = async () => {
    try {
      const userData = {
        userId: parseInt(userId, 10), // Ensure userId is passed as an integer
        fName: fName,
        lName: lName,
        privLvl: parseInt(role, 10), // Role is selected as a string, convert to number
      };

      if (isEditing) {
        // If editing, update the existing user
        await handleCreateOrUpdateUser(userData, true); // true for editing
      } else {
        // If not editing, create a new user
        await handleCreateOrUpdateUser(userData, false); // false for creating
      }

      // Reset form and close the modal
      setEmployeeFormVisible(false);
      setEditingUser(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const employeeFormComponents = isSearchModalVisible && !editingUser ? (
    <FuzzySearchModal
      key="userSearcher"
      visible={isSearchModalVisible}
      onSelectUser={handleSelectUser}
      onClose={() => setSearchModalVisible(false)}
    />
  ) : (
    [
      <View key="userDetailsGroup">
        <Text style={styles.label}>User</Text>
        <View style={styles.inputContainer}>
          <TextInput
            key="user"
            placeholder="Select a user"
            value={editingUser ? `(${userId?.padStart(8, '0')}) ${fName} ${lName}` : ''}
            editable={false}
            style={styles.readOnlyInput}
          />
          {!isEditing && (
            <TouchableOpacity onPress={() => setSearchModalVisible(true)} style={styles.iconButton}>
              <Image source={require('../../assets/search-button.png')} style={styles.searchIcon} />
            </TouchableOpacity>
          )}
        </View>
      </View>,

      <View key="roleGroup" style={styles.inputGroup}>
        <Text style={styles.label}>Role</Text>
        <Picker
          key="role"
          selectedValue={role}
          onValueChange={(itemValue) => setRole(itemValue)}
          style={styles.picker}
        >
          <Picker.Item key="monitor" label="Monitor" value="1" />
          <Picker.Item key="tutor" label="Tutor" value="2" />
          <Picker.Item key="monitorTutor" label="Monitor/Tutor" value="3" />
        </Picker>
      </View>,

      <Button
        key="submit"
        title={isEditing ? 'Edit Employee' : 'Add Employee'}
        onPress={handleFormSubmit}
        color="#FFC107"
      />,
    ]
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isEmployeeFormVisible}
      onRequestClose={() => {
        setEmployeeFormVisible(false);
        setEditingUser(null);
        setIsEditing(false);
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{isEditing ? 'Edit Employee' : 'Add Employee'}</Text>

          {employeeFormComponents}

          <Button
            key="close"
            title="Close"
            onPress={() => {
              setEmployeeFormVisible(false);
              setEditingUser(null);
              setIsEditing(false);
            }}
            color="#FF0000"
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  readOnlyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 10,
  },
  searchIcon: {
    width: 30,
    height: 30,
  },
  picker: {
    marginBottom: 20,
    height: 40,
  },
});

export default EmployeeFormModal;
