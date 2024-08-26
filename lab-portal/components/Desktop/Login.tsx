import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { validateCredentials, checkHeartbeat } from '../../services/loginService';
import { CreateAuditLog } from '../../services/auditService';
import { reload } from '../../services/helpers';
import * as Device from 'expo-device'
import * as ScreenOrientation from 'expo-screen-orientation'

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); 
  const [loading, setLoading] = useState(false);  
  const navigation = useNavigation();

  const [orientation, setOrientation] = useState('LANDSCAPE');

  const determineAndSetOrientation = () => {
    let width = Dimensions.get('window').width;
    let height = Dimensions.get('window').height;

    if (width < height) {
        setOrientation('PORTRAIT');
      } else {
        setOrientation('LANDSCAPE');
      }
  }

  useEffect(() => {

    determineAndSetOrientation();
    const test = Dimensions.addEventListener('change', determineAndSetOrientation);

    return () => {
      test.remove()
    }
  }, []);

  //if a phone(1) or a tablet(2) in portrait, then the device is mobile
  const isMobile = ((Device.deviceType == 1) || (Device.deviceType == 2 && orientation == "PORTRAIT"))

  const adaptiveWidth = {
    width: isMobile ? "90%" : "30%"
  }

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
      console.log(error)
      const errorMessage = error.message.includes('server')
        ? 'Server is currently down. Please try again later.'
        : error.message.includes('Invalid')
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
    <View style={[styles.container]}>
      <Image source={require('../../assets/neit-logo.png')} style={[styles.logo, adaptiveWidth]} />
      <View style={[styles.formheader, adaptiveWidth]}><Text style={styles.headertext}>Username</Text></View>
      <TextInput
        style={[styles.input, adaptiveWidth]}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <View style={[styles.formheader, adaptiveWidth]}><Text style={styles.headertext}>Username</Text></View>
      <TextInput
        style={[styles.input, adaptiveWidth]}
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
        <Text style={[styles.errorText, adaptiveWidth]}>{errorMessage}</Text>
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
    width:"100%",
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  logo: {
    // width: '30%',
    resizeMode: 'contain',
  },
  input: {
    // width: '30%',
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
  formheader:{
    textAlign:"left",
    marginLeft:15
  },
  headertext:{
    fontSize:20
  }
});

export default Login;
