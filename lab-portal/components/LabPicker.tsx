import React, { useEffect, useState } from 'react';
import { Picker, View, Text, StyleSheet } from 'react-native';
import LabService from '../services/labsService';

interface Lab {
  labId: number;
  name: string;
  roomNum: string;
  deptId: number;
}

interface LabPickerProps {
  selectedLabId: number | null;
  onLabChange: (labId: number | null) => void; // Allow null for "Choose Lab"
}

const LabPicker = ({ selectedLabId, onLabChange }: LabPickerProps) => {
  const [labs, setLabs] = useState<Lab[]>([]);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const response = await LabService.getAllLabs();
        const fetchedLabs = response?.$values || []; // Access the labs via $values
        setLabs(fetchedLabs);
      } catch (error) {
        console.error('Failed to fetch labs:', error);
        setLabs([]); // Handle errors by setting labs to an empty array
      }
    };

    fetchLabs();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Lab:</Text>
      <Picker
        selectedValue={selectedLabId}
        style={styles.picker}
        onValueChange={(itemValue) => onLabChange(itemValue)}
      >
        <Picker.Item label="Choose Lab" value={null} />
        {labs.map((lab) => (
          <Picker.Item
            key={lab.labId}
            label={`${lab.name} - ${lab.roomNum}`}
            value={lab.labId}
          />
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

export default LabPicker;
