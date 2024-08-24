import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, TextInput, Image, Button } from 'react-native';
import moment from 'moment-timezone';
import StudentSearcher from '../../Modals/StudentSearcher';
import DynamicForm from '../../Modals/DynamicForm';
import PlatformSpecificTimePicker from '../../Modals/PlatformSpecificTimePicker';
import { getUserByToken } from '../../../services/loginService';
import LogService from '../../../services/logService';
import LabService from '../../../services/labsService';
import { User } from '../../../services/userService';
import ConfirmationModal from "../../Modals/ConfirmationModal"; // Import ConfirmationModal

const MonitorView = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedView, setSelectedView] = useState('Logs');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isFormOpen, setFormOpen] = useState(false);
  const [isStudentSearcherOpen, setStudentSearcherOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState({ id: '', firstName: '', lastName: '' });
  const [checkInTime, setCheckInTime] = useState(new Date());
  const [checkOutTime, setCheckOutTime] = useState<Date | undefined>(undefined);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [labId, setLabId] = useState<number | null>(null);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false); // State for modal visibility
  const [entryToDelete, setEntryToDelete] = useState<Entry | null>(null); // State for tracking entry to delete

  type Entry = {
    id: string;
    studentId: string;
    studentName: string;
    timeIn: string;
    timeOut: string | null;
  };

  useEffect(() => {
    const fetchUserAndLabId = async () => {
      try {
        const fetchedUser = await getUserByToken();
        if (fetchedUser.privLvl === 0) {
          Alert.alert('Error', 'You do not have the privilege to view this page.');
          return;
        }
        setUser(fetchedUser);

        const fetchedLabId = await LabService.getLabByDept(fetchedUser.userDept);
        setLabId(fetchedLabId);

        await fetchLogsForToday(fetchedLabId);
      } catch (error) {
        console.error('Failed to fetch user or lab information:', error);
      }
    };

    fetchUserAndLabId();
  }, []);

  const fetchLogsForToday = async (labId: number) => {
    try {
      const startDate = moment().startOf('day').utc().format();
      const endDate = moment().endOf('day').utc().format();
      const logs = await LogService.getLogsByLab(labId, startDate, endDate);

      const formattedLogs = logs.map(log => ({
        id: log.id.toString(),
        studentId: log.studentId.toString(),
        studentName: log.studentName,
        timeIn: moment(log.timeIn).format('MMMM Do YYYY, h:mm:ss a'), // Convert time to local format
        timeOut: log.timeOut ? moment(log.timeOut).format('MMMM Do YYYY, h:mm:ss a') : null,
      }));

      setEntries(formattedLogs);
    } catch (error) {
      console.error('Failed to fetch logs for today:', error);
    }
  };

  const handleStudentSelect = (student: { userId: string, fName: string, lName: string }) => {
    setSelectedStudent({
      id: student.userId,
      firstName: student.fName,
      lastName: student.lName,
    });
    setError(null);
    setStudentSearcherOpen(false);
  };

  const validateTimes = () => {
    const now = new Date();

    if (checkInTime > now) {
      setError('Check-in time cannot be in the future.');
      return false;
    }
    if (checkOutTime && checkOutTime > now) {
      setError('Check-out time cannot be in the future.');
      return false;
    }

    if (checkOutTime && checkInTime > checkOutTime) {
      setError('Check-in time cannot be after the check-out time.');
      return false;
    }

    return true;
  };

  const handleCheckIn = async () => {
    if (!selectedStudent.id) {
      setError('Please select a student.');
      return;
    }

    if (!validateTimes()) {
      return;
    }

    try {
      let newEntryId = editingEntryId;

      const newEntry: Entry = {
        id: newEntryId || Date.now().toString(),
        studentId: selectedStudent.id,
        studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
        timeIn: moment(checkInTime).format('MMMM Do YYYY, h:mm:ss a'), // Human-readable format in local time
        timeOut: checkOutTime ? moment(checkOutTime).format('MMMM Do YYYY, h:mm:ss a') : null,
      };

      if (editingEntryId) {
        await LogService.updateLog(Number(editingEntryId), {
          studentId: Number(selectedStudent.id),
          timein: moment(checkInTime).toISOString(),
          timeout: checkOutTime ? moment(checkOutTime).toISOString() : '',
          labId: labId ?? 1,
          monitorId: user?.userId ?? 0,
        });
      } else {
        const createdLog = await LogService.createLog({
          studentId: Number(selectedStudent.id),
          timein: moment(checkInTime).toISOString(),
          timeout: checkOutTime ? moment(checkOutTime).toISOString() : '',
          labId: labId ?? 1,
          monitorId: user?.userId ?? 0,
        });
        newEntryId = createdLog.summaryId.toString();
        newEntry.id = newEntryId;
      }

      setEntries((prevEntries) =>
        editingEntryId
          ? prevEntries.map((entry) => (entry.id === editingEntryId ? newEntry : entry))
          : [...prevEntries, newEntry]
      );

      setEditingEntryId(newEntryId); // Set the correct ID for future updates
      resetForm();
      setFormOpen(false);
    } catch (error) {
      setError('Failed to save the log. Please try again.');
      console.error('Error saving log:', error);
    }
  };

  const handleEdit = (entry: Entry) => {
    setSelectedStudent({
      id: entry.studentId,
      firstName: entry.studentName.split(' ')[0],
      lastName: entry.studentName.split(' ')[1],
    });

    setCheckInTime(new Date(moment(entry.timeIn, 'MMMM Do YYYY, h:mm:ss a').toISOString()));
    setCheckOutTime(!entry.timeOut ? undefined : new Date(moment(entry.timeOut, 'MMMM Do YYYY, h:mm:ss a').toISOString()));
    setEditingEntryId(entry.id);
    setFormOpen(true);
    setError(null);
  };

  const handleDelete = (entry: Entry) => {
    setEntryToDelete(entry); // Set the entry to be deleted
    setDeleteModalVisible(true); // Show the confirmation modal
  };

  const confirmDelete = async () => {
    if (entryToDelete) {
      try {
        await LogService.deleteLog(Number(entryToDelete.id), user?.userId ?? 0);
        setEntries((prevEntries) => prevEntries.filter(entry => entry.id !== entryToDelete.id));
      } catch (error) {
        console.error('Failed to delete log:', error);
      } finally {
        setDeleteModalVisible(false); // Hide the confirmation modal
        setEntryToDelete(null); // Reset the entry to delete
      }
    }
  };

  const handleClockOut = async (id: string) => {
    try {
      await LogService.timeOutLog(Number(id), user?.userId ?? 0);
      await fetchLogsForToday(labId ?? 1);
    } catch (error) {
      console.error('Failed to clock out log:', error);
    }
  };

  const resetForm = () => {
    setSelectedStudent({ id: '', firstName: '', lastName: '' });
    setCheckInTime(new Date());
    setCheckOutTime(undefined);
    setEditingEntryId(null);
    setError(null);
  };

  if (!user) return null;

  const studentPickerComponent = [
    <View style={styles.inputContainer} key="inputContainer">
      <Text style={[styles.label, !selectedStudent.id && error ? styles.errorText : null]}>
        Student ID{!selectedStudent.id && error ? '*' : ''}
      </Text>
      <TextInput
        key="studentId"
        style={styles.readOnlyInput}
        placeholder="Student ID"
        value={selectedStudent.id}
        editable={false}
      />
      <TouchableOpacity
        key="searchButton"
        style={styles.iconButton}
        onPress={() => setStudentSearcherOpen(true)}
      >
        <Image source={require('../../../assets/search-button.png')} style={styles.searchIcon} />
      </TouchableOpacity>
    </View>,
    <Text style={[styles.label, !selectedStudent.id && error ? styles.errorText : null]}>
      Student Name{!selectedStudent.id && error ? '*' : ''}
    </Text>,
    <TextInput
      key="studentName"
      style={styles.readOnlyInput}
      placeholder="Student Name"
      value={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
      editable={false}
    />,
  ];

  const timePickerComponent = [
    <Text style={styles.label} key="checkInLabel">Check-In Time</Text>,
    <PlatformSpecificTimePicker
      key="checkInPicker"
      time={checkInTime}
      onTimeChange={setCheckInTime}
    />,
    editingEntryId && checkOutTime !== undefined && (
      <>
        <Text style={styles.label} key="checkOutLabel">Check-Out Time</Text>,
        <PlatformSpecificTimePicker
          key="checkOutPicker"
          time={checkOutTime}
          onTimeChange={(newTime) => setCheckOutTime(newTime || undefined)}
        />
      </>
    ),
  ];

  const addButtonComponent = [
    <Button
      key="updateAdd"
      title={editingEntryId ? "Update" : "Add"}
      onPress={handleCheckIn}
    />,
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome, {user.fName}</Text>
      <Text style={styles.subHeader}>Logs for today</Text>
      <TouchableOpacity style={styles.addButton} onPress={() => setFormOpen(true)}>
        <Text style={styles.addButtonText}>Log new student</Text>
      </TouchableOpacity>

      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>Student ID</Text>
        <Text style={styles.tableHeaderText}>Student Name</Text>
        <Text style={styles.tableHeaderText}>Time In</Text>
        <Text style={styles.tableHeaderText}>Time Out</Text>
      </View>

      {entries.length === 0 ? (
        <Text style={styles.noLogsText}>No logs for today!</Text>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.entryRow}>
              <View style={styles.tableCell}>
                <Text>{item.studentId}</Text>
              </View>
              <View style={styles.tableCell}>
                <Text>{item.studentName}</Text>
              </View>
              <View style={styles.tableCell}>
                <Text>{item.timeIn}</Text>
              </View>
              <View style={styles.tableCell}>
                {item.timeOut ? (
                  <Text>{item.timeOut}</Text>
                ) : (
                  <TouchableOpacity onPress={() => handleClockOut(item.id)} style={styles.clockButton}>
                    <Image source={require('../../../assets/time.png')} style={styles.iconImage} />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
                <Image source={require('../../../assets/edit.png')} style={styles.iconImage} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton}>
                <Image source={require('../../../assets/trash.png')} style={styles.iconImage} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <DynamicForm
        visible={isFormOpen}
        title={editingEntryId ? "Update Log" : "Add Log"}
        onClose={() => {
          setFormOpen(false);
          resetForm();
        }}
        components={
          [
            isStudentSearcherOpen ? [[<StudentSearcher key="searcher" onSelect={handleStudentSelect} onBackPress={() => setStudentSearcherOpen(false)} />]] : [
              ...studentPickerComponent,
              ...timePickerComponent,
              ...addButtonComponent
            ]
          ]}
        error={error}
        backgroundColor="#d6d6d6"
        isStudentSearcherOpen={isStudentSearcherOpen}
      />

      <ConfirmationModal
        visible={isDeleteModalVisible}
        title={<Text>Confirm Deletion</Text>}
        description={<Text>Are you sure you want to delete this entry? This action cannot be undone.</Text>}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        type="yesNoDanger"
      />
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
  subHeader: {
    fontSize: 18,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#ffc107',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pickerLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  picker: {
    height: 50,
    width: 150,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#f8f8f8',
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noLogsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    padding: 10,
  },
  deleteButton: {
    padding: 10,
  },
  clockButton: {
    padding: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  readOnlyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    height: 45,
    backgroundColor: '#aaaaaaaa',
  },
  iconButton: {
  },
  iconImage: {
    width: 20,
    height: 20,
  },
  searchIcon: {
    width: 45,
    marginLeft: 0,
    height: 45,
  },
  errorText: {
    color: 'red',
  },
});

export default MonitorView;
