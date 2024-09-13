import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BarcodeScannerModal from '../Modals/BarCodeScannerModal';

const ScannerScreen = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [scanType, setScanType] = useState(null);
  const navigation = useNavigation();

  const handleBarCodeScanned = (scannedData, detectedType) => {
    // Navigate to the appropriate screen based on the detectedType
    if (detectedType === 'Item') {
      alert(`Scanned item id: ${scannedData}`);
      //navigation.navigate('ItemScreen', { scannedData });
    } else if (detectedType === 'Student') {
      alert(`Scanned student id: ${scannedData}`);
    } else {
      alert(`Unknown barcode type detected. Data: ${scannedData}`);
    }
    setModalVisible(false); // Close the scanner modal
  };

  const openScanner = (type) => {
    setScanType(type); // 'item' for Code128, 'student' for Code39, or null for both
    setModalVisible(true); // Show the modal
  };

  const closeScanner = () => {
    setModalVisible(false); // Close the modal when needed
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Barcode Scanner</Text>

      <TouchableOpacity onPress={() => openScanner(null)} style={styles.scanButton}>
        <Text style={styles.scanButtonText}>Scan Both Types</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => openScanner('item')} style={styles.scanButton}>
        <Text style={styles.scanButtonText}>Scan Item (Code128)</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => openScanner('student')} style={styles.scanButton}>
        <Text style={styles.scanButtonText}>Scan Student (Code39)</Text>
      </TouchableOpacity>

      {/* Scanner Modal */}
      <BarcodeScannerModal
        visible={isModalVisible}
        onClose={closeScanner}
        scanType={scanType}
        onBarCodeScanned={handleBarCodeScanned}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  scanButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ScannerScreen;
