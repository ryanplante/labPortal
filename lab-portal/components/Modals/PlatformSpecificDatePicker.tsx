import React, { useState } from 'react';
import { Button, Platform, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createElement } from 'react';

interface PlatformSpecificDatePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

const PlatformSpecificDatePicker: React.FC<PlatformSpecificDatePickerProps> = ({ date, onDateChange }) => {
  const [isPickerVisible, setPickerVisible] = useState(false);

  if (Platform.OS === 'web') {
    return createElement('input', {
      type: 'date',
      value: date.toISOString().split("T")[0],
      onChange: (event) => {onDateChange(new Date(event.target.value)); console.log(event.target.value)},
      style: { height: 30, padding: 5, border: "2px solid #677788", borderRadius: 5, width: 250 }
    });
  } else {
    return (
      <View>
        {isPickerVisible && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setPickerVisible(false);
              if (selectedDate) {
                onDateChange(selectedDate);
              }
            }}
          />
        )}
        <Button title="Select Date" onPress={() => setPickerVisible(true)} />
      </View>
    );
  }
};

export default PlatformSpecificDatePicker;
