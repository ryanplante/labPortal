import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Image, Button, Picker, Dimensions } from 'react-native';
import moment from 'moment-timezone';
import StudentSearcher from '../../Modals/StudentSearcher';
import DynamicForm from '../../Modals/DynamicForm';
import PlatformSpecificTimePicker from '../../Modals/PlatformSpecificTimePicker';
import { checkHeartbeat, deleteToken, getUserByToken } from '../../../services/loginService';
import LogService from '../../../services/logService';
import LabService from '../../../services/labsService';
import { User } from '../../../services/userService';
import ConfirmationModal from '../../Modals/ConfirmationModal';
import ActionsModal from '../../Modals/ActionsModal';
import { crossPlatformAlert, reload } from '../../../services/helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<Entry | null>(null);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const [isActionsMenuVisible, setActionsMenuVisible] = useState(false);
  const [selectedEntryForAction, setSelectedEntryForAction] = useState<Entry | null>(null);

  const screenWidth = Dimensions.get('window').width;
  const [currentScreenWidth, setCurrentScreenWidth] = useState(screenWidth);
  const isWideScreen = currentScreenWidth >= 700;

  type Entry = {
    id: string;
    studentId: string;
    studentName: string;
    timeIn: string;
    timeOut: string | null;
  };

  useEffect(() => {
    fetchUserAndLabId();

    const updateScreenWidth = () => {
      setCurrentScreenWidth(Dimensions.get('window').width);
    };

    Dimensions.addEventListener('change', updateScreenWidth);

    return () => {
      Dimensions.removeEventListener('change', updateScreenWidth);
    };
  }, []);

  const fetchUserAndLabId = async () => {
    try {
      const isApiHealthy = await checkHeartbeat();
      if (!isApiHealthy) {
        throw new Error('The server is currently unavailable.');
      }
      const token = await AsyncStorage.getItem('token');
      if (token && isApiHealthy) {
        const user = await getUserByToken();
        if (user.privLvl === 0) {
          crossPlatformAlert('Error', 'You do not have the privilege to view this page.');
          return false;
        }
        setUser(user);
        const labId = await LabService.getLabByDept(user.userDept);
        setLabId(labId);
        await fetchLogsForToday(labId);
        return true;
      }
    } catch (error) {
      const errorMessage = error.message.includes('server')
        ? 'Server is currently down. Please try again later.'
        : 'Token has expired, please refresh the app and re-login to continue.';
      crossPlatformAlert('Error', errorMessage);
      await deleteToken();
      await reload();
      return false;
    }
  };

  const fetchLogsForToday = async (labId: number) => {
    try {
      const startDate = moment().startOf('day').utc().format();
      const endDate = moment().endOf('day').utc().format();
      const logs = await LogService.getLogsByLab(labId, startDate, endDate);

      const formattedLogs = logs.map(log => ({
        id: log.id.toString(),
        studentId: log.studentId.toString().padStart(8, '0'),
        studentName: log.studentName,
        timeIn: moment(log.timeIn).format('h:mm:ss a'),
        timeOut: log.timeOut ? moment(log.timeOut).format('h:mm:ss a') : null,
      }));

      setEntries(formattedLogs);
    } catch (error) {
      console.error('Failed to fetch logs for today:', error);
    }
  };

  const handleStudentSelect = async (student: { userId: string, fName: string, lName: string }) => {
    const userAndLabLoaded = await fetchUserAndLabId();
    if (!userAndLabLoaded) return;

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
    const userAndLabLoaded = await fetchUserAndLabId();
    if (!userAndLabLoaded) return;

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
        studentId: selectedStudent.id.toString().padStart(8, '0'),
        studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
        timeIn: moment(checkInTime).format('h:mm:ss a'),
        timeOut: checkOutTime ? moment(checkOutTime).format('h:mm:ss a') : null,
      };

      if (editingEntryId) {
        await LogService.updateLog(Number(editingEntryId), {
          studentId: Number(selectedStudent.id),
          timein: moment(checkInTime).toISOString(),
          timeout: checkOutTime ? moment(checkOutTime).toISOString() : '',
          labId: labId ?? 1,
          monitorId: user?.userId ?? 0,
          Scanned: false
        });
      } else {
        const createdLog = await LogService.createLog({
          studentId: Number(selectedStudent.id),
          timein: moment(checkInTime).toISOString(),
          timeout: checkOutTime ? moment(checkOutTime).toISOString() : '',
          labId: labId ?? 1,
          monitorId: user?.userId ?? 0,
          Scanned: false
        });
        newEntryId = createdLog.summaryId.toString();
        newEntry.id = newEntryId;
      }

      setEntries((prevEntries) =>
        editingEntryId
          ? prevEntries.map((entry) => (entry.id === editingEntryId ? newEntry : entry))
          : [...prevEntries, newEntry]
      );

      setEditingEntryId(newEntryId);
      resetForm();
      setFormOpen(false);
    } catch (error) {
      setError('Failed to save the log. Please try again.');
      console.error('Error saving log:', error);
    }
  };

  const handleEdit = async (entry: Entry) => {
    setSelectedEntryForAction(entry);
    setEditingEntryId(entry.id);
    setSelectedStudent({
      id: entry.studentId,
      firstName: entry.studentName.split(' ')[0],
      lastName: entry.studentName.split(' ')[1],
    });
    setCheckInTime(new Date(moment(entry.timeIn, 'h:mm:ss a').toISOString()));
    setCheckOutTime(!entry.timeOut ? undefined : new Date(moment(entry.timeOut, 'h:mm:ss a').toISOString()));
    setFormOpen(true);
    setError(null);
    setActionsMenuVisible(false);
  };

  const handleDelete = async (entry: Entry) => {
    setSelectedEntryForAction(entry);
    setEntryToDelete(entry);
    setDeleteModalVisible(true);
    setActionsMenuVisible(false);
  };

  const confirmDelete = async () => {
    const userAndLabLoaded = await fetchUserAndLabId();
    if (!userAndLabLoaded) return;

    if (entryToDelete) {
      try {
        await LogService.deleteLog(Number(entryToDelete.id), user?.userId ?? 0);
        setEntries((prevEntries) => prevEntries.filter(entry => entry.id !== entryToDelete.id));
      } catch (error) {
        console.error('Failed to delete log:', error);
      } finally {
        setDeleteModalVisible(false);
        setEntryToDelete(null);
      }
    }
  };

  const handleClockOut = async (id: string) => {
    const userAndLabLoaded = await fetchUserAndLabId();
    if (!userAndLabLoaded) return;

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

  const filterEntries = (entries: Entry[]) => {
    if (selectedFilter === 'Not Checked Out') {
      return entries.filter(entry => !entry.timeOut);
    } else if (selectedFilter === 'Checked Out') {
      return entries.filter(entry => entry.timeOut);
    }
    return entries; // Default to 'All'
  };

  const openActionsMenu = (entry: Entry) => {
    setHighlightedItemId(entry.id);
    setSelectedEntryForAction(entry);
    setActionsMenuVisible(true);
  };

  if (!user) return null;

  const actionButtons = [
    {
      name: 'Edit',
      icon: require('../../../assets/edit.png'),
      onPress: () => handleEdit(selectedEntryForAction!),
    },
    {
      name: 'Delete',
      icon: require('../../../assets/trash.png'),
      onPress: () => handleDelete(selectedEntryForAction!),
    },
    {
      name: 'Time Out',
      icon: require('../../../assets/time.png'),
      onPress: () => handleClockOut(selectedEntryForAction!.id),
      disabled: selectedEntryForAction?.timeOut !== null, // Disable if already timed out
    },
  ];

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
        readOnly={true}
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
      color="#FFC107"
    />,
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome, {user.fName}</Text>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.addButton} onPress={() => setFormOpen(true)}>
          <Text style={styles.addButtonText}>Log new student</Text>
        </TouchableOpacity>
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by Status:</Text>
          <Picker
            selectedValue={selectedFilter}
            style={styles.filterPicker}
            onValueChange={(itemValue) => setSelectedFilter(itemValue)}
          >
            <Picker.Item label="All" value="All" />
            <Picker.Item label="Not Checked Out" value="Not Checked Out" />
            <Picker.Item label="Checked Out" value="Checked Out" />
          </Picker>
        </View>
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, styles.tableHeaderStudentId]}>Student ID</Text>
        <Text style={[styles.tableHeaderText, styles.tableHeaderStudentName]}>Student Name</Text>
        <Text style={[styles.tableHeaderText, styles.tableHeaderTime]}>Time In</Text>
        <Text style={[styles.tableHeaderText, styles.tableHeaderTime]}>Time Out</Text>
        {isWideScreen && <Text style={[styles.tableHeaderText, styles.tableHeaderActions]}>Actions</Text>}
      </View>

      {entries.length === 0 ? (
        <Text style={styles.noLogsText}>No logs for today!</Text>
      ) : (
        <FlatList
          data={filterEntries(entries)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => openActionsMenu(item)}
              style={[
                styles.entryRow,
                highlightedItemId === item.id && styles.highlightedRow,
              ]}
            >
              <View style={[styles.tableCell, styles.tableCellStudentId]}>
                <Text style={styles.cellText}>{item.studentId}</Text>
              </View>
              <View style={[styles.tableCell, styles.tableCellStudentName]}>
                <Text style={styles.cellText}>{item.studentName}</Text>
              </View>
              <View style={[styles.tableCell, styles.tableCellTime]}>
                <Text style={styles.cellText}>{item.timeIn}</Text>
              </View>
              <View style={[styles.tableCell, styles.tableCellTime]}>
                {item.timeOut ? (
                  <Text style={styles.cellText}>{item.timeOut}</Text>
                ) : (
                  <TouchableOpacity onPress={() => handleClockOut(item.id)} style={styles.clockButton}>
                    <Image source={require('../../../assets/time.png')} style={styles.iconImage} />
                  </TouchableOpacity>
                )}
              </View>
              {isWideScreen && (
                <View style={[styles.tableCellActions, styles.tableCell]}>
                  <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
                    <Image source={require('../../../assets/edit.png')} style={styles.iconImage} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionButton}>
                    <Image source={require('../../../assets/trash.png')} style={styles.iconImage} />
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
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

      <ActionsModal
        visible={isActionsMenuVisible}
        onClose={() => setActionsMenuVisible(false)}
        actionButtons={actionButtons.filter(button => !(button.name === 'Time Out' && selectedEntryForAction?.timeOut !== null))}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#ffc107',
    padding: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  filterPicker: {
    width: 200,
    height: 40,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#f8f8f8',
  },
  tableHeaderText: {
    fontWeight: 'bold',
    textAlign: 'left', 
    paddingHorizontal: 10,
  },
  tableHeaderStudentId: {
    flex: 1, // Fixed size for student ID, as it is always 8 characters
  },
  tableHeaderStudentName: {
    flex: 3, // More space for the student name
  },
  tableHeaderTime: {
    flex: 1.5, // Time columns have smaller width
  },
  tableHeaderActions: {
    flex: 1.5, // Similar width as the time columns for actions
  },
  noLogsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  entryRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  highlightedRow: {
    backgroundColor: '#e0e0e0',
  },
  tableCell: {
    justifyContent: 'center',
    alignItems: 'flex-start', 
    paddingHorizontal: 10,
  },
  tableCellStudentId: {
    flex: 1,
  },
  tableCellStudentName: {
    flex: 3,
  },
  tableCellTime: {
    flex: 1.5,
  },
  tableCellActions: {
    flex: 1.5,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  cellText: {
    textAlign: 'left',
  },
  actionButton: {
    paddingHorizontal: 5, 
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
  iconButton: {},
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
