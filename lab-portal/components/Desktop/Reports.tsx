import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { StackedBarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import moment from 'moment-timezone';
import { getUserByToken } from '../../services/loginService';
import LogService from '../../services/logService';
import LabPicker from '../../components/LabPicker';
import PlatformSpecificDateTimePicker from '../Modals/PlatformSpecificDateTimePicker';

const screenWidth = Dimensions.get('window').width;

const Reports = () => {
  const [filter, setFilter] = useState<string>('w');
  const [date, setDate] = useState(new Date());
  const [fileType, setFileType] = useState('PDF');
  const [logSummaries, setLogSummaries] = useState<any[]>([]);
  const [allLogSummaries, setAllLogSummaries] = useState<any[]>([]);
  const [userDept, setUserDept] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLab, setSelectedLab] = useState<number | string>('Choose Lab');
  const [isItemFilter, setIsItemFilter] = useState<null | boolean>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<string>('All');  // To store the selected term
  const [terms, setTerms] = useState<string[]>([]);


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
          selectedTerm == 'All' ? undefined : startTime,
          selectedTerm == 'All' ? undefined : endTime,
          isItemFilter,
          userInfo.userDept
        );
        // Fetch all terms for the term picker
        const allLogs = await LogService.getLogSummary(
          filter,
          undefined,
          undefined,
          isItemFilter,
          userInfo.userDept
        );
        const allTerms = Array.from(new Set(allLogs.map(log => log.term)));
        const filteredAllTerms = allTerms.filter(term => {
          if (filter === 'y') {
            return /^\d{4}$/.test(term); // Only return years
          } else if (filter === 'm') {
            return term.match(/January|February|March|April|May|June|July|August|September|October|November|December/); // Only return months
          } else if (filter === 'w') {
            return term.match(/Week|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/); // Example week/day terms
          }
          return true; // For other filters, return all terms
        });
        console.log(filteredAllTerms);
        setTerms(filteredAllTerms);

        // Always set the full log summaries first
        setLogSummaries(logs);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter, endTime, endTime, isItemFilter]);


  const visibilityMap = {
    w: { showStartTime: false, showEndTime: false },  // Week: Hide both start and end
    m: { showStartTime: false, showEndTime: false },  // Month: Hide both start and end
    y: { showStartTime: false, showEndTime: false },  // Year: Hide both start and end
    d: { showStartTime: true, showEndTime: false },   // Day: Show start, hide end
    h: { showStartTime: true, showEndTime: true },    // Hour: show start time, end time
    t: { showStartTime: true, showEndTime: true },    // Term: Show both start and end
  };
  // Apply filtering based on selected lab
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
    // Filter terms based on the selected filter
    const filteredTerms = terms.filter(term => {
      if (filter === 'y') {
        return /^\d{4}$/.test(term); // Only return years
      } else if (filter === 'm') {
        return term.match(/January|February|March|April|May|June|July|August|September|October|November|December/); // Only return months
      } else if (filter === 'w') {
        return term.match(/Week|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/); // Example week/day terms
      }
      return true; // For other filters, return all terms
    });

    // Extract unique lab names for the legend
    const labNames = Array.from(new Set(filteredLogSummaries.map(log => log.labName)));

    // Prepare data array for each term, ensuring that logs are grouped correctly by term and lab
    const data = filteredTerms.map(term => {
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

  // Function to handle changes in the selected term and calculate start and end time
  const handleTermChange = (term: string) => {
    if (term === 'All') {
      setStartTime(null);
      setEndTime(null);
      return; // Exit if no term is selected
    }


    if (filter === 'w') {
      // Extract the week number and calculate the start and end date of that week
      const weekNumber = parseInt(term.replace('Week ', ''), 10);  // Extract week number from term
      const firstDayOfYear = moment().startOf('year');  // First day of the current year
      const startOfWeek = firstDayOfYear.add(weekNumber - 1, 'weeks').startOf('week');
      const endOfWeek = startOfWeek.clone().endOf('week');

      setStartTime(startOfWeek.toDate());
      setEndTime(endOfWeek.toDate());

    } else if (filter === 'y') {
      // For year, set startTime to Jan 1 and endTime to Dec 31 of the selected year
      const year = parseInt(term, 10);
      const startOfYear = moment().year(year).startOf('year');
      const endOfYear = moment().year(year).endOf('year');

      setStartTime(startOfYear.toDate());
      setEndTime(endOfYear.toDate());

    } else if (filter === 'm') {
      // For month, set startTime to the 1st of the selected month and endTime to the last day
      const month = moment().month(term).startOf('month');  // `term` is the month name, e.g., "January"
      const endOfMonth = month.clone().endOf('month');

      setStartTime(month.toDate());
      setEndTime(endOfMonth.toDate());
    }
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
          onValueChange={(itemValue) => {
            setSelectedTerm('All');
            handleTermChange(itemValue);
            setFilter(itemValue);
          }}
        >
          <Picker.Item label="Week" value="w" />
          <Picker.Item label="Day" value="d" />
          <Picker.Item label="Month" value="m" />
          <Picker.Item label="Year" value="y" />
          <Picker.Item label="Hour" value="h" />
          <Picker.Item label="Term" value="t" />
        </Picker>

        {/* Dynamic Term Picker based on selected filter */}
        {chartData && chartData.labels.length > 0 && (
          <Picker
            selectedValue={selectedTerm}  // Track the selected term
            style={styles.picker}
            onValueChange={(itemValue) => {
              setSelectedTerm(itemValue);  // Set the selected term
              if (itemValue === 'All') {
                // If "All" is selected, set startTime and endTime to null
                setStartTime(null);
                setEndTime(null);
              } else {
                // Process the term and calculate start and end time
                handleTermChange(itemValue);
              }
            }}
          >
            <Picker.Item label="All" value="All" />

            {terms.map((term, index) => (
              <Picker.Item key={index} label={term} value={term} />
            ))}
          </Picker>
        )}

        {visibilityMap[filter].showStartTime && (
          <PlatformSpecificDateTimePicker
            dateTime={startTime ?? new Date()}
            onDateTimeChange={setStartTime}
            readOnly={false}
          />
        )}

        {visibilityMap[filter].showEndTime && (
          <PlatformSpecificDateTimePicker
            dateTime={endTime ?? new Date()}
            onDateTimeChange={setEndTime}
            readOnly={false}
          />
        )}


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

        {/* Picker for Filtering by Item or Student */}
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
