import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import LabCard from '../LabCard'; // Adjust the path as necessary
import ScheduleService from '../../../services/scheduleService'; // Adjust path to your service

const StudentView = () => {
  const [labSchedules, setLabSchedules] = useState([]);

  useEffect(() => {
    fetchLabSchedules();
  }, []);

  const fetchLabSchedules = async () => {
    try {
      const response = await ScheduleService.getLabScheduleSummary(); // Fetch the data
      const transformedData = transformLabSchedules(response.$values); // Transform it
      setLabSchedules(transformedData); // Set the state
    } catch (error) {
      console.error('Error fetching lab schedules:', error);
    }
  };

  const transformLabSchedules = (data) => {
    return data.map((lab) => ({
      labName: lab.labName,
      roomNumber: lab.roomNum,
      schedule: createScheduleArray(lab.scheduleSummary),
      imageSrc: require('../../../assets/lab-icon.png'), // Replace with your image path
    }));
  };

  const createScheduleArray = (scheduleSummary) => {
    // Initialize with "Off" for all days
    const schedule = {
      Monday: 'Off',
      Tuesday: 'Off',
      Wednesday: 'Off',
      Thursday: 'Off',
      Friday: 'Off',
    };

    // Split schedule summary into individual entries
    const entries = scheduleSummary.split(';');

    // Parse each entry and populate the schedule object
    entries.forEach((entry) => {
      const [day, timeRange] = entry.trim().split(': ');
      if (schedule[day]) {
        const hours = timeRange.split('-').map((time) => convertTo12HourFormat(time));
        schedule[day] = `${hours[0]}-${hours[1]}`;
      }
    });

    // Convert the object into an array for the LabCard
    return Object.entries(schedule).map(([day, hours]) => ({ day, hours }));
  };

  const convertTo12HourFormat = (time) => {
    const [hour, minute] = time.split(':');
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

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
