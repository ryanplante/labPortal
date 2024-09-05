import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, ScrollView } from 'react-native';
import ScheduleService from '../../services/scheduleService';
import { getUserByToken } from '../../services/loginService';
import moment from 'moment';

const LabSchedules = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(moment().startOf('week').add(1, 'days')); // Default to current Monday
  const [weekNumber, setWeekNumber] = useState(moment().week()); // To track the current week number

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const user = await getUserByToken();
        const departmentId = user.userDept;

        const startDate = currentWeek.format('YYYY-MM-DD');
        const endDate = currentWeek.clone().add(4, 'days').format('YYYY-MM-DD');

        const data = await ScheduleService.getWorkScheduleByDepartment(departmentId, startDate, endDate);
        setScheduleData(data.$values);
      } catch (error) {
        console.error('Error fetching schedule data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [currentWeek]);

  const handleNextWeek = () => {
    setCurrentWeek(currentWeek.clone().add(1, 'week'));
    setWeekNumber(weekNumber + 1);
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(currentWeek.clone().subtract(1, 'week'));
    setWeekNumber(weekNumber - 1);
  };

  const groupByDay = (data, dayIndex) => {
    return data.filter(entry => entry.dayOfWeek === dayIndex);
  };

  const formatHours = (hours) => {
    if (hours === 'Off') return 'Off';

    const [start, end] = hours.split('-');
    const startTime = moment(start, 'HH:mm').format('h:mm A');
    const endTime = moment(end, 'HH:mm').format('h:mm A');
    return `${startTime} - ${endTime}`;
  };

  const getScheduleStyle = (type) => {
    switch (type) {
      case 'Work':
        return styles.work;
      case 'School':
        return styles.school;
      case 'Off':
        return styles.off;
      case 'Working in new room':
        return styles.workingInNewRoom;
      case 'Working outside of schedule':
        return styles.workingOutsideOfSchedule;
      case 'Late':
        return styles.late;
      case 'Calling out':
        return styles.callingOut;
      default:
        return styles.defaultType;
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>Loading schedules...</Text>
      </View>
    );
  }

  const weekDisplay = `Week ${weekNumber} - week of ${currentWeek.format('MMMM Do, YYYY')}`;

  return (
    <View style={styles.container}>
      <View style={styles.navigation}>
        <Button title="< Previous Week" onPress={handlePreviousWeek} />
        <Text style={styles.weekDisplay}>{weekDisplay}</Text>
        <Button title="Next Week >" onPress={handleNextWeek} />
      </View>

      <ScrollView horizontal={true}>
        <ScrollView>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableHeader]}>User</Text>
              {daysOfWeek.map((day) => (
                <Text key={day} style={[styles.tableCell, styles.tableHeader]}>
                  {day}
                </Text>
              ))}
            </View>

            {Object.entries(scheduleData.reduce((acc, entry) => {
              const userId = entry.userId;
              if (!acc[userId]) {
                acc[userId] = [];
              }
              acc[userId].push(entry);
              return acc;
            }, {})).map(([userId, userEntries]) => (
              <View key={userId} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.tableSubHeader]}>
                  {userEntries[0].user}
                </Text>
                {daysOfWeek.map((day, index) => (
                  <View key={day} style={styles.tableCell}>
                    {groupByDay(userEntries, index).map((item, idx) => (
                      <View
                        key={idx}
                        style={[styles.scheduleItem, getScheduleStyle(item.scheduleType)]}
                      >
                        {/* Check for room before displaying it */}
                        {item.lab && <Text>{`${item.lab} (${formatHours(item.hours)})`}</Text>}
                        <Text>{item.scheduleType}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>

      <View style={styles.legend}>
        <Text style={styles.legendItem}>
          <View style={[styles.legendColor, styles.work]}></View> Work
        </Text>
        <Text style={styles.legendItem}>
          <View style={[styles.legendColor, styles.school]}></View> School
        </Text>
        <Text style={styles.legendItem}>
          <View style={[styles.legendColor, styles.workingInNewRoom]}></View> Working in new room
        </Text>
        <Text style={styles.legendItem}>
          <View style={[styles.legendColor, styles.workingOutsideOfSchedule]}></View> Working outside of schedule
        </Text>
        <Text style={styles.legendItem}>
          <View style={[styles.legendColor, styles.late]}></View> Late
        </Text>
        <Text style={styles.legendItem}>
          <View style={[styles.legendColor, styles.callingOut]}></View> Calling out
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
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  weekDisplay: {
    fontSize: 18,
    fontWeight: 'bold',
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
  work: {
    backgroundColor: '#ccccff',
  },
  school: {
    backgroundColor: '#ccffcc',
  },
  off: {
    backgroundColor: '#cccccc',
  },
  workingInNewRoom: {
    backgroundColor: '#ffcc99',
  },
  workingOutsideOfSchedule: {
    backgroundColor: '#ffeb99',
  },
  late: {
    backgroundColor: '#ffccff',
  },
  callingOut: {
    backgroundColor: '#ff9999',
  },
  defaultType: {
    backgroundColor: '#e0e0e0',
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LabSchedules;
