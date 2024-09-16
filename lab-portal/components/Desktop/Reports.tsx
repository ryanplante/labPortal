import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { StackedBarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import moment from 'moment-timezone';
import { getUserByToken } from '../../services/loginService';
import LogService from '../../services/logService';
import LabPicker from '../../components/LabPicker';
import PlatformSpecificDateTimePicker from '../Modals/PlatformSpecificDateTimePicker';
import { captureRef } from 'react-native-view-shot';
import { PDFDocument, rgb } from 'pdf-lib';
import * as XLSX from 'xlsx';
import userService from '../../services/userService';
import { convertToLocalTime } from '../../services/helpers';

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
  const [selectedTerm, setSelectedTerm] = useState<string>('All');  // To store the selected term
  const [terms, setTerms] = useState<string[]>([]);
  const chartRef = useRef(null); // Add a reference to the chart component

  // Fetch user info (including department ID) and logs on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userInfo = await getUserByToken();
        setUserDept(userInfo.userDept);
        // Fetch log summaries based on the selected filter, lab, userDept, and item filter
        let itemFilter = isItemFilter == 'Item' ? true : (isItemFilter == 'Student' ? false : null);
        const logs = await LogService.getLogSummary(
          filter,
          (selectedTerm === 'All' && !['d', 't'].includes(selectedTerm)) ? startTime : undefined,
          (selectedTerm === 'All' && !['d', 't'].includes(selectedTerm)) ? endTime : undefined,
          
          itemFilter,
          userInfo.userDept
        );
        // Fetch all terms for the term picker
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
  }, [filter, startTime, endTime, isItemFilter]);

  const fetchAndFilterLogs = async () => {
    try {
      const logs = await LogService.getLogsByDept(userDept, startTime, endTime);

      // Filter by selectedLab if it is not 'Choose Lab'
      let filteredLogs = selectedLab !== 'Choose Lab'
        ? logs.filter(log => log.itemId === selectedLab)
        : logs;
      // Filter out items/student check in logs based on the state
      if (isItemFilter !== 'All') {
        if (isItemFilter === 'Item') {
          filteredLogs = filteredLogs.filter(log => log.itemId != undefined);
        } else if (isItemFilter === 'Student') {
          filteredLogs = filteredLogs.filter(log => log.itemId == undefined || log.itemId == null);
        }
      }
      return filteredLogs;
    } catch (error) {
      console.error('Error fetching logs:', error);
      return [];
    }
  };

  const getNameById = async (Id: Number) => {
    try {
      if (Id) {
        const monitor = await userService.getUserById(Id);
        return `${monitor.fName} ${monitor.lName}`;
      }
      return 'Unknown'; // Return 'Unknown' if monitorID is null or invalid
    } catch (error) {
      console.error('Error fetching monitor name:', error);
      return 'Unknown'; // Handle errors gracefully
    }
  };

  const generateCSV = async (data) => {
    let csvHeaders = ['Student ID', 'Student Name', 'Item ID', 'Items Borrowed', 'Time In', 'Time Out', 'Monitor ID', 'Monitor Name'];
    if (isItemFilter === 'Student') {
      csvHeaders = ['Student ID', 'Student Name', 'Time In', 'Time Out', 'Monitor ID', 'Monitor Name'];
    }
    // Iterate through the data and fetch monitor names
    const csvRows = await Promise.all(data.map(async (log) => {
      const monitorName = await getNameById(log.monitorID); // Fetch monitor name 
      let row = [
        log.studentId,
        log.studentName,
        log.itemId,
        log.itemDescription,
        convertToLocalTime(log.timeIn),
        convertToLocalTime(log.timeOut) || '',
        log.monitorID,
        monitorName,
      ];
      if (isItemFilter === 'Student') {
        row = [
          log.studentId,
          log.studentName,
          convertToLocalTime(log.timeIn),
          convertToLocalTime(log.timeOut) || '',
          log.monitorID,
          monitorName,
        ];
      }
      return row;
    }));

    // Create CSV string
    let csvContent = csvHeaders.join(',') + '\n' + csvRows.map(row => row.join(',')).join('\n');

    // Create Blob and trigger download
    if (Platform.OS === 'web') {
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'logs.csv';
      link.click();
    }
  };



  const generateXLSX = async (data) => {
    let xlsxHeaders = ['Student ID', 'Student Name', 'Item ID', 'Items Borrowed', 'Time In', 'Time Out', 'Monitor ID', 'Monitor Name'];

    // Adjust headers based on the isItemFilter value
    if (isItemFilter === 'Student') {
      xlsxHeaders = ['Student ID', 'Student Name', 'Time In', 'Time Out', 'Monitor ID', 'Monitor Name'];
    }

    // Map the data to add monitor name and convert time
    const xlsxRows = await Promise.all(data.map(async (log) => {
      const monitorName = await getNameById(log.monitorID); // Fetch monitor name asynchronously

      // Construct the row based on the filter
      if (isItemFilter === 'Student') {
        // For student logs, exclude item fields
        return {
          'Student ID': log.studentId,
          'Student Name': log.studentName,
          'Time In': convertToLocalTime(log.timeIn),  // Convert to local time
          'Time Out': convertToLocalTime(log.timeOut) || '', // Convert to local time
          'Monitor ID': log.monitorID,
          'Monitor Name': monitorName, // Add monitor name
        };
      } else {
        // For item logs or all logs, include all fields
        return {
          'Student ID': log.studentId,
          'Student Name': log.studentName,
          'Item ID': log.itemId,
          'Items Borrowed': log.itemDescription,
          'Time In': convertToLocalTime(log.timeIn),  // Convert to local time
          'Time Out': convertToLocalTime(log.timeOut) || '', // Convert to local time
          'Monitor ID': log.monitorID,
          'Monitor Name': monitorName, // Add monitor name
        };
      }
    }));

    // Add headers manually to the worksheet
    const worksheet = XLSX.utils.json_to_sheet(xlsxRows, { header: xlsxHeaders });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs');

    // Create XLSX binary data
    const xlsxFile = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Create Blob and trigger download
    if (Platform.OS === 'web') {
      const blob = new Blob([xlsxFile], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'logs.xlsx';
      link.click();
    }
  };


  const generatePDF = async (chartRef, chartData) => {
    try {
      // Capture the chart as an image (PNG)
      const imageUri = await captureRef(chartRef, {
        format: 'png',
        quality: 1,
      });

      // Fetch the image as base64
      const response = await fetch(imageUri);
      const imageBlob = await response.blob();
      const imageBytes = await imageBlob.arrayBuffer();

      // Create a PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4 size page (595 x 842 in points)
      // Item filter needs to be exclusively true or false, else just make it Check in rpeort
      let title = 'Check In Report';
      if (isItemFilter === 'Item') {
        title = 'Item Check In Report';
      } else if (isItemFilter === 'Student') {
        title = 'Student Check In Report';
      }

      page.drawText(title, {
        x: 50,
        y: 800, // Top of the page
        size: 24,
        color: rgb(0, 0, 0),
      });

      // Embed the PNG image in the PDF
      const pngImage = await pdfDoc.embedPng(imageBytes);
      const { width, height } = pngImage.scale(0.5); // Adjust the scale if necessary
      page.drawImage(pngImage, {
        x: 50,
        y: 700 - height, // Position the image below the title
        width,
        height,
      });

      // Add the legend below the chart
      const legendYPosition = 700 - height - 40; // Adjust the position below the chart
      const legendItems = chartData.legend; // Assume chartData.legend contains the legend (lab names)
      const legendColors = chartData.barColors; // Colors for the legend
      const legendFontSize = 12;

      legendItems.forEach((legendItem, index) => {
        const legendColor = legendColors[index];
        const legendXPosition = 50; // X position of the legend
        const itemYPosition = legendYPosition - index * 20; // Y position, adjusted for each item

        // Draw the color box (filled rectangle) for the legend
        page.drawRectangle({
          x: legendXPosition,
          y: itemYPosition,
          width: 10,
          height: 10,
          color: rgb(
            parseInt(legendColor.substring(1, 3), 16) / 255, // Red component
            parseInt(legendColor.substring(3, 5), 16) / 255, // Green component
            parseInt(legendColor.substring(5, 7), 16) / 255  // Blue component
          ),
        });

        // Draw the legend text (lab name)
        page.drawText(legendItem, {
          x: legendXPosition + 20,
          y: itemYPosition,
          size: legendFontSize,
          color: rgb(0, 0, 0),
        });
      });

      // Serialize the PDF to bytes
      const pdfBytes = await pdfDoc.save();

      // Web: Create a Blob from the PDF and trigger download
      if (Platform.OS === 'web') {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'chart.pdf';
        link.click();
      } else {
        // Mobile-specific code would go here (if needed)
        console.log('Non-web platform detected');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };



  const visibilityMap = {
    w: { showStartTime: false, showEndTime: false },  // Week: Hide both start and end
    m: { showStartTime: false, showEndTime: false },  // Month: Hide both start and end
    y: { showStartTime: false, showEndTime: false },  // Year: Hide both start and end
    d: { showStartTime: true, showEndTime: false },   // Day: Show start, hide end
    h: { showStartTime: false, showEndTime: false },    // Hour: don't show start time, end time
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
    if (term === 'All' && filter !== 'd') {
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
    else if (filter === 'd') {
      const currentDate = moment().startOf('day');  // Set to the start of the current day
      const nextDay = currentDate.clone().add(1, 'days').startOf('day');  // Set to the start of the next day
    
      setStartTime(currentDate.toDate());  // Set startTime to the start of the current day
      setEndTime(nextDay.toDate());  // Set endTime to the start of the next day
    }    
  };




  const chartData = prepareChartData();

  const handleDownload = async () => {
    let filteredLogs;
    switch (fileType) {
      case 'CSV':
        filteredLogs = await fetchAndFilterLogs();
        generateCSV(filteredLogs);
        break;
      case 'XLSX':
        filteredLogs = await fetchAndFilterLogs();
        generateXLSX(filteredLogs);
        break;
      case 'PDF':
        await generatePDF(chartRef, chartData);
        break;
      default:
        console.error('Invalid file type selected');
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
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter Logs By:</Text>
          <Picker
            selectedValue={isItemFilter}
            style={styles.picker}
            onValueChange={setIsItemFilter}
          >
            <Picker.Item label="All" value="All" />
            <Picker.Item label="Item" value="Item" />
            <Picker.Item label="Student" value="Student" />
          </Picker>
        </View>

        {/* Lab Picker Component */}
        <LabPicker
          selectedLabId={selectedLab}
          onLabChange={setSelectedLab}  // Update selectedLab when a lab is picked
          readOnly={false}
          style={styles.labPicker}
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
        {chartData && chartData.labels.length > 0 && !'htd'.includes(filter) && (
          <Picker
            selectedValue={selectedTerm}
            style={styles.picker}
            onValueChange={(itemValue) => {
              setSelectedTerm(itemValue);
              if (itemValue === 'All') {
                setStartTime(null);
                setEndTime(null);
              } else {
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

        {/* Conditional Date Pickers */}
        {visibilityMap[filter].showStartTime && (
          <PlatformSpecificDateTimePicker
            dateTime={startTime}
            onDateTimeChange={(selectedDate) => {
              setStartTime(selectedDate);

              // If the filter is 'd' (Day), automatically set the endTime to one day ahead
              if (filter === 'd') {
                const nextDay = new Date(selectedDate);
                nextDay.setDate(nextDay.getDate() + 1);
                setEndTime(nextDay);
              }
            }}
            readOnly={false}
          />
        )}

        {visibilityMap[filter].showEndTime && (
          <PlatformSpecificDateTimePicker
            dateTime={endTime}
            onDateTimeChange={setEndTime}
            readOnly={false}
          />
        )}


        {/* Download as Picker */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Download as</Text>
          <Picker
            selectedValue={fileType}
            style={styles.picker}
            onValueChange={setFileType}
          >
            <Picker.Item label="PDF" value="PDF" />
            <Picker.Item label="XLSX" value="XLSX" />
            <Picker.Item label="CSV" value="CSV" />
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
            <View ref={chartRef}>
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
    flexWrap: 'wrap',  // Ensures wrapping if needed on smaller screens
  },
  picker: {
    height: 50,
    width: 120,  // Adjust width to fit nicely in a row
    marginHorizontal: 5,  // Adds spacing between pickers
  },
  labPicker: {
    width: 150,  // Adjust width for lab picker
    marginHorizontal: 5,
  },
  downloadButton: {
    backgroundColor: '#ffc107',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,  // Adds spacing between download button and pickers
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
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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