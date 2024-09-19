import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { StackedBarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { getUserByToken } from '../../services/loginService';
import LogService from '../../services/logService';
import userService from '../../services/userService';
import Dropdown from '../Modals/Dropdown';

const screenWidth = Dimensions.get('window').width;

const Reports = () => {
  const [filter, setFilter] = useState<string>('w');
  const [fileType, setFileType] = useState('PDF');
  const [logSummaries, setLogSummaries] = useState<any[]>([]);
  const [userDept, setUserDept] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLab, setSelectedLab] = useState<number | string>('Choose Lab');
  const [isItemFilter, setIsItemFilter] = useState<string>('All');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<string>('All'); // To store the selected term
  const [terms, setTerms] = useState<string[]>([]);
  const chartRef = useRef(null); // Add a reference to the chart component

  const filterOptions = ['Week', 'Day', 'Month', 'Year', 'Hour', 'Term'];
  const itemFilterOptions = ['All', 'Item', 'Student'];
  const fileTypeOptions = ['PDF', 'XLSX', 'CSV'];

  // Fetch user info (including department ID) and logs on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userInfo = await getUserByToken();
        setUserDept(userInfo.userDept);

        console.log('User Department:', userInfo.userDept); // Debugging userDept

        let itemFilter = isItemFilter == 'Item' ? true : (isItemFilter == 'Student' ? false : null);
        const logs = await LogService.getLogSummary(
          filter,
          (selectedTerm === 'All' && !['d', 't'].includes(selectedTerm)) ? startTime : undefined,
          (selectedTerm === 'All' && !['d', 't'].includes(selectedTerm)) ? endTime : undefined,
          itemFilter,
          userInfo.userDept
        );

        console.log('Fetched Logs:', logs); // Debugging logs

        const allLogs = await LogService.getLogSummary(
          filter,
          undefined,
          undefined,
          itemFilter,
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
        console.log('Filtered Terms:', filteredAllTerms); // Debugging terms

        setTerms(filteredAllTerms);

        setLogSummaries(logs);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter, startTime, endTime, isItemFilter]);

  const fetchAndFilterLogs = async () => {
    try {
      const logs = await LogService.getLogsByDept(userDept, startTime, endTime);
      console.log('Fetched Logs for filtering:', logs); // Debugging logs

      let filteredLogs = selectedLab !== 'Choose Lab'
        ? logs.filter(log => log.itemId === selectedLab)
        : logs;
      console.log('Filtered Logs by Lab:', filteredLogs); // Debugging lab filtering

      if (isItemFilter !== 'All') {
        if (isItemFilter === 'Item') {
          filteredLogs = filteredLogs.filter(log => log.itemId != undefined);
        } else if (isItemFilter === 'Student') {
          filteredLogs = filteredLogs.filter(log => log.itemId == undefined || log.itemId == null);
        }
      }
      console.log('Final Filtered Logs:', filteredLogs); // Debugging final logs
      return filteredLogs;
    } catch (error) {
      console.error('Error fetching logs:', error);
      return [];
    }
  };

  // Prepare the chart data for the StackedBarChart
  const prepareChartData = () => {
    if (!logSummaries.length) {
      console.log('No log summaries found.'); // Debugging no data
      return null;
    }

    const terms = Array.from(new Set(logSummaries.map(log => log.term)));
    console.log('Chart Terms:', terms); // Debugging terms

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
    console.log('Filtered Terms for Chart:', filteredTerms); // Debugging filtered terms

    const labNames = Array.from(new Set(logSummaries.map(log => log.labName)));
    console.log('Lab Names for Chart:', labNames); // Debugging lab names

    const data = filteredTerms.map(term => {
      return labNames.map(labName => {
        const matchingLogs = logSummaries.filter(log => log.term === term && log.labName === labName);
        return matchingLogs.length ? matchingLogs.reduce((acc, log) => acc + log.count, 0) : 0;
      });
    });

    console.log('Prepared Chart Data:', data); // Debugging chart data

    return {
      labels: terms,  // X-axis terms (Weeks, Days, etc.)
      legend: labNames,  // Lab Names for the legend
      data,  // Data for stacked bars
      barColors: [
        '#FF0000', '#0000FF', '#00FF00', '#FF4500', '#1E90FF', '#32CD32', '#FFD700', '#8A2BE2', '#FF69B4'
      ],
    };
  };

  const handleDownload = async () => {
    try {
      let filteredLogs;
      switch (fileType) {
        case 'CSV':
          filteredLogs = await fetchAndFilterLogs();
          console.log('Downloading CSV with logs:', filteredLogs); // Debugging CSV logs
          break;
        case 'XLSX':
          filteredLogs = await fetchAndFilterLogs();
          console.log('Downloading XLSX with logs:', filteredLogs); // Debugging XLSX logs
          break;
        case 'PDF':
          const chartData = prepareChartData();
          console.log('Generating PDF with chart data:', chartData); // Debugging PDF chart data
          break;
        default:
          console.error('Invalid file type selected');
      }
    } catch (error) {
      console.error('Error during download:', error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Reports</Text>

      {/* Filter and Download Row */}
      <View style={styles.filterRow}>
        {/* Filter Logs By */}
        <Dropdown
          label={undefined}
          data={itemFilterOptions}
          selectedValue={isItemFilter}
          onSelect={(value) => setIsItemFilter(value)}
        />

        <Text style={styles.filterLabel}>Filter By:</Text>
        <Dropdown
          label={undefined}
          data={filterOptions}
          selectedValue={filter}
          onSelect={(value) => setFilter(value)}
        />

        <Text style={styles.filterLabel}>Download as:</Text>
        <Dropdown
          label={undefined}
          data={fileTypeOptions}
          selectedValue={fileType}
          onSelect={(value) => setFileType(value)}
        />
      </View>

      {/* Check if there is no data */}
      {logSummaries.length === 0 ? (
        <Text style={styles.noDataText}>No check-ins found!</Text>
      ) : (
        <ScrollView horizontal contentContainerStyle={styles.chartContainer}>
          <StackedBarChart
            style={styles.chart}
            data={prepareChartData()}
            width={Math.max(screenWidth, 100 * terms.length)} // Allow scrolling if necessary
            height={400} // Condense height
            chartConfig={{
              backgroundColor: 'White',
              backgroundGradientFrom: '#F2F2F2',
              backgroundGradientTo: '#F2F2F2',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              barPercentage: 0.5, // Reduce bar width to fit more bars
            }}
            verticalLabelRotation={90} // Rotate labels to fit them properly
            showLegend={true}
          />
        </ScrollView>
      )}
      <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
          <Text style={styles.downloadButtonText}>Download</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' },
  picker: { height: 75, width: 100, marginHorizontal: 5 },
  labPicker: { width: 150, marginHorizontal: 5 },
  downloadButton: { backgroundColor: '#ffc107', padding: 10, borderRadius: 5, marginHorizontal: 5},
  downloadButtonText: { color: '#fff', fontSize: 16 },
  filterLabel: { fontSize: 16, fontWeight: 'bold', marginRight: 10 },
  filterContainer: { flexDirection: 'row', alignItems: 'center' },
  noDataText: { fontSize: 18, textAlign: 'center', marginTop: 20 },
  chartContainer: { marginTop: 20, marginBottom: 30 },
  chart: { marginVertical: 8, borderRadius: 16 },
});

export default Reports;
