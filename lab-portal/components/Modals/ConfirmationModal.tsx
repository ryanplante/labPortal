import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Text } from 'react-native';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'yesNo' | 'yesNoDanger' | 'okCancel' | 'ok'; // Different types of buttons
}

const ConfirmationModal = ({
  visible,
  title,
  description,
  onConfirm,
  onCancel,
  type = 'yesNo', // Default to 'yesNo' if not provided
}: ConfirmationModalProps) => {

  const renderButtons = () => {
    switch (type) {
      case 'yesNo':
        return (
          <>
            <TouchableOpacity style={styles.confirmButtonSafe} onPress={onConfirm}>
              <Text style={styles.buttonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.buttonText}>No</Text>
            </TouchableOpacity>
          </>
        );
      case 'yesNoDanger':
        return (
          <>
            <TouchableOpacity style={styles.confirmButtonDanger} onPress={onConfirm}>
              <Text style={styles.buttonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.buttonText}>No</Text>
            </TouchableOpacity>
          </>
        );
      case 'okCancel':
        return (
          <>
            <TouchableOpacity style={styles.confirmButtonSafe} onPress={onConfirm}>
              <Text style={styles.buttonText}>Ok</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        );
      case 'ok':
        return (
          <TouchableOpacity style={styles.okButton} onPress={onConfirm}>
            <Text style={styles.okButtonText}>Ok</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
          </View>
          <View style={styles.textContainer}>
            {typeof description === 'string'
              ? description.split('\n').map((line, index) => (
                <Text key={index} style={styles.description}>{line}</Text>
              ))
              : <Text style={styles.description}>{description}</Text> // Fallback if description is not a string
            }
          </View>
          <View style={[styles.buttonContainer, type === 'ok' && { justifyContent: 'center' }]}>
            {renderButtons()}
          </View>
        </View>
      </View>
    </Modal >
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '50%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    fontFamily: 'Inter'
  },
  textContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },

  title: {
    fontSize: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  description: {
    fontSize: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButtonSafe: {
    backgroundColor: '#ffc700', // Yellow for safe actions
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  confirmButtonDanger: {
    backgroundColor: 'red', // Red for dangerous actions
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ffc700', // Yellow for cancel
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  okButton: {
    backgroundColor: '#ffc700', // Yellow for ok button
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  okButtonText: {
    color: 'black',
    fontSize: 16,
  },
});

export default ConfirmationModal;
