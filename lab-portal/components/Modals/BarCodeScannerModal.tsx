import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Camera, useCameraPermissions } from 'expo-camera';
import Quagga from '@ericblade/quagga2';

const BarcodeScannerModal = ({ visible, onClose, scanType = null, onBarCodeScanned }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const scannerRef = useRef(null);

  // QuaggaJS setup for the web
  useEffect(() => {
    if (Platform.OS === 'web' && visible && typeof window !== 'undefined') {
      // Delay Quagga initialization until after the component mounts and window is confirmed available
      const setupQuagga = () => {
        Quagga.init(
          {
            inputStream: {
              type: 'LiveStream',
              target: scannerRef.current, // The DOM element to render the camera preview
              constraints: {
                width: 640,
                height: 480,
                facingMode: 'enviroment', // Rear camera
              },
            },
            decoder: {
              readers: scanType === 'item' ? ['code_128_reader'] : scanType === 'student' ? ['code_39_reader'] : ['code_128_reader', 'code_39_reader'],
            },
          },
          (err) => {
            if (err) {
              console.error('Error initializing Quagga:', err);
              return;
            }
            Quagga.start(); // Start Quagga
          }
        );

        Quagga.onDetected((result) => {
          const code = result.codeResult.code;
          const detectedType = result.codeResult.format === 'code_128' ? 'Item' :  result.codeResult.format === 'code_39' ? "Student" : 'Unkown';
          onBarCodeScanned(code, detectedType);
          setScanned(true);
          Quagga.stop(); // Stop Quagga once scanned
          onClose(); // Close modal after scanning
        });
      };

      // Delay the setup to ensure the DOM is ready
      setTimeout(() => {
        if (scannerRef.current) {
          setupQuagga();
        }
      }, 100);

      return () => {
        Quagga.stop(); // Clean up Quagga when modal is closed
      };
    }
  }, [visible, scanType]);

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;

    setScanned(true);

    let detectedType = '';
    if (type === Camera.Constants.BarCodeType.code128) {
      detectedType = 'Item';
    } else if (type === Camera.Constants.BarCodeType.code39) {
      detectedType = 'Student';
    } else {
      detectedType = 'Unknown';
    }

    onBarCodeScanned(data, detectedType);
  };

  const getBarCodeTypes = () => {
    if (scanType === 'item') {
      return [Camera.Constants.BarCodeType.code128];
    } else if (scanType === 'student') {
      return [Camera.Constants.BarCodeType.code39];
    } else {
      return [Camera.Constants.BarCodeType.code128, Camera.Constants.BarCodeType.code39];
    }
  };

  if (Platform.OS === 'web') {
    return (
      <Modal visible={visible} animationType="slide" transparent={true}>
        <SafeAreaView style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <View ref={scannerRef} style={styles.webScanner}>
            <Text style={styles.scannerText}>Point the camera at a barcode</Text>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  if (!permission) {
    return <Text>Requesting camera permission...</Text>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text>We need camera permission to scan barcodes.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <SafeAreaView style={styles.modalContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>

        <Camera
          style={styles.camera}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          barCodeScannerSettings={{
            barCodeTypes: getBarCodeTypes(),
          }}
        >
          <View style={styles.cameraOverlay}>
            <Text style={styles.scannerText}>Point the camera at a barcode</Text>
          </View>
        </Camera>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  camera: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
  cameraOverlay: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scannerText: {
    color: '#fff',
    fontSize: 18,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  webScanner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BarcodeScannerModal;
