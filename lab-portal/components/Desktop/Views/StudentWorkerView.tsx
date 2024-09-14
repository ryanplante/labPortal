import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Image, Button, Picker, Dimensions } from 'react-native';
import moment from 'moment-timezone';
import UserSearcher from '../../Modals/UserSearcher';
import DynamicForm from '../../Modals/DynamicForm';
import PlatformSpecificTimePicker from '../../Modals/PlatformSpecificTimePicker';
import { checkHeartbeat, deleteToken, getUserByToken } from '../../../services/loginService';
import LogService, { LogEntry, CreatedLog } from '../../../services/logService';
import ScheduleService from '../../../services/scheduleService';
import ItemService from '../../../services/itemService';
import { User } from '../../../services/userService';
import ConfirmationModal from '../../Modals/ConfirmationModal';
import ActionsModal from '../../Modals/ActionsModal';
import { crossPlatformAlert, reload } from '../../../services/helpers';
import { useNavigation } from '@react-navigation/native';
import ItemSearcher from '../../Modals/ItemSearcher';
import PasswordModal from '../../Modals/PasswordModal';

// Types for entry and any other 
type Entry = {
  id: string;
  studentId: string;
  studentName: string;
  timeIn: string;
  timeOut: string | null;
  itemId: string | null
  itemDescription: string | null; // Add item description field
  Scanned: boolean
};

