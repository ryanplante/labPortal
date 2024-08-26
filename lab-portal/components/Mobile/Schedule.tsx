import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

const MobileSchedule = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Mobile Schedule</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    marginTop:StatusBar.currentHeight,
  },
  text: {
    fontSize: 20,
  },
});

export default MobileSchedule;
