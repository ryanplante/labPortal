import React from 'react';
import { View, Text, StyleSheet } from 'react-native';


const Admin = () => {
  return (
    <View style={[styles.container]}>
      <Text style={styles.text}>Admin</Text>
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

export default Admin;