const StudentWorkerView = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedView, setSelectedView] = useState<string>('Logs');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [isFormOpen, setFormOpen] = useState<boolean>(false);
  const [isStudentSearcherOpen, setStudentSearcherOpen] = useState(false);
  const [isItemSearcherOpen, setItemSearcherOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<{ id: string, firstName: string, lastName: string }>({ id: '', firstName: '', lastName: '' });
  const [selectedItem, setSelectedItem] = useState<{ id: string, itemName: string, serialNo: string }>({ id: '', itemName: '', serialNo: '' });
  const [checkInTime, setCheckInTime] = useState<Date>(new Date());
  const [checkOutTime, setCheckOutTime] = useState<Date | undefined>(undefined);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [labId, setLabId] = useState<number | null>(null);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [entryToDelete, setEntryToDelete] = useState<Entry | null>(null);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const [isActionsMenuVisible, setActionsMenuVisible] = useState<boolean>(false);
  const [selectedEntryForAction, setSelectedEntryForAction] = useState<Entry | null>(null);
  const [readonly, setReadOnly] = useState<boolean>(true);
  const navigation = useNavigation();

  const screenWidth = Dimensions.get('window').width;
  const [currentScreenWidth, setCurrentScreenWidth] = useState<number>(screenWidth);
  const isWideScreen = currentScreenWidth >= 700;
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [isScanned, setScanned] = useState<boolean | null>(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('Students');
  const [hideTab, setHideTab] = useState<boolean[]>([false, false]); // [Hide Student Tab, Hide Item Tab]




  // Fetch user and lab ID on component mount and whenever dimensions change
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

  // Hook to re-fetch logs when the filter changes
  useEffect(() => {
    if (labId) {
      fetchLogsForToday(labId); // Re-fetch logs based on the selectedTypeFilter
    }
  }, [selectedTypeFilter, labId]);


  // Fetch user and lab data, and load logs for today if the lab ID is valid
  const fetchUserAndLabId = async (): Promise<boolean> => {
    try {
      const fetchedUser = await getUserByToken();
      if (fetchedUser.privLvl === 0) {
        crossPlatformAlert('Error', 'You do not have the privilege to view this page.');
        return false;
      }
      setUser(fetchedUser);
      const labId = 1//await ScheduleService.getCurrentLabForUser(fetchedUser.userId);
      if (labId == 0) { // Don't remove this, this is hack to bypass readonly for now
        setReadOnly(true); // Enable buttons if everything is fine
        // Show a modal for handling schedule exemption if labId is 0
        setConfirmationModalVisible(true);
      } else {
        setLabId(labId);
        setReadOnly(false); // Enable buttons if everything is fine
        await fetchLogsForToday(labId);
      }
      return true;
    } catch (error: any) {
      const errorMessage = error.message.includes('server')
        ? 'Server is currently down. Please try again later.'
        : error.message;
      crossPlatformAlert('Error', errorMessage);
      await deleteToken();
      await reload();
      return false;
    }
  };

  // Fetch logs for the current day based on the lab ID
  const fetchLogsForToday = async (labId: number) => {
    try {
      const startDate = moment().startOf('day').utc().format();
      const endDate = moment().endOf('day').utc().format();
      const logs: LogEntry[] = await LogService.getLogsByLab(labId, startDate, endDate);

      const formattedLogs: Entry[] = await Promise.all(
        logs.map(async (log) => {
          let itemDescription = null;

          if (log.itemId) {
            try {
              const item = await ItemService.getItemById(Number(log.itemId));
              itemDescription = item.description;
            } catch (error) {
              console.error('Error fetching item description:', error);
            }
          }

          return {
            id: log.id.toString(),
            studentId: log.studentId.toString().padStart(8, '0'),
            studentName: log.studentName,
            timeIn: moment(log.timeIn).format('h:mm:ss a'),
            timeOut: log.timeOut ? moment(log.timeOut).format('h:mm:ss a') : null,
            itemId: log.itemId,
            itemDescription, // Add item description here
            Scanned: log.Scanned,
          };
        })
      );

      setEntries(formattedLogs);
    } catch (error) {
      console.error('Failed to fetch logs for today:', error);
    }
  };



  // Handle student selection from the searcher modal
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

  const handleItemSelect = async (item: { itemId: string, description: string, serialNum: string }) => {
    const userAndLabLoaded = await fetchUserAndLabId();
    if (!userAndLabLoaded) return;

    setSelectedItem({
      id: item.itemId, // Correct key to match your state
      itemName: item.description,
      serialNo: item.serialNum,
    });
    setError(null);
    setItemSearcherOpen(false);
  };





  // Validate times for the check-in and check-out fields
  const validateTimes = (): boolean => {
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

  // Handle log creation and update
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
        itemId: selectedItem.id ? selectedItem.id.toString() : null, // Add selected item to the log
        Scanned: false
      };

      if (editingEntryId) {
        // Update log if editing
        await LogService.updateLog(Number(editingEntryId), {
          studentId: Number(selectedStudent.id),
          timein: moment(checkInTime).toISOString(),
          timeout: checkOutTime ? moment(checkOutTime).toISOString() : '',
          labId: labId ?? 1,
          monitorId: user?.userId ?? 0,
          itemId: selectedItem.id ? selectedItem.id.toString() : null, // Add item to the update
          Scanned: false
        });
      } else {
        // Create new log entry if not editing
        const createdLog: CreatedLog = await LogService.createLog({
          studentId: Number(selectedStudent.id),
          timein: moment(checkInTime).toISOString(),
          timeout: checkOutTime ? moment(checkOutTime).toISOString() : '',
          labId: labId ?? 1,
          monitorId: user?.userId ?? 0,
          itemId: selectedItem.id ? selectedItem.id.toString() : null, // Add item to the creation
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


  // Handle editing of an entry
  const handleEdit = async (entry: Entry) => {
    setSelectedEntryForAction(entry);
    setEditingEntryId(entry.id);

    // Check if the entry is a student (itemDescription is null)
    const isStudent = entry.itemDescription === null;

    // Hide the "Item Form" if it's a student and hide the "Student Form" if it's an item
    const hideTab = user?.privLvl === 2
      ? [false, true] // Hide the "Item Form" for privLvl 2
      : [!isStudent, isStudent]; // Hide based on the entry type

    setHideTab(hideTab);

    // Set selected student details
    setSelectedStudent({
      id: entry.studentId,
      firstName: entry.studentName.split(' ')[0],
      lastName: entry.studentName.split(' ')[1],
    });

    // Fetch item details if an itemId exists
    if (entry.itemId) {
      try {
        const item = await ItemService.getItemById(Number(entry.itemId));
        setSelectedItem({
          id: item.itemId.toString(),
          itemName: item.description,
          serialNo: item.serialNum,
        });
      } catch (error) {
        console.error('Error fetching item details:', error);
        setError('Failed to fetch item details');
      }
    } else {
      // Clear the item details if no itemId exists
      setSelectedItem({ id: '', itemName: '', serialNo: '' });
    }

    // Set check-in and check-out times
    setCheckInTime(new Date(moment(entry.timeIn, 'h:mm:ss a').toISOString()));
    setCheckOutTime(entry.timeOut ? new Date(moment(entry.timeOut, 'h:mm:ss a').toISOString()) : undefined);

    // Open the form modal
    setFormOpen(true);
    setError(null);
    setActionsMenuVisible(false);
  };



  // Handle the deletion of a log entry
  const handleDelete = async (entry: Entry) => {
    setSelectedEntryForAction(entry);
    setEntryToDelete(entry);
    setDeleteModalVisible(true);
    setActionsMenuVisible(false);
  };

  // Confirm and execute deletion of an entry
  const confirmDelete = async () => {
    const userAndLabLoaded = await fetchUserAndLabId();
    if (!userAndLabLoaded) return;

    if (entryToDelete) {
      try {
        await LogService.deleteLog(Number(entryToDelete.id), user?.userId ?? 0);
        setEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== entryToDelete.id));
      } catch (error) {
        console.error('Failed to delete log:', error);
      } finally {
        setDeleteModalVisible(false);
        setEntryToDelete(null);
      }
    }
  };

  // Handle clock-out action for a log entry
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

  // Reset form fields to initial state
  const resetForm = () => {
    setSelectedStudent({ id: '', firstName: '', lastName: '' });
    setCheckInTime(new Date());
    setCheckOutTime(undefined);
    setEditingEntryId(null);
    setError(null);
  };

  // Filter entries based on the selected type filter and status filter
  const filterEntries = (entries: Entry[]): Entry[] => {
    let filteredEntries = entries;

    // Filter by selectedTypeFilter (Students or Items)
    console.log(filteredEntries);
    if (selectedTypeFilter === 'Students') {
      filteredEntries = filteredEntries.filter((entry) => entry.itemDescription === null);
    } else if (selectedTypeFilter === 'Items') {
      filteredEntries = filteredEntries.filter((entry) => entry.itemDescription !== null);
    }

    // Further filter by status (Checked Out or Not Checked Out)
    if (selectedFilter === 'Not Checked Out') {
      return filteredEntries.filter((entry) => !entry.timeOut);
    } else if (selectedFilter === 'Checked Out') {
      return filteredEntries.filter((entry) => entry.timeOut);
    }

    return filteredEntries; // Default to return all filtered entries
  };


  // Open the actions menu for the selected entry
  const openActionsMenu = (entry: Entry) => {
    if (readonly)
      return;
    setHighlightedItemId(entry.id);
    setSelectedEntryForAction(entry);
    setActionsMenuVisible(true);
  };

  // Modal to show when working outside of schedule
  const [isConfirmationModalVisible, setConfirmationModalVisible] = useState<boolean>(false);

  const handleNavigateToSchedule = () => {
    setConfirmationModalVisible(false);
    navigation.navigate("Schedule");
  };

  const handleCloseConfirmation = () => {
    setConfirmationModalVisible(false);
  };


  const handlePasswordSubmit = (isValid: boolean) => {
    setError(null);
    setPasswordModalVisible(false); // Close password modal
    if (isValid) {
      setItemSearcherOpen(true); // If password is valid, open the item search modal
    } else {
      setError('Password verification failed'); // Show error if invalid
    }
  };



  // Ensure user is loaded before rendering anything
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
    <View style={styles.inputContainer} key="studentContainer">
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

  const itemPickerComponent = [
    <View style={styles.inputContainer} key="itemContainer">
      <Text style={[styles.label, !selectedItem.id && error ? styles.errorText : null]}>
        Item ID{!selectedItem.id && error ? '*' : ''}
      </Text>
      <TextInput
        key="itemId"
        style={styles.readOnlyInput}
        placeholder="Item ID"
        value={selectedItem.id ? selectedItem.id.toString() : ''}
        editable={false}
      />
      <TouchableOpacity
        key="searchButton"
        style={styles.iconButton}
        onPress={() => setPasswordModalVisible(true)}
      >
        <Image source={require('../../../assets/search-button.png')} style={styles.searchIcon} />
      </TouchableOpacity>
    </View>,
    <Text style={[styles.label, !selectedItem.id && error ? styles.errorText : null]}>
      Item Description{!selectedItem.id && error ? '*' : ''}
    </Text>,
    <TextInput
      key="itemDescription"
      style={styles.readOnlyInput}
      placeholder="Item Description"
      value={selectedItem.itemName || ''}  // Use itemName instead of description
      editable={false}
    />,
    <Text style={[styles.label, !selectedItem.id && error ? styles.errorText : null]}>
      Serial Number{!selectedItem.id && error ? '*' : ''}
    </Text>,
    <TextInput
      key="serialNumber"
      style={styles.readOnlyInput}
      placeholder="Serial Number"
      value={selectedItem.serialNo || ''}  // Use serialNo instead of serialNum
      editable={false}
    />,
  ];

  const handleAddPressed = () => {
    // Clear the form states
    setSelectedStudent({ id: '', firstName: '', lastName: '' });
    setSelectedItem({ id: '', itemName: '', serialNo: '' });
    setCheckInTime(new Date());
    setCheckOutTime(undefined);
    setError(null); // Clear any errors
    setEditingEntryId(null); // Reset the editing ID

    // Update hideTab based on user's privilege level
    if (user.privLvl === 2) {
      // For privLvl 2, hide the Item Form
      setHideTab([false, true]);
    } else {
      // For other users, show both tabs
      setHideTab([false, false]);
    }

    // Show the DynamicForm by opening the modal
    setFormOpen(true);
  };




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
    <TouchableOpacity
      key="updateAdd"
      onPress={handleCheckIn}
      style={[styles.addButton, readonly && styles.disabledButton]}  // Apply disabled style
      disabled={readonly}  // Disable button when readonly is true
    >
      <Text style={styles.addButtonText}>{editingEntryId ? "Update" : "Add"}</Text>
    </TouchableOpacity>
  ];


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome, {user.fName}</Text>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={[styles.addButton, readonly && styles.disabledButton]}
          onPress={handleAddPressed}
          disabled={readonly}
        >
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

        {/* Conditionally show "Filter by Type" if privLvl is not 2 */}
        {user && user.privLvl !== 2 && (
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Filter by Type:</Text>
            <Picker
              selectedValue={selectedTypeFilter}
              style={styles.filterPicker}
              onValueChange={(itemValue) => setSelectedTypeFilter(itemValue)}
            >
              <Picker.Item label="Students" value="Students" />
              <Picker.Item label="Items" value="Items" />
            </Picker>
          </View>
        )}


      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, styles.tableHeaderStudentId]}>Student ID</Text>
        <Text style={[styles.tableHeaderText, styles.tableHeaderStudentName]}>Student Name</Text>
        <Text style={[styles.tableHeaderText, styles.tableHeaderTime]}>Time In</Text>
        <Text style={[styles.tableHeaderText, styles.tableHeaderTime]}>Time Out</Text>

        {/* Conditionally render "Item Description" header based on selectedTypeFilter */}
        {selectedTypeFilter === 'Items' && (
          <Text style={[styles.tableHeaderText, styles.tableHeaderItem]}>Item Description</Text>
        )}

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
                  <TouchableOpacity onPress={() => handleClockOut(item.id)} style={styles.iconImage}>
                    <Image source={require('../../../assets/time.png')} style={styles.iconImage} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Conditionally show the "Item" description based on selectedTypeFilter */}
              {selectedTypeFilter === 'Items' && (
                <View style={[styles.tableCell, styles.tableCellItem]}>
                  <Text style={styles.cellText}>
                    {item.itemDescription ? item.itemDescription : 'No Item'}
                  </Text>
                </View>
              )}

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
        components={[
          [
            isStudentSearcherOpen
              ? <UserSearcher key="studentSearcher" onSelect={handleStudentSelect} onBackPress={() => setStudentSearcherOpen(false)} isTeacher={null} />
              : [...studentPickerComponent, ...timePickerComponent, ...addButtonComponent]
          ],
          [
            isItemSearcherOpen
              ? <ItemSearcher key="itemSearcher" onSelect={handleItemSelect} onBackPress={() => setItemSearcherOpen(false)} labId={labId} />
              : [...itemPickerComponent, ...studentPickerComponent, ...timePickerComponent, ...addButtonComponent]
          ]
        ]}
        tabs={['Student Form', 'Item Form']} // Define the tab titles
        activeTabIndex={0} // Start with the first tab active
        error={error}
        isSearcherOpen={isItemSearcherOpen || isStudentSearcherOpen}
        hideTab={hideTab} // Pass the hideTab state here
      />




      <ConfirmationModal
        visible={isDeleteModalVisible}
        title={"Confirm Deletion"}
        description={"Are you sure you want to delete this entry? This action cannot be undone."}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        type="yesNoDanger"
      />

      <ConfirmationModal
        visible={isConfirmationModalVisible}
        title={"Working Outside Schedule"}
        description={"Currently working outside of schedule.\nLogging will be disabled unless you request a schedule exemption. Would you like to go to the schedule screen?"}
        onConfirm={handleNavigateToSchedule}
        onCancel={handleCloseConfirmation}
        type="yesNo"
      />

      <ActionsModal
        visible={isActionsMenuVisible}
        onClose={() => setActionsMenuVisible(false)}
        actionButtons={actionButtons.filter(button => !(button.name === 'Time Out' && selectedEntryForAction?.timeOut !== null))}
      />

      <PasswordModal
        visible={isPasswordModalVisible}
        onClose={handlePasswordSubmit} // Handle the password result
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
    flex: 1,
  },
  tableHeaderStudentName: {
    flex: 3,
  },
  tableHeaderTime: {
    flex: 1.5,
  },
  tableHeaderActions: {
    flex: 1.5,
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
    backgroundColor: '#eeeeee',
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
  disabledButton: {
    backgroundColor: '#cccccc',  // Gray out the button when disabled
  },
});

export default StudentWorkerView;