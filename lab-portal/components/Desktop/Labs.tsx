import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Labs = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>[Department] Lab Monitors</Text>
      <Text style={styles.subHeader}>Current Monitors</Text>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>Add new Monitor</Text>
      </TouchableOpacity>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.tableHeader]}>Student ID</Text>
          <Text style={[styles.tableCell, styles.tableHeader]}>Name</Text>
          <Text style={[styles.tableCell, styles.tableHeader]}></Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>1</Text>
          <Text style={styles.tableCell}>Monitor Test</Text>
          <View style={styles.tableCell}>
            <TouchableOpacity>
              <Text style={styles.tableCellIcon}>❌</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>8015394</Text>
          <Text style={styles.tableCell}>Spencer Roucoulet</Text>
          <View style={styles.tableCell}>
            <TouchableOpacity>
              <Text style={styles.tableCellIcon}>❌</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>8015459</Text>
          <Text style={styles.tableCell}>Farig Hasaov</Text>
          <View style={styles.tableCell}>
            <TouchableOpacity>
              <Text style={styles.tableCellIcon}>❌</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  table: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  tableHeader: {
    fontWeight: 'bold',
  },
  tableCellIcon: {
    fontSize: 20,
    color: 'black',
  },
});

export default Labs;
