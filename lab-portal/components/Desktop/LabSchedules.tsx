import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, ScrollView, TouchableOpacity, Modal } from 'react-native';
import ScheduleService from '../../services/scheduleService';
import { deleteToken, getUserByToken } from '../../services/loginService';
import moment from 'moment';
import DynamicForm from '../Modals/DynamicForm';
import UserPicker from '../Modals/UserPicker';
import PlatformSpecificTimePicker from '../Modals/PlatformSpecificTimePicker';
import LabPicker from '../LabPicker';
import { Picker } from '@react-native-picker/picker';
import { Checkbox } from 'expo-checkbox';
import PlatformSpecificDateTimePicker from '../Modals/PlatformSpecificDateTimePicker';
import { User } from '../../services/userService';
import { crossPlatformAlert, reload } from '../../services/helpers';

const LabSchedules = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [scheduleExemptions, setScheduleExemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(moment().startOf('week').add(1, 'days')); // Starts the week on Monday
  const [weekNumber, setWeekNumber] = useState(moment().week()); // Week number tracker
  const [selectedSchedule, setSelectedSchedule] = useState(null); // For editing a schedule/exemption
  const [isFormOpen, setIsFormOpen] = useState(false); // Toggles form visibility
  const [formMode, setFormMode] = useState(''); // Mode: 'work' or 'exemption'
  const [selectedUser, setSelectedUser] = useState<number | undefined>(undefined); // Selected user ID
  const [selectedLab, setSelectedLab] = useState<number | undefined>(undefined); // Selected lab ID
  const [timeIn, setTimeIn] = useState(new Date()); // Time in
  const [timeOut, setTimeOut] = useState(new Date()); // Time out
  const [datetimeIn, setDatetimeIn] = useState(new Date()); // Initialized as local time
  const [datetimeOut, setDatetimeOut] = useState(new Date());
  const [dayOfWeek, setDayOfWeek] = useState(0); // Day of the week (Mon-Fri)
  const [exemptionType, setExemptionType] = useState(1); // Exemption type
  const [verified, setVerified] = useState(false); // Verification checkbox
  const [formError, setFormError] = useState<string | null>(null); // State for error message
  const [isTimePickerReadOnly, setIsTimePickerReadOnly] = useState([true, true]); // State for setting time pickers readonly status
  const [user, setUser] = useState<User | null>(null);
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    fetchSchedules();
  }, [currentWeek]);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true); // Show loading spinner
      const user = await getUserByToken(); // Get user token
      const departmentId = user.userDept;
      const startDate = currentWeek.format('YYYY-MM-DD');
      const endDate = currentWeek.clone().add(5, 'days').format('YYYY-MM-DD');

      // Fetch schedules by department and date range
      const data = await ScheduleService.getWorkScheduleByDepartment(departmentId, startDate, endDate);
      const exemptions = await ScheduleService.getScheduleExemptions();
      console.log('Schedules:', data, 'Exemptions:', exemptions); // Debugging output
      setScheduleExemptions(exemptions.$values); // Store exemptions in state
      setScheduleData(data.$values ?? exemptions);
    } catch (error) {
      console.error('Error fetching schedule data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async() => {
    try {
      setLoading(true);
      const user = await getUserByToken();
      setUser(user)
    }
    catch (error) {
        const errorMessage = error.message.includes('server')
          ? 'Server is currently down. Please try again later.'
          : 'Token has expired, please refresh the app and re-login to continue.';
        crossPlatformAlert('Error', errorMessage);
        await deleteToken();
        await reload();
        return false;      
    }
    if (user.privLvl === 0) {
      crossPlatformAlert('Error', 'You do not have the privilege to view this page.');
      return false;
    }
  }

  const isExemption = (scheduleId) => {
    // Find matching exemption by scheduleId
    if (scheduleExemptions) {
      const exemption = scheduleExemptions.find(exemption => exemption.scheduleExemptionId === scheduleId);
      return exemption
    }
    return null;
  };

  const renderVerificationStatus = (scheduleId) => {
    const exemption = isExemption(scheduleId);

    if (exemption) {
      if (exemption.verified) {
        return null; // No indicator if verified
      } else {
        return <Text style={{ color: 'red', fontWeight: 'bold' }}>!</Text>; // Red exclamation mark if not verified
      }
    }
    return null; // Not an exemption
  };


  const handleNextWeek = () => {
    setCurrentWeek(currentWeek.clone().add(1, 'week'));
    setWeekNumber(weekNumber + 1);
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(currentWeek.clone().subtract(1, 'week'));
    setWeekNumber(weekNumber - 1);
  };

  const groupByDay = (data, dayIndex) => data.filter((entry) => entry.dayOfWeek === dayIndex);

  const formatHours = (hours) => {
    if (hours === 'Off') return 'Off';
    const [start, end] = hours.split('-');
    const startTime = moment(start, 'HH:mm').format('h:mm A');
    const endTime = moment(end, 'HH:mm').format('h:mm A');
    return `${startTime} - ${endTime}`;
  };

  const getScheduleStyle = (type) => {
    switch (type) {
      case 'Work':
        return styles.work;
      case 'School':
        return styles.school;
      case 'Off':
        return styles.off;
      case 'Working in new room':
        return styles.workingInNewRoom;
      case 'Working outside of schedule':
        return styles.workingOutsideOfSchedule;
      case 'Late':
        return styles.late;
      case 'Calling out':
        return styles.callingOut;
      default:
        return styles.defaultType;
    }
  };

  const handleScheduleClick = async (scheduleId, scheduleType) => {
    try {
      let scheduleInfo;
      if (scheduleType.includes('School', 'Off') || scheduleType == undefined) {
        return; // Prevent clicking on off/school schedules
      }

      if (scheduleType === 'Work') {
        scheduleInfo = await ScheduleService.getScheduleById(scheduleId);
        setSelectedSchedule(scheduleInfo);

        setSelectedUser(scheduleInfo.userId);
        setSelectedLab(scheduleInfo.fkLab);

        // Calculate the date based on currentWeek and dayOfWeek, this is used to populate schedule exemptions with the schedule's date of the selected week
        const calculatedInDate = moment(currentWeek)
          .day(scheduleInfo.dayOfWeek + 1) // Set the correct day of the week
          .set({
            hour: moment(scheduleInfo.timeIn, 'HH:mm').hours(),
            minute: moment(scheduleInfo.timeIn, 'HH:mm').minutes(),
          });

        const calculatedOutDate = moment(currentWeek)
          .day(scheduleInfo.dayOfWeek) // Set the correct day of the week
          .set({
            hour: moment(scheduleInfo.timeOut, 'HH:mm').hours(),
            minute: moment(scheduleInfo.timeOut, 'HH:mm').minutes(),
          });

        // Set DateTimeIn and DateTimeOut
        setDatetimeIn(calculatedInDate.toDate());
        setDatetimeOut(calculatedOutDate.toDate());
        setTimeIn(moment(scheduleInfo.timeIn, 'HH:mm').toDate());
        setTimeOut(moment(scheduleInfo.timeOut, 'HH:mm').toDate());
        setDayOfWeek(scheduleInfo.dayOfWeek);
        setFormMode('scheduleOptions');
      }
      else {
        scheduleInfo = await ScheduleService.getScheduleExemptionById(scheduleId);
        setSelectedSchedule(scheduleInfo);
        // if the schedule has a fk reference to the table, set the time in and time out values so that the exemption can check if its in the time in and time out bounds
        if (scheduleInfo.fkSchedule) {
          const parentSchedule = await ScheduleService.getScheduleById(scheduleInfo.fkSchedule);
          setTimeIn(moment(parentSchedule.timeIn, 'HH:mm').toDate());
          setTimeOut(moment(parentSchedule.timeOut, 'HH:mm').toDate());
          setDayOfWeek(parentSchedule.dayOfWeek);
        }
        // Handle startDate and endDate as local time
        setDatetimeIn(moment(scheduleInfo.startDate).toDate());
        setDatetimeOut(moment(scheduleInfo.endDate).toDate());

        handleExemptionTypeChange(scheduleInfo.fkExemptionType);
        setVerified(scheduleInfo.verified);
        setSelectedUser(scheduleInfo.fkUser);
        setSelectedLab(scheduleInfo.fkLab);
        setFormMode('exemption');
      }

      setIsFormOpen(true);
    } catch (error) {
      console.error('Error fetching schedule details:', error);
    }
  };

  const checkDateBounds = () => {
    // Check to make sure the exemption is within the schedule if they're updating/creating an exemption

    // Ensure the day of the week is between Monday (1) and Friday (5)
    console.log(moment(datetimeIn).isoWeekday())
    if (moment(datetimeIn).isoWeekday() > 5) {
      setFormError("You must select a workday (Monday to Friday)!");
      return false;
    }
    // Special case for exemptionType 4: Ensure start and end times are not identical
    if (moment(datetimeIn).isSame(moment(datetimeOut))) {
      setFormError("Start time and end time cannot be the same!");
      return false;
    }
    // Ensure datetimeIn and datetimeOut are on the same day
    if (!moment(datetimeIn).isSame(datetimeOut, 'day')) {
      setFormError("Start time and end time must be on the same day!");
      return false;
    }

    if (exemptionType != 4) {
      const calculatedInDate = moment(currentWeek)
        .day(dayOfWeek + 1) // Set the correct day of the week
        .set({
          hour: moment(timeIn, 'HH:mm').hours(),
          minute: moment(timeIn, 'HH:mm').minutes(),
        });

      const calculatedOutDate = moment(currentWeek)
        .day(dayOfWeek + 1) // Set the correct day of the week
        .set({
          hour: moment(timeOut, 'HH:mm').hours(),
          minute: moment(timeOut, 'HH:mm').minutes(),
        });

      // Ensure datetimeIn is after the start of the schedule
      if (moment(datetimeIn).isBefore(calculatedInDate)) {
        setFormError("Start time cannot be before schedule start time!");
        return false;
      }

      // Ensure datetimeOut is before the end of the schedule
      if (moment(datetimeOut).isAfter(calculatedOutDate)) {
        setFormError("End time cannot be after schedule end time!");
        return false;
      }

      return true;
    }
    return true;
  }


  const checkErrors = () => {
    let error = '';
    if (!selectedUser || isNaN(selectedUser)) {
      error = error + "Please select a user\n";
    }
    if (!selectedLab || isNaN(selectedLab)) {
      error = error + "Please select a lab\n";
    }

    if (error !== "") {
      setFormError(error);
      return true
    }
    return false;

  }

  const handleFormSubmit = async () => {
    try {
      let check, formData, collisionResult;
      setFormError(null);
      if (checkErrors())
        return;
      // Handle 'work' schedule case
      if (formMode === 'work') {
        check = {
          userId: selectedUser,
          fkLab: selectedLab,
          timeIn: moment(timeIn).format('HH:mm'), // Convert date object to 'HH:mm' format
          timeOut: moment(timeOut).format('HH:mm'), // Convert date object to 'HH:mm' format
          dayOfWeek,
          weekNumber,
          pkLog: selectedSchedule ? selectedSchedule.scheduleId : null, // If updating, pass scheduleId, otherwise null for new schedules
        };

        formData = {
          userId: selectedUser,
          fkLab: selectedLab,
          // No UTC conversion, save time in local time format
          timeIn: moment(timeIn).format('HH:mm'),
          timeOut: moment(timeOut).format('HH:mm'),
          dayOfWeek,
          fkScheduleType: 1,
          location: null,
        };

        collisionResult = await ScheduleService.checkScheduleCollision(check);
        console.log(collisionResult, collisionResult.length);
        if (collisionResult && collisionResult[0] !== "No schedule conflicts") {
          setFormError(`Schedule conflict detected:\n${collisionResult.join('\n')}`);
          return;
        }

        if (selectedSchedule) {
          await ScheduleService.updateSchedule(selectedSchedule.scheduleId, formData);
        } else {
          await ScheduleService.createSchedule(formData);
        }

        // Handle 'exemption' case
      } else if (formMode.includes('exemption')) {
        const startDate = moment(datetimeIn).format('YYYY-MM-DDTHH:mm:ss'); // Format start date as local time
        const endDate = moment(datetimeOut).format('YYYY-MM-DDTHH:mm:ss');   // Format end date as local time

        const fkSchedule = selectedSchedule ? (selectedSchedule.fkSchedule ? selectedSchedule.fkSchedule : selectedSchedule.scheduleId) : null;

        const exemptionData = {
          startDate,
          endDate,
          fkExemptionType: exemptionType,
          fkUser: selectedUser,
          fkLab: selectedLab,
          verified: verified,
          fkSchedule: fkSchedule,
        };

        // Handle collision check for working outside of schedule
        if (exemptionType == 4) {
          check = {
            userId: selectedUser,
            fkLab: selectedLab,
            timeIn: moment(datetimeIn).format('HH:mm'), // Convert date to 'HH:mm'
            timeOut: moment(datetimeOut).format('HH:mm'), // Convert date to 'HH:mm'
            dayOfWeek: moment(datetimeIn).day() - 1, // -1 since moment uses Sunday as the start day
            weekNumber: moment(datetimeIn).week(),
            pkLog: selectedSchedule ? selectedSchedule.scheduleId : null, // Include scheduleId if updating
          };

          collisionResult = await ScheduleService.checkScheduleCollision(check);
          console.log(collisionResult, collisionResult.length);
          if (collisionResult && collisionResult[0] !== "No schedule conflicts") {
            setFormError(`Schedule conflict detected:\n${collisionResult.join('\n')}`);
            return;
          }
        }
        if (!checkDateBounds()) {
          return;
        }
        // Update or create exemption
        if (selectedSchedule && !formMode.includes('schedule')) {
          await ScheduleService.updateScheduleExemption(selectedSchedule.scheduleExemptionId, exemptionData);
        } else {
          await ScheduleService.createScheduleExemption(exemptionData);
        }
      }
      // Close form and refresh schedules after submission
      setIsFormOpen(false);
      await fetchSchedules(); // Refresh schedules
    } catch (error) {
      setFormError('Error submitting form');
      console.error('Error submitting form:', error);
    }
  };

  // Adding a delete action
  const handleDelete = async () => {
    try {
      if (formMode === 'work' && selectedSchedule) {
        await ScheduleService.deleteSchedule(selectedSchedule.scheduleId);
      } else if (formMode === 'exemption' && selectedSchedule) {
        await ScheduleService.deleteScheduleExemption(selectedSchedule.scheduleExemptionId);
      }
      handleCloseForm();
      await fetchSchedules(); // Refresh after deleting
    } catch (error) {
      console.error('Error deleting schedule or exemption:', error);
    }
  };

  const handleExemptionTypeChange = (value) => {
    setExemptionType(value);
    // Calculate the date based on currentWeek and dayOfWeek, this is used to populate schedule exemptions with the schedule's date of the selected week
    const calculatedInDate = moment(currentWeek)
      .day(dayOfWeek + 1) // Set the correct day of the week
      .set({
        hour: moment(timeIn, 'HH:mm').hours(),
        minute: moment(timeOut, 'HH:mm').minutes(),
      });

    const calculatedOutDate = moment(currentWeek)
      .day(dayOfWeek + 1) // Set the correct day of the week
      .set({
        hour: moment(timeOut, 'HH:mm').hours(),
        minute: moment(timeOut, 'HH:mm').minutes(),
      });


    if (value == 1) {
      setDatetimeIn(calculatedInDate.toDate());
      setDatetimeOut(calculatedOutDate.toDate());
    }
    else if (value == 2) {
      setDatetimeIn(calculatedInDate.toDate());
    }
    else if (value == 5) {
      setDatetimeOut(calculatedOutDate.toDate());
    }


    // Use functional update to ensure the new state is set correctly
    setIsTimePickerReadOnly((prevState) => {
      switch (Number(value)) {
        case 1: // Calling out
          return [true, true];
        case 2: // Late
          return [true, false]; 
        case 5: // Leaving early
          return [false, true];
        default:
          return [false, false];
      }
    });
    console.log(isTimePickerReadOnly);
  };



  const getFormComponents = () => {
    let components = [];
    const isUserError = (!selectedUser || isNaN(selectedUser)) && formError && formError.includes('Please select a user');
    console.log(selectedLab);
    const isLabError = (!selectedLab || isNaN(selectedLab)) && formError && formError.includes('Please select a lab');
    if (formMode === 'scheduleOptions') {
      return [
        [
          <TouchableOpacity key="modifySchedule" style={styles.optionButton} onPress={() => setFormMode('work')}>
            <Text style={styles.optionText}>Modify Schedule</Text>
          </TouchableOpacity>,
          <TouchableOpacity key="addExemption" style={styles.optionButton} onPress={() => {
            handleExemptionTypeChange(1);  // Default to "Calling out"
            setVerified(true);     // Set verified to true
            setFormMode('exemption-schedule');
          }}>
            <Text style={styles.optionText}>Add Exemption</Text>
          </TouchableOpacity>,
        ]
      ];
    }
    // If the formMode is for selecting options to add a schedule or exemption
    if (formMode === 'addOptions') {
      return [
        [
          <TouchableOpacity key="addSchedule" style={styles.optionButton} onPress={() => setFormMode('work')}>
            <Text style={styles.optionText}>Add New Schedule</Text>
          </TouchableOpacity>,
          <TouchableOpacity key="addExemption" style={styles.optionButton} onPress={handleAddExemption}>
            <Text style={styles.optionText}>Add a Schedule Exemption</Text>
          </TouchableOpacity>,
        ]
      ];
    }
    if (formMode === 'work') {
      components = [
        <View key="userId" style={styles.formGroup}>
          <Text>
            <UserPicker selectedUser={selectedUser} onUserChange={setSelectedUser} />{isUserError && <Text style={styles.errorAsterisk}>*</Text>}
          </Text>
        </View>,
        <View key="lab" style={styles.formGroup}>
          <Text>
            <LabPicker selectedLabId={selectedLab} onLabChange={setSelectedLab} />
            {isLabError && <Text style={styles.errorAsterisk}>*</Text>}
          </Text>
        </View>,
        <View key="timeIn">
          <Text>Time In</Text>
          <PlatformSpecificTimePicker time={timeIn} onTimeChange={setTimeIn} />
        </View>,
        <View key="timeOut">
          <Text>Time Out</Text>
          <PlatformSpecificTimePicker time={timeOut} onTimeChange={setTimeOut} />
        </View>,
        <View key="dayOfWeek">
          <Text>Day of Week</Text>
          <Picker selectedValue={dayOfWeek} onValueChange={setDayOfWeek}>
            {daysOfWeek.map((day, index) => (
              <Picker.Item key={index} label={day} value={index} />
            ))}
          </Picker>
        </View>,
        <Button key="submitButton" title={selectedSchedule ? "Update Schedule" : "Add Schedule"} onPress={handleFormSubmit} />
      ];
    }
    if (formMode.includes('exemption')) {
      if (formMode === 'exemption-schedule') { // Modified form to add exemption from a schedule
        components = [
          <View key="userId" style={styles.formGroup}>
            <Text>
              <UserPicker selectedUser={selectedUser} onUserChange={setSelectedUser} readOnly={true} />
              {isUserError && <Text style={styles.errorAsterisk}>*</Text>}
            </Text>
          </View>,
          <View key="lab" style={styles.formGroup}>
            <Text>
              {isLabError && <Text style={styles.errorAsterisk}>*</Text>}
              <LabPicker selectedLabId={selectedLab} onLabChange={setSelectedLab} readOnly={exemptionType != 3} />
            </Text>
          </View>,
          <View key="startDate">
            <Text>Start Date & Time</Text>
            <PlatformSpecificDateTimePicker
              dateTime={datetimeIn}
              onDateTimeChange={(newDate) => {
                const localDate = moment(newDate).local(); // Ensure it's handled as local time
                setDatetimeIn(localDate.toDate());
              }}
              readOnly={isTimePickerReadOnly[0]}
            />
          </View>,
          <View key="endDate">
            <Text>End Date & Time</Text>
            <PlatformSpecificDateTimePicker
              dateTime={datetimeOut}
              onDateTimeChange={(newDate) => {
                const localDate = moment(newDate).local(); // Ensure it's handled as local time
                setDatetimeOut(localDate.toDate());
              }}
              readOnly={isTimePickerReadOnly[1]}
            />
          </View>,
          <View key="exemptionType">
            <Text>Exemption Type</Text>
            <Picker selectedValue={exemptionType} onValueChange={handleExemptionTypeChange}>
              <Picker.Item label="Calling out" value={1} />
              <Picker.Item label="Late" value={2} />
              <Picker.Item label="Working in new room" value={3} />
              <Picker.Item label="Leaving early" value={5}/>
            </Picker>
          </View>,
          <View key="verified">
            <Text>Verified</Text>
            <Checkbox value={verified} onValueChange={setVerified} color={verified ? '#007BFF' : undefined} />
          </View>,
          <Button key="submitButton" title={"Add Exemption"} onPress={handleFormSubmit} />
        ];
      }

      if (formMode === 'exemption') {
        components = [
          <View key="userId" style={styles.formGroup}>
            <Text>
              <UserPicker selectedUser={selectedUser} onUserChange={setSelectedUser} readOnly={selectedSchedule ? true : false} />
              {isUserError && <Text style={styles.errorAsterisk}>*</Text>}
            </Text>
          </View>,
          <View key="lab" style={styles.formGroup}>
            <Text>
              <LabPicker selectedLabId={selectedLab} onLabChange={setSelectedLab} readOnly={exemptionType != 4} />
              {isLabError && <Text style={styles.errorAsterisk}>*</Text>}
            </Text>
          </View>,
          <View key="startDate">
            <Text>Start Date & Time</Text>
            <PlatformSpecificDateTimePicker
              dateTime={datetimeIn}
              onDateTimeChange={(newDate) => {
                const localDate = moment(newDate).local(); // Ensure it's handled as local time
                setDatetimeIn(localDate.toDate());
              }}
              readOnly={isTimePickerReadOnly[0]}
            />
          </View>,
          <View key="endDate">
            <Text>End Date & Time</Text>
            <PlatformSpecificDateTimePicker
              dateTime={datetimeOut}
              onDateTimeChange={(newDate) => {
                const localDate = moment(newDate).local(); // Ensure it's handled as local time
                setDatetimeOut(localDate.toDate());
              }}
              readOnly={isTimePickerReadOnly[1]}
            />
          </View>,

          <View key="exemptionType">
            {selectedSchedule && (<>
              <Text>Exemption Type</Text>
              <Picker selectedValue={exemptionType} onValueChange={handleExemptionTypeChange} enabled={selectedSchedule ? false : true} >
                <Picker.Item label="Calling out" value={1} />
                <Picker.Item label="Late" value={2} />
                <Picker.Item label="Working in new room" value={3} />
                {selectedSchedule && (
                  <>
                    <Picker.Item label="Working outside of schedule" value={4} />
                  </>

                )}
                <Picker.Item label="Leaving early" value={5}/>
              </Picker>
            </>)}
          </View>,
          <View key="verified">
            <Text>Verified</Text>
            <Checkbox value={verified} onValueChange={setVerified} color={verified ? '#007BFF' : undefined} />
          </View>,
          <Button key="submitButton" title={selectedSchedule ? "Update Exemption" : "Add Exemption"} onPress={handleFormSubmit} />
        ];
      }
    }




    if (selectedSchedule && formMode != 'exemption-schedule') {
      components.push(
        <Button key="deleteButton" title="Delete" color="red" onPress={handleDelete} />
      );
    }
    return [components];
  };

  const clearForm = () => {
    //setSelectedSchedule(null);
    setTimeIn(new Date);
    setTimeOut(new Date);
    setDatetimeIn(new Date);
    setDatetimeOut(new Date);
    handleExemptionTypeChange(4);
    setVerified(true);
    setSelectedUser(undefined);
    setSelectedLab(undefined);
    setFormError(null);
  }


  const handleCloseForm = () => {
    setSelectedSchedule(null);
    setIsFormOpen(false);
    clearForm();
  }

  const handleAddExemption = () => {
    clearForm();
    setFormMode('exemption'); // Set the mode to exemption
    setIsFormOpen(true);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>Loading schedules...</Text>
      </View>
    );
  }

  const weekDisplay = `Week ${weekNumber} - week of ${currentWeek.format('MMMM Do, YYYY')}`;

  return (
    <View style={styles.container}>
      <View style={styles.navigation}>
        <Button title="< Previous Week" onPress={handlePreviousWeek} />
        <Text style={styles.weekDisplay}>{weekDisplay}</Text>
        <Button title="Next Week >" onPress={handleNextWeek} />
      </View>

      <ScrollView horizontal={true}>
        <ScrollView>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableHeader]}>User</Text>
              {daysOfWeek.map((day) => (
                <Text key={day} style={[styles.tableCell, styles.tableHeader]}>{day}</Text>
              ))}
            </View>
            {Object.entries(scheduleData.reduce((acc, entry) => {
              const userId = entry.userId;
              if (!acc[userId]) acc[userId] = [];
              acc[userId].push(entry);
              return acc;
            }, {})).map(([userId, userEntries]) => (
              <View key={userId} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.tableSubHeader]}>{userEntries[0].user}</Text>
                {daysOfWeek.map((day, index) => (
                  <View key={day} style={styles.tableCell}>
                    {groupByDay(userEntries, index).map((item, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.scheduleItem, getScheduleStyle(item.scheduleType)]}
                        onPress={() => handleScheduleClick(item.scheduleId, item.scheduleType)}
                      >
                        {item.lab && <Text>{`${item.lab} (${formatHours(item.hours)})`}</Text>}
                        {renderVerificationStatus(item.scheduleId)}
                        <Text>{item.scheduleType}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={() => { setFormMode('addOptions'); clearForm(); setSelectedSchedule(null); setIsFormOpen(true); }}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {isFormOpen && (
        <DynamicForm
          visible={isFormOpen}
          onClose={handleCloseForm}
          title={formMode.includes('exemption') ? 'Exemption' : 'Work Schedule'}
          components={getFormComponents()}
          error={formError} // Pass the error message to DynamicForm
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  weekDisplay: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  table: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  tableHeader: {
    fontWeight: 'bold',
  },
  tableSubHeader: {
    fontWeight: 'bold',
    textAlign: 'left',
  },
  scheduleItem: {
    margin: 5,
    padding: 5,
    borderRadius: 5,
  },
  work: {
    backgroundColor: '#ccccff',
  },
  school: {
    backgroundColor: '#ccffcc',
  },
  off: {
    backgroundColor: '#cccccc',
  },
  workingInNewRoom: {
    backgroundColor: '#ffcc99',
  },
  workingOutsideOfSchedule: {
    backgroundColor: '#ffeb99',
  },
  late: {
    backgroundColor: '#ffccff',
  },
  callingOut: {
    backgroundColor: '#ff9999',
  },
  defaultType: {
    backgroundColor: '#e0e0e0',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007BFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  optionButton: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  optionText: {
    color: 'white',
    fontSize: 18,
  },
  errorAsterisk: {
    color: 'red',
  },
});

export default LabSchedules;


