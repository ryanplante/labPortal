import React from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const MobileSidebar = ({ onProfilePress }: { onProfilePress: () => void }) => {
  const navigation = useNavigation();
  // Stupid hack to get the text centered >:(
  const labMonitors = "   Add/Edit\nLab Monitors" 
  return (
    <View style={styles.sidebar}>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Main')}>
        <Image source={require('../../assets/logo.png')} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Profile")}>
        <Image source={require('../../assets/user-icon.png')} style={styles.icon} />
        <Text style={styles.menuText}>Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Labs')}>
        <Image source={require('../../assets/labs-icon.png')} style={styles.icon} />
        <Text style={styles.menuText}>{labMonitors}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('LabSchedules')}>
        <Image source={require('../../assets/schedule-icon.png')} style={styles.icon} />
        <Text style={styles.menuText}>Lab Schedules</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Chat')}>
        <Image source={require('../../assets/chat-icon.png')} style={styles.icon} />
        <Text style={styles.menuText}>Chat</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ScanItem')}>
        <Image source={require('../../assets/scan-icon.png')} style={styles.icon} />
        <Text style={styles.menuText}>Scan Item</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('LogHistory')}>
        <Image source={require('../../assets/history-icon.png')} style={styles.icon} />
        <Text style={styles.menuText}>Log History</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Reports')}>
        <Image source={require('../../assets/reports-icon.png')} style={styles.icon} />
        <Text style={styles.menuText}>Reports</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Schedule')}>
        <Image source={require('../../assets/schedule-icon.png')} style={styles.icon} />
        <Text style={styles.menuText}>Schedule</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Admin')}>
        <Image source={require('../../assets/admin-icon.png')} style={styles.icon} />
        <Text style={styles.menuText}>Admin</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: "100%",
    backgroundColor: '#002147', // Initial color before gradient

    height: 100,
    backgroundImage: 'linear-gradient(to bottom, #002147, #000000)', // Blue to black gradient
    flexDirection: "row",
    alignItems: 'center'
  },
  logo: {
    width: 50,
    height: 50,
  },
  menuItem: {
    alignItems: 'center',
  },
  icon: {
    width: 30,
    height: 30,
  },
  menuText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default MobileSidebar;
