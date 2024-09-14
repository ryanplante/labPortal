import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Button, StyleSheet, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import UserSearcher from '../Modals/UserSearcher';

const EmployeeFormModal = ({
  visible,
  onClose,
  onSave,
  user,
  isEditing,
}) => {
  const [editingUser, setEditingUser] = useState(user);
  const [role, setRole] = useState(user?.privLvl?.toString() || '1');
  const [isUserSearcherOpen, setUserSearcherOpen] = useState(!isEditing && !user);

  const handleSave = () => {
    onSave({
      ...editingUser,
      privLvl: parseInt(role, 10),
    });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {isUserSearcherOpen && !editingUser ? (
          <UserSearcher
            onSelect={(selectedUser) => {
              setEditingUser(selectedUser);
              setRole(selectedUser.privLvl.toString());
              setUserSearcherOpen(false);
            }}
            onBackPress={() => setUserSearcherOpen(false)}
            isTeacher={false}
          />
        ) : (
          <>
            <View key="userDetailsGroup">
              <Text style={styles.label}>User</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  key="user"
                  placeholder="Select a user"
                  value={editingUser ? `${editingUser.fName} ${editingUser.lName}` : ''}
                  editable={false}
                  style={styles.readOnlyInput}
                />
                {!isEditing && (
                  <TouchableOpacity onPress={() => setUserSearcherOpen(true)} style={styles.iconButton}>
                    <Image source={require('../../assets/search-button.png')} style={styles.searchIcon} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View key="roleGroup">
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
            </View>

            <Button
              key="submit"
              title={isEditing ? 'Update Employee' : 'Add Employee'}
              onPress={handleSave}
              color="#FFC107"
            />
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  readOnlyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    height: 45,
    backgroundColor: '#aaaaaa',
  },
  iconButton: {
    marginLeft: 10,
  },
  searchIcon: {
    width: 45,
    height: 45,
  },
  picker: {
    marginBottom: 20,
    height: 40,
  },
});

export default EmployeeFormModal;
