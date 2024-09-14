import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { StackedBarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import moment from 'moment-timezone';
import { getUserByToken } from '../../services/loginService';
import LogService from '../../services/logService';
import LabPicker from '../../components/LabPicker';

const screenWidth = Dimensions.get('window').width;

const Reports = () => {
  const [filter, setFilter] = useState('week');
  const [date, setDate] = useState(new Date());
  const [fileType, setFileType] = useState('PDF');
  const [logSummaries, setLogSummaries] = useState<any[]>([]);
  const [userDept, setUserDept] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLab, setSelectedLab] = useState<number | string>('Choose Lab');
  const [isItemFilter, setIsItemFilter] = useState<null | boolean>(null);

  // Fetch user info (including department ID) and logs on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userInfo = await getUserByToken();
        setUserDept(userInfo.userDept);

        // Fetch log summaries based on the selected filter, lab, userDept, and item filter
        const logs = await LogService.getLogSummary(
          filter,
          moment(date).format('YYYY-MM-DD'),
          null,
          isItemFilter,
          userInfo.userDept
        );

        // Always set the full log summaries first
        setLogSummaries(logs);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter, date, isItemFilter]);

  // Apply filtering based on selected lab
  console.log(selectedLab);
  const filteredLogSummaries = selectedLab != 'Choose Lab'
    ? logSummaries.filter(log => log.labID == selectedLab)
    : logSummaries;

  // Prepare the chart data for the StackedBarChart
  const prepareChartData = () => {
    if (!filteredLogSummaries.length) {
      return null;
    }

    // Extract unique terms (X-axis labels)
    const terms = Array.from(new Set(filteredLogSummaries.map(log => log.term)));

    // Extract unique lab names for the legend
    const labNames = Array.from(new Set(filteredLogSummaries.map(log => log.labName)));

    // Prepare data array for each term, ensuring that logs are grouped correctly by term and lab
    const data = terms.map(term => {
      return labNames.map(labName => {
        const matchingLogs = filteredLogSummaries.filter(log => log.term === term && log.labName === labName);
        return matchingLogs.length ? matchingLogs.reduce((acc, log) => acc + log.count, 0) : 0;
      });
    });

    return {
      labels: terms,  // X-axis terms (Weeks, Days, etc.)
      legend: labNames,  // Lab Names for the legend
      data,  // Data for stacked bars
      barColors: [
        '#FF0000', '#0000FF', '#00FF00', // Red, Blue, Green for first 3
        '#FF4500', '#1E90FF', '#32CD32', // OrangeRed, DodgerBlue, LimeGreen for more
        '#FFD700', '#8A2BE2', '#FF69B4'  // Gold, BlueViolet, HotPink for additional
      ],
    };
  };

  const chartData = prepareChartData();

  const handleDownload = () => {
    // Logic for downloading data as PDF, XLSX, CSV etc.
    console.log('Downloading as', fileType);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Reports</Text>

      {/* Filter and Download Row */}
      <View style={styles.filterRow}>
        {/* Lab Picker Component */}
        <LabPicker
          selectedLabId={selectedLab}
          onLabChange={setSelectedLab}  // Update selectedLab when a lab is picked
          readOnly={false}
        />
        {/* Filter by Time Period */}
        <Picker
          selectedValue={filter}
          style={styles.picker}
          onValueChange={setFilter}
        >
          <Picker.Item label="Week" value="w" />
          <Picker.Item label="Day" value="d" />
          <Picker.Item label="Month" value="m" />
          <Picker.Item label="Year" value="y" />
        </Picker>

        {/* Date Picker */}
        <TouchableOpacity style={styles.datePicker}>
          <Text>{date.toDateString()}</Text>
        </TouchableOpacity>

        {/* File Type Picker */}
        <Picker
          selectedValue={fileType}
          style={styles.picker}
          onValueChange={setFileType}
        >
          <Picker.Item label="PDF" value="PDF" />
          <Picker.Item label="XLSX" value="XLSX" />
          <Picker.Item label="CSV" value="CSV" />
        </Picker>

        {/* New Picker for Filtering by Item or Student */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter Logs By:</Text>
          <Picker
            selectedValue={isItemFilter}
            style={styles.picker}
            onValueChange={setIsItemFilter}
          >
            <Picker.Item label="All" value={null} />
            <Picker.Item label="Item" value={true} />
            <Picker.Item label="Student" value={false} />
          </Picker>
        </View>

        {/* Download Button */}
        <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
          <Text style={styles.downloadButtonText}>Download</Text>
        </TouchableOpacity>
      </View>

      {/* Check if there is no data */}
      {filteredLogSummaries.length === 0 ? (
        <Text style={styles.noDataText}>No check-ins found!</Text>
      ) : (
        chartData && (
          <View style={styles.chartContainer}>
            <StackedBarChart
              style={styles.chart}
              data={{
                labels: chartData.labels,  // X-axis labels (Weeks)
                legend: chartData.legend,  // Lab names in the legend
                data: chartData.data,  // Stacked bar data for each term
                barColors: chartData.barColors,  // Bar colors for each lab
              }}
              width={screenWidth - 20}
              height={500}  // Adjust chart height
              chartConfig={{
                backgroundColor: '#FFFFFF',  
                backgroundGradientFrom: '#FFFFFF',  
                backgroundGradientTo: '#FFFFFF',   
                decimalPlaces: 0,                   // No decimals in labels
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,  // Black text color
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,  // Black label color
                style: {
                  borderRadius: 16,
                  paddingRight: 10,
                },
                barPercentage: 0.8,  // Wider bars
              }}
              verticalLabelRotation={30}  // Rotate labels if needed
              showLegend={true}
            />
          </View>
        )
      )}
    </ScrollView>
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
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: 150,
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
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  noDataText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  chartContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default Reports;
