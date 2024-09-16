import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { StackedBarChart } from 'react-native-chart-kit';
import moment from 'moment-timezone';
import LogService from '../../../services/logService';
import { getUserByToken } from '../../../services/loginService';

const screenWidth = Dimensions.get('window').width;

const FacultyView = () => {
  const [logSummaries, setLogSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null); // Reference for the chart component

  // Set startTime and endTime to current day
  const startTime = moment().startOf('day').toDate();
  const endTime = moment().endOf('day').toDate();

  // Fetch logs on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userInfo = await getUserByToken();
        // Fetch log summaries for the current day
        const logs = await LogService.getLogSummary('t', startTime, endTime, null, userInfo.userDept);
        setLogSummaries(logs);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare the chart data for the StackedBarChart
  const prepareChartData = () => {
    if (!logSummaries.length) {
      return null;
    }

    // Extract unique terms for the X-axis labels
    const terms = Array.from(new Set(logSummaries.map(log => log.term)));

    // Extract unique lab names for the legend
    const labNames = Array.from(new Set(logSummaries.map(log => log.labName)));

    // Group data by term and lab
    const data = terms.map(term => {
      return labNames.map(labName => {
        const matchingLogs = logSummaries.filter(log => log.term === term && log.labName === labName);
        return matchingLogs.length ? matchingLogs.reduce((acc, log) => acc + log.count, 0) : 0;
      });
    });

    return {
      labels: terms,  // X-axis labels (terms)
      legend: labNames,  // Lab names in the legend
      data,  // Stacked bar data for each term
      barColors: [
        '#FF0000', '#0000FF', '#00FF00', // Red, Blue, Green for first 3
        '#FF4500', '#1E90FF', '#32CD32', // OrangeRed, DodgerBlue, LimeGreen for more
        '#FFD700', '#8A2BE2', '#FF69B4'  // Gold, BlueViolet, HotPink for additional
      ],
    };
  };

  const chartData = prepareChartData();

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Faculty View</Text>

      {/* Check if there is no data */}
      {logSummaries.length === 0 ? (
        <Text style={styles.noDataText}>No check-ins found for today!</Text>
      ) : (
        chartData && (
          <View style={styles.chartContainer}>
            <View ref={chartRef}>
              <StackedBarChart
                style={styles.chart}
                data={{
                  labels: chartData.labels,  // X-axis labels (terms)
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

export default FacultyView;
