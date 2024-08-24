import React, { useState } from 'react';
import { Button, Platform, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createElement } from 'react';

interface PlatformSpecificTimePickerProps {
  time: Date;
  onTimeChange: (time: Date) => void;
}

const PlatformSpecificTimePicker = ({ time, onTimeChange }: PlatformSpecificTimePickerProps) => {
  const [isPickerVisible, setPickerVisible] = useState(false);

  if (Platform.OS === 'web') {
    return createElement('input', {
      type: 'time',
      value: time.toTimeString().substr(0, 5), // Display time in "HH:MM" format
      onChange: (event) => onTimeChange(new Date(`${time.toDateString()} ${event.target.value}`)),
      style: { height: 30, padding: 5, border: "2px solid #677788", borderRadius: 5, width: 250 }
    });
  } else {
    return (
      <View>
        {isPickerVisible && (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onChange={(event, selectedDate) => {
              setPickerVisible(false);
              if (selectedDate) {
                onTimeChange(selectedDate);
              }
            }}
          />
        )}
        <Button title="Select Time" onPress={() => setPickerVisible(true)} />
      </View>
    );
  }
};

export default PlatformSpecificTimePicker;
