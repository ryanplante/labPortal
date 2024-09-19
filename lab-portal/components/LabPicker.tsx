import React, { useEffect, useState } from 'react';
import { Picker, View, Text, StyleSheet } from 'react-native';

import LabService from '../services/labsService'; // Service to fetch lab data
import { getUserByToken } from '../services/loginService'; // To get logged-in user's department

interface Lab {
  labId: number;
  name: string;
  roomNum: string;
  deptId: number;
}

interface LabPickerProps {
  selectedLabId: number | null; // Current selected lab ID
  onLabChange: (labId: number | null) => void; // Callback to parent component when a lab is selected
  readOnly?: boolean; 
}

const LabPicker = ({ selectedLabId, onLabChange, readOnly = false }: LabPickerProps) => {
  const [labs, setLabs] = useState<Lab[]>([]); // Holds the labs data
  const [loading, setLoading] = useState(true); // Loading state for fetching labs

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        setLoading(true);
        const loggedInUser = await getUserByToken(); // Get logged-in user
        const departmentId = loggedInUser.userDept; // Get department ID

        // Fetch all labs and filter by department
        const response = await LabService.getAllLabs();
        const filteredLabs = response?.$values.filter(lab => 
          (loggedInUser.privLvl === 5 || lab.deptId === departmentId) && lab.labId !== 0
      );
      

        setLabs(filteredLabs);
      } catch (error) {
        console.error('Failed to fetch labs:', error);
        setLabs([]); // Set labs to empty array on error
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchLabs();
  }, []); // Fetch labs when the component mounts

  if (loading) {
    return <Text>Loading labs...</Text>; // Display loading state
  }


  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Lab:</Text>
      <Picker
        selectedValue={selectedLabId} // The currently selected lab
        style={styles.picker}
        onValueChange={(itemValue) => onLabChange(itemValue === null ? null : itemValue)}  // Callback when a lab is selected
        enabled={!readOnly}
      >
        <Picker.Item label="Choose Lab" value={null} /> {/* Placeholder */}
        {labs.map((lab) => (
          <Picker.Item key={lab.labId} label={`${lab.name} - ${lab.roomNum}`} value={lab.labId} />
        ))}
      </Picker>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: '100%',
  },
});

export default LabPicker
