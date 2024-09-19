import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import LabCard from '../LabCard'; // Adjust the path as necessary
import ScheduleService from '../../../services/scheduleService'; // Adjust path to your service
import { SafeAreaView } from 'react-native-safe-area-context';

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
    <SafeAreaView>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Dashboard</Text>
        <View style={styles.grid}>
          {labSchedules.map((lab, index) => (
            <View key={index} style={styles.cardWrapper}>
              <LabCard
                labName={lab.labName}
                roomNumber={lab.roomNumber}
                schedule={lab.schedule}
                imageSrc={lab.imageSrc}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // Ensures the content grows to fill the screen
    alignItems: 'center', // Centers content horizontally
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', // Centers the cards horizontally
  },
  cardWrapper: {
    width: '100%', // Takes full width for mobile
    maxWidth: 380, // Limits card width for larger screens
    marginBottom: 20, // Spacing between cards
    alignItems: 'center', // Centers each card within its wrapper
  },
});

export default StudentView;
