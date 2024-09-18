import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import Quagga from '@ericblade/quagga2'; // Only for web
import userService from '../../services/userService';
import ConfirmationModal from './ConfirmationModal';
import itemService from '../../services/itemService';

const BarcodeScannerModal = ({ visible, onClose, scanType, onBarCodeScanned }) => {
  const [scanned, setScanned] = useState(false);
  const scannerRef = useRef(null);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [confirmationTitle, setConfirmationTitle] = useState('');
  const [confirmationDescription, setConfirmationDescription] = useState('');
  const [confirmationType, setConfirmationType] = useState('ok'); // Can be 'yesNo', 'yesNoDanger', etc.

  // Quagga (web) initialization
  useEffect(() => {
    if (Platform.OS === 'web' && visible && typeof window !== 'undefined') {
      const setupQuagga = () => {
        let readers = [];
        // Adjust readers based on scanType
        if (scanType === 'student') {
          readers = ['code_39_reader'];
        } else if (scanType === 'item') {
          readers = ['code_128_reader'];
        } else if (scanType === 'all') {
          readers = ['code_128_reader', 'code_39_reader'];
        }
  
        Quagga.init(
          {
            inputStream: {
              type: 'LiveStream',
              target: scannerRef.current, // DOM element for the scanner
              constraints: {
                width: 640,
                height: 480,
                facingMode: 'environment',
              },
            },
            decoder: {
              readers, // Use the dynamic readers array
            },
          },
          (err) => {
            if (err) {
              console.error('Error initializing Quagga:', err);
              return;
            }
            Quagga.start();
          }
        );
  
        Quagga.onDetected(async (result) => {
          if (scanned) return; // Prevent overscanning
          //setScanned(true);     // Set scanned to true immediately
        
          const code = result.codeResult.code;
          const format = result.codeResult.format; // Extract format from the result
          // Determine type based on format
          let detectedType = format === 'code_39' ? 'Student' : 'Item';
          try {
            let validResult = null;

            // Handle 'Student' scanType
            if (detectedType === 'Student') {
              const user = await userService.getUserById(code);
        
              // Check if user is banned
              const isBanned = await userService.checkUserBan(user.userId);
              if (isBanned) {
                showConfirmationModal('User is banned');
                setScanned(true); // Reset scanning if validation fails
                //visible = false;
                return;
              }
        
              // If valid, pass the user data back
              validResult = { userId: user.userId, type: 'Student' };
            }
        
            // Handle 'Item' scanType
            else if (detectedType === 'Item') {
              const item = await itemService.getItemById(code);
        
              // Check if the item is out of stock
              if (item.quantity <= 0) {
                showConfirmationModal('Item is out of stock');
                setScanned(true); // Reset scanning if validation fails
                //visible = false;
                return;
              }
        
              // If valid, pass the item data back
              validResult = { itemId: item.itemId, type: 'Item' };
            }
        
            // If validation is successful, return the scanned data
            if (validResult) {
              onBarCodeScanned(validResult);
              Quagga.stop(); // Stop the scanner after successful scan
              onClose();     // Close the modal
            }
          } catch (error) {
            showConfirmationModal('Error occurred during scanning.');
            console.error('Error during Quagga scan validation:', error);
            setScanned(false); // Reset scanning if error occurs
          }
        });
        
      };
  
      setTimeout(() => {
        if (scannerRef.current) {
          setupQuagga();
        }
      }, 100);
  
      return () => {
        Quagga.stop();
      };
    }
  }, [visible, scanType]);
  
  

  const showConfirmationModal = (message, title = 'Warning', type = 'ok') => {
    setConfirmationTitle(title);
    setConfirmationDescription(message);
    setConfirmationType(type);
    setConfirmationVisible(true);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <SafeAreaView style={styles.webContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>

        {/* Web scanner area */}
        <View ref={scannerRef} style={styles.webScanner} />

        <ConfirmationModal
          visible={confirmationVisible}
          title={confirmationTitle}
          description={confirmationDescription}
          onConfirm={() => setConfirmationVisible(false)}
          type={confirmationType} // e.g., 'yesNo' or 'ok'
        />
      </SafeAreaView>
    </Modal>
  );
};

// Updated styles for web scanner and modals
const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  webScanner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#ff0000',
    padding: 10,
    borderRadius: 50,
    zIndex: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BarcodeScannerModal;