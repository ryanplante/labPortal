import React from 'react';
import { View, Text, StyleSheet } from 'react-native';


const MobileAdmin = () => {
  return (
    <View style={[styles.container]}>
      <Text style={styles.text}>Mobile Admin</Text>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width:"100%"
  },
  text: {
    fontSize: 20,
  }
});

export default MobileAdmin;
