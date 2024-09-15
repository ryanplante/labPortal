import React, { useState } from 'react';
import { Button, Platform, View, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createElement } from 'react';
import moment from 'moment';

interface PlatformSpecificDateTimePickerProps {
  dateTime: Date;
  onDateTimeChange: (dateTime: Date) => void;
  readOnly?: boolean; 
}

const PlatformSpecificDateTimePicker = ({ dateTime, onDateTimeChange, readOnly=false }: PlatformSpecificDateTimePickerProps) => {
  const [isPickerVisible, setPickerVisible] = useState(false);

  const showPicker = () => !readOnly && setPickerVisible(true); // Only allow showing picker if not read-only
  const hidePicker = () => setPickerVisible(false);

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    hidePicker();
    if (selectedDate) {
      onDateTimeChange(selectedDate);
    }
  };

  const formattedDate = moment(dateTime).format('MM/DD/YYYY'); // Format for display
  console.log(readOnly);
  if (readOnly) {
    return <TextInput value={formattedDate} readOnly={readOnly} style={{ height: 30, padding: 5, borderColor: '#ccc', borderWidth: 1, borderRadius: 5 }} />;
  }

  if (Platform.OS === 'web') {
    const localDateTime = moment(dateTime).local().format('YYYY-MM-DD'); // Ensure local time format
    return createElement('input', {
      type: 'date',
      value: localDateTime,
      onChange: (event) => {
        const localDate = moment(event.target.value).toDate();
        onDateTimeChange(localDate);
      },
      disabled: readOnly, 
      style: { height: 30, padding: 5, border: "2px solid #677788", borderRadius: 5, width: 250 }
    });
  } else {
    return (
      <View>
        {isPickerVisible && (
          <DateTimePicker
            value={dateTime}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
        <Button title="Select Date & Time" onPress={showPicker} />
      </View>
    );
  }
};

export default PlatformSpecificDateTimePicker;
