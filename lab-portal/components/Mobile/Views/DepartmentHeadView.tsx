import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, StyleSheet, ActivityIndicator } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import axios from 'axios';

const DepartmentHeadView = () => {
    const [logData, setLogData] = useState({ dates: [], counts: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogData = async () => {
            try {
                // Define the date range for the last 7 days
                const today = new Date();
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(today.getDate() - 6);

                // Format dates as strings (assuming the API expects ISO date strings)
                const startDate = oneWeekAgo.toISOString();
                const endDate = today.toISOString();

                // Make the API request to the FilteredLogs endpoint with the date range
                const response = await axios.get(`${process.env.EXPO_PUBLIC_API}/Logs`, {
                    params: {
                        startDate: startDate,
                        endDate: endDate,
                    },
                });
                const logs = response.data.$values; // Access the logs using the $values key
                console.log('Filtered Logs data:', logs); // Log the extracted data
                const processedData = processLogs(logs);
                setLogData(processedData);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch log data:', error);
                setLoading(false);
            }
        };

        fetchLogData();
    }, []);

    const processLogs = (logs: any[]) => {
      const logCounts = {}; // Initialize an empty object to store counts
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 6); // Set the date to one week ago
  
      logs.forEach(log => {
          const logDate = new Date(log.timein).toLocaleDateString(); // Get the log date as a string
  
          console.log('Processing log date:', logDate); // Log the current date being processed
  
          // Ensure we're only processing logs from the last week
          if (new Date(log.timein) <= oneWeekAgo) {
              logCounts[logDate] = (logCounts[logDate] || 0) + 1; // Increment or initialize the count for this date
          }

          console.log(oneWeekAgo)
  
          console.log('Updated logCounts:', logCounts); // Log the current state of logCounts
      });
  
      console.log('Final logCounts:', logCounts); // Log the final counts for all dates
  
      const dates = Object.keys(logCounts).sort(); // Sorting the dates
      const counts = dates.map(date => logCounts[date]); // Mapping counts based on sorted dates
  
      return { dates, counts };
  };
  
  

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Logs Created Per Day (Last Week)</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <BarChart
                data={{
                    labels: logData.dates,
                    datasets: [
                        {
                            data: logData.counts,
                        },
                    ],
                }}
                width={Dimensions.get('window').width - 40} // from react-native
                height={220}
                yAxisLabel="" // Prefix label (like "$")
                yAxisSuffix="" // Suffix label (like "%")
                fromZero={true} // Ensures Y-axis starts from 0
                chartConfig={{
                    backgroundColor: '#e26a00',
                    backgroundGradientFrom: '#fb8c00',
                    backgroundGradientTo: '#ffa726',
                    decimalPlaces: 0, // Ensures only whole numbers on Y-axis
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: {
                        borderRadius: 16,
                    },
                    propsForDots: {
                        r: '6',
                        strokeWidth: '2',
                        stroke: '#ffa726',
                    },
                }}
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                }}
                verticalLabelRotation={30} // Adjust rotation if labels are too long
              />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});

export default DepartmentHeadView;
