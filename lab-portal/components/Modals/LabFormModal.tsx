import React from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet } from 'react-native';

const LabFormModal = ({
  isLabFormVisible,
  isEditing,
  setLabFormVisible,
  setEditingLab,
  setIsEditing,
  editingLab,
  handleCreateOrUpdateLab,
  formError,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isLabFormVisible}
      onRequestClose={() => {
        setLabFormVisible(false);
        setEditingLab(null);
        setIsEditing(false);
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{isEditing ? 'Edit Lab' : 'Add Lab'}</Text>
          
          <View key="nameGroup" style={styles.inputGroup}>
            <Text style={styles.label}>Lab Name</Text>
            <TextInput
              key="name"
              placeholder="Lab Name"
              defaultValue={editingLab?.name || ''}
              onChangeText={(text) => setEditingLab((prev) => ({ ...prev, name: text }))}
              style={[styles.input, formError && formError.includes('Lab Name') ? styles.inputError : null]}
            />
          </View>

          <View key="roomNumGroup" style={styles.inputGroup}>
            <Text style={styles.label}>Room Number</Text>
            <TextInput
              key="roomNum"
              placeholder="Room Number"
              defaultValue={editingLab?.roomNum || ''}
              onChangeText={(text) => setEditingLab((prev) => ({ ...prev, roomNum: text }))}
              style={[styles.input, formError && formError.includes('Room Number') ? styles.inputError : null]}
            />
          </View>

          {formError && (
            <Text style={styles.errorText}>{formError}</Text>
          )}

          <Button
            key="submit"
            title={isEditing ? 'Update Lab' : 'Create Lab'}
            onPress={() => handleCreateOrUpdateLab({
              name: editingLab?.name || '',
              roomNum: editingLab?.roomNum || '',
            })}
            color="#FFC107"
          />

          <Button
            key="close"
            title="Close"
            onPress={() => {
              setLabFormVisible(false);
              setEditingLab(null);
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
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default LabFormModal;
