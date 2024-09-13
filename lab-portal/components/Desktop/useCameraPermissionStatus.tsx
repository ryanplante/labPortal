import { useEffect, useState } from 'react';
import { useCameraPermissions, PermissionResponse } from 'expo-camera';

export const useCameraPermissionStatus = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isGranted, setIsGranted] = useState<boolean | null>(null); // Track if granted or null for initial state

  const requestCameraPermission = async () => {
    const result: PermissionResponse = await requestPermission();
    setIsGranted(result.granted); // Ensure that we correctly set the new permission state
  };

  // Use effect to refresh permission status
  useEffect(() => {
    if (permission) {
      setIsGranted(permission.granted); // Update the state with the current permission
    }
  }, [permission]);

  return {
    isGranted,
    isLoading: isGranted === null, // Adjust loading based on permission status
    requestCameraPermission,
  };
};
