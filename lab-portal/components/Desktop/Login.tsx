import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { fetchLastUpdated, reload, validateCredentials } from '../../services/loginService';
import { CreateAuditLog } from '../../services/auditService';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // State for the error message
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
  
      const lastUpdated = await fetchLastUpdated(username);
      await CreateAuditLog('Starting login process', Number(username), 'login');

      const token = await validateCredentials(username, password, lastUpdated);
      
      await AsyncStorage.setItem('token', token);
      
      // Force a reload of the app... can't seem to get navigator to work since it's not in the stack but this is a workaround ¯\_(ツ)_/¯
      await reload()
      console.log('Navigating to Main');
    } catch (error) {
      setErrorMessage('Invalid username or password'); // Show the error message
      await CreateAuditLog('Login attempt failed!', Number(username), 'login');
      console.error('Login error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/neit-logo.png')} style={styles.logo} />
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
      <TouchableOpacity>
        <Text style={styles.forgotPassword}>Forgot password?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  logo: {
    width: '30%',
    resizeMode: 'contain',
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
  forgotPassword: {
    color: '#007bff',
    marginTop: 20,
  },
});

export default Login;
