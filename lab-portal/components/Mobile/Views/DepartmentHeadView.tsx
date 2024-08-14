import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MobileDepartmentHeadView = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mobile Department Head View</Text>
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

export default MobileDepartmentHeadView;
