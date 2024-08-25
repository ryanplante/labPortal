import React from 'react';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { View, Text, StyleSheet, Button } from 'react-native';

const MobileScanItem = () => {
  const [permission, requestPermission] = useCameraPermissions();

  if(!permission){
    return <Text>Loading</Text>
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View >
        <Text>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const barcodescanned = ({value}) =>{
    alert(`Scanned ${value}`)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Mobile Scan Item</Text>
      <Text>Coming soon!</Text>
      <CameraView barcodeScannerSettings={{
        barcodeTypes:["code128"]
      }} onBarcodeScanned={barcodescanned} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
  },
});

export default MobileScanItem;
