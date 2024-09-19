import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getUserByToken } from '../../services/loginService';
import StudentWorkerView from './Views/StudentWorkerView';
import BarcodeScannerModal from '../Modals/BarCodeScannerModal';
import { useCameraPermissions } from 'expo-camera';
import itemService from '../../services/itemService';
import userService from '../../services/userService';
import ConfirmationModal from '../Modals/ConfirmationModal';

const ScannerScreen = ({ reset }) => {
  const [scannedItem, setScannedItem] = useState(null);
  const [scannedStudent, setScannedStudent] = useState(null);
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [privLvl, setPrivLvl] = useState(null);
  const [scanType, setScanType] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [confirmationTitle, setConfirmationTitle] = useState('');
  const [confirmationDescription, setConfirmationDescription] = useState('');
  const [isScanningAgain, setIsScanningAgain] = useState(true);

  const fetchUserPrivilege = async () => {
    const user = await getUserByToken();
    setPrivLvl(user.privLvl);

    if (user.privLvl === 2) {
      setScanType('student');
    } else {
      setScanType('all');
    }
  };

  const handleScanResult = async (scannedData) => {
    const { type, itemId, userId } = scannedData;
  
    if (type === 'Item') {
      const item = await itemService.getItemById(itemId);
      setScannedItem({
        itemId: item.itemId,
        description: item.description,
        serialNum: item.serialNum,
      });
      setIsScanningAgain(true);
      setScanType('student');
      // Show the confirmation modal, but don't trigger any action yet
      setConfirmationTitle('Scan Student?');
      setConfirmationDescription('Do you want to scan a student for this item?');
      setIsConfirmationVisible(true); // Show the modal
    }
  
    if (type === 'Student' || userId) {
      const student = await userService.getUserById(userId);
      setScannedStudent({
        userId: student.userId,
        fName: student.fName,
        lName: student.lName,
      });
      setIsScanningAgain(false);
    }
  
    setIsScannerVisible(false); // Close the scanner after processing
  };  

  const handleConfirm = () => {
    setScanType('student'); // Change scan mode to student
    setIsScannerVisible(true); // Reopen the scanner for student scan
    setIsScanningAgain(true);
    setIsConfirmationVisible(false); // Close the modal
  };  

  const resetScannedStates = () => {
    setScannedItem(null);
    setScannedStudent(null);
    setIsScanningAgain(false);
    setIsScannerVisible(true);
    reset = false;
  };

  useEffect(() => {
    resetScannedStates();
    fetchUserPrivilege();
  }, []);

  useEffect(() => {
    if (permission?.granted) {
      setIsScannerVisible(true);
    } else if (permission?.status === 'undetermined') {
      requestPermission();
    }
  }, [permission]);

  if ((scannedItem || scannedStudent) && !isScanningAgain) {
    return (
      <StudentWorkerView
        scannedStudent={scannedStudent}
        scannedItem={scannedItem}
      />
    );
  }

  return (
    <View style={styles.container}>
      {!permission || !permission.granted ? (
        <View style={styles.permissionContainer}>
          <Text>We need camera permission to scan barcodes.</Text>
          <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      ) : (
        isScannerVisible && (
          <BarcodeScannerModal
            visible={isScannerVisible}
            onClose={() => setIsScannerVisible(false)}
            onBarCodeScanned={handleScanResult}
            scanType={scanType}
          />
        )
      )}

      {/* Confirmation modal */}
      <ConfirmationModal
        visible={isConfirmationVisible}
        title={confirmationTitle}
        description={confirmationDescription}
        onConfirm={handleConfirm}
        onCancel={() => {
          setIsConfirmationVisible(false);
          setIsScanningAgain(false);
        }}
        type="yesNo"
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
  permissionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ScannerScreen;
