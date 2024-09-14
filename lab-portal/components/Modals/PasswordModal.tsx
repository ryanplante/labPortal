import React, { useState } from 'react';
import { View, Text, Modal, TextInput, StyleSheet, Pressable } from 'react-native';
import departmentService from '../../services/departmentService';
import { getUserByToken } from '../../services/loginService';

interface PasswordModalProps {
  visible: boolean;
  onClose: (isValid: boolean) => void;
}

const PasswordModal = ({ visible, onClose }: PasswordModalProps) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyPassword = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const user = await getUserByToken(); // Fetch the current user
      const deptId = user.userDept; // Get user's department ID
  
      await departmentService.verifyPassword(deptId, password); // Verify password
      onClose(true); // Close the modal only when the password is valid
    } catch (error) {
      setError('Invalid password, please try again.'); // Keep the modal open and show error
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Manual Item Check-In</Text>

          <Text style={styles.description}>
            Please enter your department password to manually check in the item. This will bypass the scanning process.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            maxLength={4}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [styles.button, styles.submitButton, pressed && styles.buttonPressed]}
              onPress={verifyPassword}
              disabled={loading || password.trim() === ''}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Verifying...' : 'Submit'}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.button, styles.cancelButton, pressed && styles.buttonPressed]}
              onPress={() => onClose(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: 'rgb(255, 193, 7)',
  },
  cancelButton: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default PasswordModal;
