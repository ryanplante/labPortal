import AsyncStorage from "@react-native-async-storage/async-storage";
import { reload } from "../../services/helpers";
import { View, StyleSheet, Image, TouchableOpacity, Text } from "react-native";
import React from "react";

export const MobileProfile = () =>{
    const handleLogout = async () => {
        await AsyncStorage.removeItem("token");
        // Force a reload of the app
        await reload();
      };

      return (
        <View style={styles.container}>
          <View style={styles.profileContainer}>
            <Image source={require('../../assets/user-icon.png')} style={styles.profileImage} />
            <Text style={styles.profileName}>[Name]</Text>
          </View>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Text style={styles.menuText}>Logout ⇦</Text>
          </TouchableOpacity>
        </View>
      );
    };
    
    const styles = StyleSheet.create({
      container: {
        position: 'absolute',
        left: 80, // Positioned next to the sidebar
        top: 0,
        bottom: 0,
        width: 300,
        backgroundColor: '#e0e0e0',
        paddingVertical: 20,
        paddingHorizontal: 10,
        zIndex: 1,
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
    
