import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const scheduleData = [
  {
    student: 'Student1 Lastname',
    location: 'Game Lab',
    schedule: {
      Monday: [
        { type: 'school', name: 'HTML', room: 'N123', time: '9:00am-11:30am' },
        { type: 'work', name: 'Tutoring', room: 'N212', time: '12:00pm-5:00pm' },
      ],
      Tuesday: [
        { type: 'work', name: 'Tutoring', room: 'N212', time: '12:00pm-4:30pm' },
      ],
      Wednesday: [
        { type: 'work', name: 'Tutoring', room: 'N212', time: '12:00pm-4:30pm' },
      ],
      Thursday: [{ type: 'off', time: 'off' }],
      Friday: [
        { type: 'work', name: 'Tutoring', room: 'N212', time: '1:00pm-3:00pm' },
      ],
    },
  },
  {
    student: 'Student2 Lastname',
    location: 'Game Lab',
    schedule: {
      Monday: [{ type: 'off', time: 'off' }],
      Tuesday: [
        { type: 'school', name: 'CSS', room: 'N123', time: '9:00am-12:00pm' },
        { type: 'work', name: 'Monitor', room: 'N123', time: '12:00pm-5:00pm' },
      ],
      Wednesday: [
        { type: 'school', name: 'CSS', room: 'N123', time: '9:00am-12:00pm' },
      ],
      Thursday: [
        { type: 'work', name: 'Monitor', room: 'N212', time: '4:30pm-8:00pm' },
      ],
      Friday: [{ type: 'school', name: 'HTML', room: 'ONL', time: '9:00am-5:00pm' }],
    },
  },
];

const LabSchedules = () => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Calendar</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.tableHeader]}>Game Lab</Text>
          {daysOfWeek.map((day) => (
            <Text key={day} style={[styles.tableCell, styles.tableHeader]}>
              {day}
            </Text>
          ))}
        </View>
        {scheduleData.map((data) => (
          <View key={data.student}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableSubHeader]}>{data.student}</Text>
              {daysOfWeek.map((day) => (
                <View key={day} style={styles.tableCell}>
                  {data.schedule[day] ? (
                    data.schedule[day].map((item, index) => (
                      <View
                        key={index}
                        style={[
                          styles.scheduleItem,
                          item.type === 'school'
                            ? styles.school
                            : item.type === 'work'
                            ? styles.work
                            : styles.off,
                        ]}
                      >
                        <Text>{`${item.name}(${item.room})`}</Text>
                        <Text>{item.time}</Text>
                      </View>
                    ))
                  ) : (
                    <Text></Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendItem}>
          <View style={[styles.legendColor, styles.school]}></View> School
        </Text>
        <Text style={styles.legendItem}>
          <View style={[styles.legendColor, styles.work]}></View> Work
        </Text>
        <Text style={styles.legendItem}>
          <View style={[styles.legendColor, styles.off]}></View> Off
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  table: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  tableHeader: {
    fontWeight: 'bold',
  },
  tableSubHeader: {
    fontWeight: 'bold',
    textAlign: 'left',
  },
  scheduleItem: {
    margin: 5,
    padding: 5,
    borderRadius: 5,
  },
  school: {
    backgroundColor: '#ffcccc',
  },
  work: {
    backgroundColor: '#ccccff',
  },
  off: {
    backgroundColor: '#cccccc',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
});

export default LabSchedules;
