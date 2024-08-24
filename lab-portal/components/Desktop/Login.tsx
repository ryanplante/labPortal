import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { validateCredentials, checkHeartbeat } from '../../services/loginService';
import { CreateAuditLog } from '../../services/auditService';
import { reload } from '../../services/helpers';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); 
  const [loading, setLoading] = useState(false);  
  const navigation = useNavigation();

  const handleLogin = async () => {
    setLoading(true);  
    try {
      const isApiHealthy = await checkHeartbeat();
      if (!isApiHealthy) {
        throw new Error('The server is currently unavailable.');
      }

      const success = await validateCredentials(username, password);
      if (success) {
        await reload();
      }
    } catch (error: any) {
      const errorMessage = error.message.includes('unavailable')
        ? 'Server is currently down. Please try again later.'
        : error.message === 'Invalid username or password'
        ? 'Invalid username or password'
        : 'An unexpected error occurred. Please try again later.';
      setErrorMessage(errorMessage);
    } finally {
      setLoading(false);  
    }
  };

  const handleHelpPress = () => {
    navigation.navigate('Help');
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
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
      <TouchableOpacity>
        <Text style={styles.link}>Forgot password?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleHelpPress}>
        <Text style={styles.link}>Need help? Click here!</Text>
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
  link: {
    color: '#007bff',
    marginTop: 20,
  },
});

export default Login;
