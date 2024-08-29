import AsyncStorage from "@react-native-async-storage/async-storage";
import { crossPlatformAlert, reload } from "../../services/helpers";
import { View, StyleSheet, Image, TouchableOpacity, Text, StatusBar, SafeAreaView } from "react-native";
import React, { useEffect, useState } from "react";
import { checkHeartbeat, deleteToken, getUserByToken } from "../../services/loginService";

export const MobileProfile = () =>{

    const [userName, setUserName] = useState('[Name]'); // Default value before loading user data

    const handleLogout = async () => {
        await AsyncStorage.removeItem("token");
        // Force a reload of the app
        await reload();
      };

      useEffect(() => {
        const fetchUserData = async () => {
    
          const token = await AsyncStorage.getItem('token');
          if (token) {
            try {
              const isApiHealthy = await checkHeartbeat();
              if (!isApiHealthy) {
                throw new Error('The server is currently unavailable.');
              }
              const user = await getUserByToken();
              setUserName(`${user.fName} ${user.lName}`);
            } catch (error) {
              const errorMessage = error.message.includes('server')
                  ? 'Server is currently down. Please try again later.'
                  : 'Token has expired. Please refresh the app and re-login to continue.';
                crossPlatformAlert('Error', errorMessage);
              await deleteToken()
              await reload();
            }
          }
        };
    
        fetchUserData();
      }, []);

      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.profileContainer}>
            <Image source={require('../../assets/user-icon.png')} style={styles.profileImage} />
            <Text style={styles.profileName}>{userName}</Text>
          </View>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Text style={styles.menuText}>Logout ⇦</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    };
    
    const styles = StyleSheet.create({
      container: {
        // position: 'absolute',
        // left: 80, // Positioned next to the sidebar
        // top: 0,
        // bottom: 0,
        // width: 300,
        backgroundColor: '#e0e0e0',
        paddingVertical: 20,
        paddingHorizontal: 10,
        zIndex: 1,
        marginTop:StatusBar.currentHeight,
      },
      profileContainer: {
        alignItems: 'center',
        marginBottom: 20,
      },
      profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
      },
      profileName: {
        fontSize: 18,
        fontWeight: 'bold',
      },
      menuItem: {
        paddingVertical: 10,
      },
      menuText: {
        fontSize: 16,
      },
    });
    
    export default MobileProfile;
    
