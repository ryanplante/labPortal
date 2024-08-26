import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const MobileReports = () => {
  const [filter, setFilter] = useState('week');
  const [date, setDate] = useState(new Date());
  const [fileType, setFileType] = useState('PDF');

  const dummyData = {
    week: [20, 15, 25, 10, 30, 5, 40],
    day: [3, 4, 5, 2, 3, 1, 0, 5, 2, 1, 4, 3, 2, 1, 0, 2, 3, 4, 1, 3, 4, 5, 6, 2],
    month: [50, 60, 70, 80, 90],
    year: [200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750]
  };

  const getData = () => {
    switch (filter) {
      case 'week':
        return dummyData.week;
      case 'day':
        return dummyData.day;
      case 'month':
        return dummyData.month;
      case 'year':
        return dummyData.year;
      default:
        return dummyData.week;
    }
  };

  const chartData = {
    labels: filter === 'day' ? [...Array(24).keys()].map(i => `${i}:00`) :
            filter === 'week' ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] :
            filter === 'month' ? ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'] :
            ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        data: getData()
      }
    ]
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Mobile Reports</Text>
      <View style={styles.filterContainer}>
        <Picker
          selectedValue={filter}
          style={styles.picker}
          onValueChange={(itemValue) => setFilter(itemValue)}
        >
          <Picker.Item label="Week" value="week" />
          <Picker.Item label="Day" value="day" />
          <Picker.Item label="Month" value="month" />
          <Picker.Item label="Year" value="year" />
        </Picker>
        <TouchableOpacity style={styles.datePicker}>
          <Text>{date.toDateString()}</Text>
        </TouchableOpacity>
        <Picker
          selectedValue={fileType}
          style={styles.picker}
          onValueChange={(itemValue) => setFileType(itemValue)}
        >
          <Picker.Item label="PDF" value="PDF" />
          <Picker.Item label="XLSX" value="XLSX" />
          <Picker.Item label="CSV" value="CSV" />
        </Picker>
        <TouchableOpacity style={styles.downloadButton}>
          <Text style={styles.downloadButtonText}>Download</Text>
        </TouchableOpacity>
      </View>
      <BarChart
        style={styles.chart}
        data={chartData}
        width={screenWidth - 40}
        height={220}
        yAxisLabel=""
        chartConfig={{
          backgroundColor: '#1cc910',
          backgroundGradientFrom: '#eff3ff',
          backgroundGradientTo: '#efefef',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#ffa726'
          }
        }}
        verticalLabelRotation={30}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop:StatusBar.currentHeight
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: 150,
    marginRight: 20,
  },
  datePicker: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginRight: 20,
  },
  downloadButton: {
    backgroundColor: '#ffc107',
    padding: 10,
    borderRadius: 5,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default MobileReports;
