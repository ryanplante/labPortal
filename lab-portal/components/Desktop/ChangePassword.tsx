import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { updatePassword, getUserByToken, deleteToken, validateCredentials } from '../../services/loginService';
import { CreateErrorLog } from '../../services/errorLogService';
import ConfirmationModal from '../Modals/ConfirmationModal';
import { reload } from '../../services/helpers';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const navigation = useNavigation<NavigationProp<any>>();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getUserByToken();
        setUser(user);
      } catch (error) {
        if (error instanceof Error) {
          await CreateErrorLog(error, 'fetchUserData', null, 'error');
        }
        await reload();
      }
    };

    fetchUserData();
  }, []);

  const handleChangePassword = async () => {
    if (!user) {
      setErrorMessage('Failed to load user data.');
      return;
    }
  
    try {
      const token = await validateCredentials(user.userId, oldPassword);
      if (!token) {
        setErrorMessage('Old password is incorrect.');
        return;
      }
    } catch (error) {
      setErrorMessage('Old password is incorrect.');
      return;
    }
  
    // Ensure the new password and confirm password match
    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }
    if (oldPassword == newPassword) {
      setErrorMessage('New password cannot be old password!');
      return;
    }
    // regex to make sure it contains the password requirements
    const passwordRequirements = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRequirements.test(newPassword)) {
      setErrorMessage('Password must be at least 8 characters long, contain a capital letter, a number, and a special character.');
      return;
    }
  
    try {
      await updatePassword(user.userId, newPassword);
      setAlertMessage('Password updated successfully. Please re-login to finish changing credentials.');
      setIsAlertVisible(true);
    } catch (error) {
      if (error instanceof Error) {
        await CreateErrorLog(error, 'handleChangePassword', user.userId, 'error');
      }
      setErrorMessage('Failed to change password.');
    }
  };
  

  const handleAlertDismiss = async () => {
    await deleteToken();
    await reload();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Old Password"
        value={oldPassword}
        onChangeText={setOldPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Change</Text>
      </TouchableOpacity>

      <ConfirmationModal
        visible={isAlertVisible}
        onConfirm={handleAlertDismiss}
        onCancel={handleAlertDismiss}
        type="ok" 
        title={<Text style={{ fontSize: 18, fontWeight: 'bold' }}>Notice</Text>}
        description={<Text style={{ fontSize: 14 }}>{alertMessage}</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    marginBottom: 30,
    color: '#00274d',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  input: {
    width: '30%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#ffc107',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    width: '30%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    fontSize: 14,
  },
});

export default ChangePassword;
