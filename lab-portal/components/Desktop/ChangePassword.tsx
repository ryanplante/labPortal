import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { updatePassword, fetchLastUpdated, getUserByToken, reload, deleteToken, validateCredentials } from '../../services/loginService';
import { crossPlatformAlert } from '../../services/helpers';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [user, setUser] = useState(null); // Store the user object
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getUserByToken();
        setUser(user); // Store the user in state
      } catch (error) {
        await reload(); // Reload the app if getting the user fails
      }
    };

    fetchUserData();
  }, []);

  const handleChangePassword = async () => {
    if (!user) {
      setErrorMessage('Failed to load user data.');
      return;
    }

    // Validate old password
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

    // Apply password requirements
    const passwordRequirements = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRequirements.test(newPassword)) {
      setErrorMessage('Password must be at least 8 characters long, contain a capital letter, a number, and a special character.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    try {
      await updatePassword(user.userId, newPassword);
      crossPlatformAlert('Success', 'Password updated successfully. Please re-login to finish changing credentials.');
      await deleteToken();
      await reload();
    } catch (error) {
      crossPlatformAlert('Error', 'Failed to change password');
      setErrorMessage('Failed to change password.');
    }
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
