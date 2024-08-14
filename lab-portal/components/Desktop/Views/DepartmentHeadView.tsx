import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DepartmentHeadView = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Department Head View</Text>
      <Text style={styles.subHeader}>Department Overview</Text>
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

export default DepartmentHeadView;
