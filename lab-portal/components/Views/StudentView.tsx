import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import LabCard from '../LabCard';

const labSchedules = [
  {
    labName: 'Auto Lab',
    roomNumber: 'S112',
    schedule: [
      { day: 'Monday', hours: '9am-5pm' },
      { day: 'Tuesday', hours: '9am-5pm' },
      { day: 'Wednesday', hours: '12pm-5pm' },
      { day: 'Thursday', hours: '12pm-5pm' },
      { day: 'Friday', hours: '9am-5pm' },
    ],
    imageSrc: require('../../assets/lab-icon.png'),
  },
  {
    labName: 'Game Lab',
    roomNumber: 'N212',
    schedule: [
      { day: 'Monday', hours: '9am-5pm' },
      { day: 'Tuesday', hours: '9am-5pm' },
      { day: 'Wednesday', hours: '12pm-5pm' },
      { day: 'Thursday', hours: '12pm-5pm' },
      { day: 'Friday', hours: '9am-5pm' },
    ],
    imageSrc: require('../../assets/lab-icon.png'),
  },
  {
    labName: 'Nursing Lab',
    roomNumber: 'N208',
    schedule: [
      { day: 'Monday', hours: '9am-5pm' },
      { day: 'Tuesday', hours: '9am-5pm' },
      { day: 'Wednesday', hours: '12pm-5pm' },
      { day: 'Thursday', hours: '12pm-5pm' },
      { day: 'Friday', hours: '9am-5pm' },
    ],
    imageSrc: require('../../assets/lab-icon.png'),
  },
  {
    labName: 'AV Lab',
    roomNumber: 'N312',
    schedule: [
      { day: 'Monday', hours: '9am-5pm' },
      { day: 'Tuesday', hours: '9am-5pm' },
      { day: 'Wednesday', hours: '12pm-5pm' },
      { day: 'Thursday', hours: '12pm-5pm' },
      { day: 'Friday', hours: '9am-5pm' },
    ],
    imageSrc: require('../../assets/lab-icon.png'),
  },
];

const StudentView = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Dashboard</Text>
      <View style={styles.grid}>
        {labSchedules.map((lab, index) => (
          <LabCard
            key={index}
            labName={lab.labName}
            roomNumber={lab.roomNumber}
            schedule={lab.schedule}
            imageSrc={lab.imageSrc}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
      padding: 20,
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
  });

export default StudentView;
