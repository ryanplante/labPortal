import React from 'react';
import { browserName, isMobile } from 'react-device-detect';
import { View, Text, StyleSheet } from 'react-native';



const testvalue1 = 3
const testvalue2 = 2
console.log(testvalue1 > testvalue2 ? "red" : "blue")
const dynamicStyles = {
  backgroundColor: testvalue1 > testvalue2 ? "red" : "blue"
};


const AdminView = () => {
  return (
    <View style={[styles.container, dynamicStyles]}>
      <Text style={styles.header}>Admin View</Text>
      <Text style={styles.subHeader}>Admin Overview</Text>
      <Text>isMobile: {isMobile ? "true" : "false"}</Text>
      <Text>Browser: {browserName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default AdminView;
