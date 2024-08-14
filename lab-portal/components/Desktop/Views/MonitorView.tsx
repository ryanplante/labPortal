import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const MonitorView = () => {
  const [selectedView, setSelectedView] = useState('Items');
  const [selectedFilter, setSelectedFilter] = useState('All');

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome, Ryan</Text>
      <Text style={styles.subHeader}>Logs for today</Text>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>Log new student</Text>
      </TouchableOpacity>
      <View style={styles.filtersContainer}>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>View:</Text>
          <Picker
            selectedValue={selectedView}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedView(itemValue)}
          >
            <Picker.Item label="Items" value="Items" />
            <Picker.Item label="Logs" value="Logs" />
          </Picker>
        </View>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Filter by:</Text>
          <Picker
            selectedValue={selectedFilter}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedFilter(itemValue)}
          >
            <Picker.Item label="All" value="All" />
            <Picker.Item label="Not yet clocked out" value="Not yet clocked out" />
          </Picker>
        </View>
      </View>
      {/* Table will go here */}
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
  addButton: {
    backgroundColor: '#ffc107',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  picker: {
    height: 50,
    width: 150,
  },
});

export default MonitorView;
