import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, Modal, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from 'react-native-ui-datepicker';
import moment from 'moment';

interface PlatformSpecificDatePickerProps {
  dateTime: Date;
  onDateTimeChange: (dateTime: Date) => void;
  readOnly?: boolean;
}

const PlatformSpecificDatePicker = ({
  dateTime,
  onDateTimeChange,
  readOnly = false,
}: PlatformSpecificDatePickerProps) => {
  const [isModalVisible, setModalVisible] = useState(false);

  // No need for local `selectedDate`, rely on the `dateTime` prop.
  const formattedDate = moment(dateTime).format('MM/DD/YYYY'); // Format the parent-provided date
  const handleDateChange = (params: { date: Date }) => {
    onDateTimeChange(params.date); // Sync with parent state
    setModalVisible(false); // Close modal after selection
  };

  const openModal = () => {
    if (!readOnly) {
      setModalVisible(true); // Open modal when date picker is clicked
    }
  };

  const closeModal = () => {
    setModalVisible(false); // Close modal
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          value={formattedDate} // Display the formatted date from props
          editable={false} // Make text input read-only
          style={styles.dateInput}
        />
        <TouchableOpacity onPress={openModal} style={styles.iconContainer}>
          <Ionicons name="calendar" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pick a Date</Text>

            <DateTimePicker
              mode="single"
              date={dateTime} // Use the parent-provided date
              onChange={handleDateChange}
              format="MM/DD/YYYY"
              maxDate={new Date()}
              style={{ width: 250, padding: 10 }}
            />

            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderColor: '#ccc', borderWidth: 1, borderRadius: 5, paddingHorizontal: 5, width: 200 },
  dateInput: { flex: 1, height: 40, paddingLeft: 5, borderRadius: 5, color: '#333' },
  iconContainer: { paddingHorizontal: 5 },
  modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: 300, padding: 20, backgroundColor: '#fff', borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  closeButton: { marginTop: 20, padding: 10, backgroundColor: '#ff5a5f', borderRadius: 5 },
  closeButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default PlatformSpecificDatePicker;
