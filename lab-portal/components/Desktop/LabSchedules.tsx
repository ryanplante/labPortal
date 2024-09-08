import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Pressable, TouchableOpacity } from 'react-native';
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
import { Dimensions } from 'react-native';

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
  const [selectedDays, setSelectedDays] = useState([]);
  const [isWorkWeek, setIsWorkWeek] = useState(false);

const handleDaySelection = (index) => {
  setSelectedDays(prevDays =>
    prevDays.includes(index)
      ? prevDays.filter(day => day !== index)
      : [...prevDays, index]
  );
};

const handleWorkWeekSelection = (value) => {
  setIsWorkWeek(value);
  if (value) {
    // Select all days from Monday to Friday
    setSelectedDays([0, 1, 2, 3, 4]);
  } else {
    // Clear all selected days
    setSelectedDays([]);
  }
};

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
      setScheduleExemptions(exemptions.$values); // Store exemptions in state
      setScheduleData(data.$values ?? exemptions);
    } catch (error) {
      console.error('Error fetching schedule data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      const user = await getUserByToken();
      setUser(user);
    } catch (error) {
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
  };

  const isExemption = (scheduleId) => {
    // Find matching exemption by scheduleId
    if (scheduleExemptions) {
      const exemption = scheduleExemptions.find(exemption => exemption.scheduleExemptionId === scheduleId);
      return exemption;
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
      case 'Leaving early':
        return styles.leavingEarly;
      default:
        return styles.defaultType;
    }
  };

  const handleScheduleClick = async (scheduleId, scheduleType) => {
    try {
      let scheduleInfo;
  
      if (scheduleType.includes('School', 'Off') || scheduleType === undefined) {
        return;
      }
  
      console.log('Schedule Type:', scheduleType);
  
      if (scheduleType === 'Work') {
        scheduleInfo = await ScheduleService.getScheduleById(scheduleId);
        console.log('Selected Work Schedule Info:', scheduleInfo);
        
        // Log important state updates
        console.log('Before state updates - datetimeIn:', datetimeIn, 'datetimeOut:', datetimeOut);
        
        setSelectedSchedule(scheduleInfo);
        setSelectedUser(scheduleInfo.userId);
        setSelectedLab(scheduleInfo.fkLab);
  
        // Calculate the new date and log it
        const calculatedInDate = moment(currentWeek)
          .day(scheduleInfo.dayOfWeek + 1)
          .set({
            hour: moment(scheduleInfo.timeIn, 'HH:mm').hours(),
            minute: moment(scheduleInfo.timeIn, 'HH:mm').minutes(),
          });
        const calculatedOutDate = moment(currentWeek)
          .day(scheduleInfo.dayOfWeek + 1)
          .set({
            hour: moment(scheduleInfo.timeOut, 'HH:mm').hours(),
            minute: moment(scheduleInfo.timeOut, 'HH:mm').minutes(),
          });
  
        console.log('Calculated In Date:', calculatedInDate, 'Calculated Out Date:', calculatedOutDate);
        
        setDatetimeIn(calculatedInDate.toDate());
        setDatetimeOut(calculatedOutDate.toDate());
        setTimeIn(moment(scheduleInfo.timeIn, 'HH:mm').toDate());
        setTimeOut(moment(scheduleInfo.timeOut, 'HH:mm').toDate());
        setDayOfWeek(scheduleInfo.dayOfWeek);
        setFormMode('scheduleOptions');
      } else {
        setLoading(true);
        scheduleInfo = await ScheduleService.getScheduleExemptionById(scheduleId);
        setSelectedSchedule(scheduleInfo);
        console.log('Selected Exemption Schedule Info:', scheduleInfo);
  
        const exemptionStartDate = moment(scheduleInfo.startDate).toDate();
        const exemptionEndDate = moment(scheduleInfo.endDate).toDate();
  
        console.log('Exemption Start Date:', exemptionStartDate, 'Exemption End Date:', exemptionEndDate);
        
        setDatetimeIn(exemptionStartDate);
        setDatetimeOut(exemptionEndDate);
        
        if (scheduleInfo.fkSchedule) {
          const parentSchedule = await ScheduleService.getScheduleById(scheduleInfo.fkSchedule);
          setTimeIn(moment(parentSchedule.timeIn, 'HH:mm').toDate());
          setTimeOut(moment(parentSchedule.timeOut, 'HH:mm').toDate());
          setDayOfWeek(parentSchedule.dayOfWeek);
        }
  
        handleExemptionTypeChange(scheduleInfo.fkExemptionType);
        setVerified(scheduleInfo.verified);
        setSelectedUser(scheduleInfo.fkUser);
        setSelectedLab(scheduleInfo.fkLab);
        setFormMode('exemption');
        setLoading(false);
      }
  
      console.log('State after setting datetimeIn:', datetimeIn, 'datetimeOut:', datetimeOut);
      setIsFormOpen(true);
    } catch (error) {
      console.error('Error fetching schedule details:', error);
    }
  };
  
  
  
  

  const checkDateBounds = () => {
    // Check to make sure the exemption is within the schedule if they're updating/creating an exemption

    // Ensure the day of the week is between Monday (1) and Friday (5)
    if (moment(datetimeIn).isoWeekday() > 5) {
      setFormError('You must select a workday (Monday to Friday)!');
      return false;
    }
    // Special case for exemptionType 4: Ensure start and end times are not identical
    if (moment(datetimeIn).isSame(moment(datetimeOut))) {
      setFormError('Start time and end time cannot be the same!');
      return false;
    }
    // Ensure datetimeIn and datetimeOut are on the same day
    if (!moment(datetimeIn).isSame(datetimeOut, 'day')) {
      setFormError('Start time and end time must be on the same day!');
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
        setFormError('Start time cannot be before schedule start time!');
        return false;
      }

      // Ensure datetimeOut is before the end of the schedule
      if (moment(datetimeOut).isAfter(calculatedOutDate)) {
        setFormError('End time cannot be after schedule end time!');
        return false;
      }

      return true;
    }
    return true;
  };

  const checkErrors = () => {
    let error = '';
    if (!selectedUser || isNaN(selectedUser)) {
      error = error + 'Please select a user\n';
    }
    if (!selectedLab || isNaN(selectedLab)) {
      error = error + 'Please select a lab\n';
    }

    if (error !== '') {
      setFormError(error);
      return true;
    }
    return false;
  };

  const handleFormSubmit = async () => {
    try {
      let check, formData, collisionResult;
      setFormError(null);  
      if (checkErrors()) return;
  
      // Handle 'work' schedule case
      if (formMode === 'work') {
        
        // For updating an existing schedule
        if (selectedSchedule) {
          check = {
            userId: selectedUser,
            fkLab: selectedLab,
            timeIn: moment(timeIn).format('HH:mm'), // Convert date object to 'HH:mm' format
            timeOut: moment(timeOut).format('HH:mm'), // Convert date object to 'HH:mm' format
            dayOfWeek,
            weekNumber,
            pkLog: selectedSchedule.scheduleId, // Pass scheduleId for updating
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
          if (collisionResult && collisionResult[0] !== 'No schedule conflicts') {
            setFormError(`Schedule conflict detected:\n${collisionResult.join('\n')}`);
            return;
          }
  
          // Update the schedule
          await ScheduleService.updateSchedule(selectedSchedule.scheduleId, formData);
        
        // For creating a new schedule, iterate over selected days
        } else {
          // Ensure at least one day is selected when adding a new schedule
          if (!selectedSchedule && selectedDays.length === 0) {
            setFormError("Please select at least one day.");
            return;
          }
          for (const day of selectedDays) {
            check = {
              userId: selectedUser,
              fkLab: selectedLab,
              timeIn: moment(timeIn).format('HH:mm'), // Convert date object to 'HH:mm' format
              timeOut: moment(timeOut).format('HH:mm'), // Convert date object to 'HH:mm' format
              dayOfWeek: day, // Use the selected day in the loop
              weekNumber,
              pkLog: null, // New schedule creation
            };
  
            formData = {
              userId: selectedUser,
              fkLab: selectedLab,
              // No UTC conversion, save time in local time format
              timeIn: moment(timeIn).format('HH:mm'),
              timeOut: moment(timeOut).format('HH:mm'),
              dayOfWeek: day, // Use the selected day in the loop
              fkScheduleType: 1,
              location: null,
            };
  
            // Perform the collision check for each day
            collisionResult = await ScheduleService.checkScheduleCollision(check);
            if (collisionResult && collisionResult[0] !== 'No schedule conflicts') {
              setFormError(`Schedule conflict detected for ${daysOfWeek[day]}:\n${collisionResult.join('\n')}`);
              return;
            }
  
            // Create the new schedule for the selected day
            await ScheduleService.createSchedule(formData);
          }
        }
        
        // Close the form and refresh schedules
        setIsFormOpen(false);
        await fetchSchedules(); // Refresh schedules
  
      // Handle 'exemption' case (no changes to this part)
      } else if (formMode.includes('exemption')) {
        const startDate = moment(datetimeIn).format('YYYY-MM-DDTHH:mm:ss'); // Format start date as local time
        const endDate = moment(datetimeOut).format('YYYY-MM-DDTHH:mm:ss'); // Format end date as local time
  
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
          if (collisionResult && collisionResult[0] !== 'No schedule conflicts') {
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
  
        // Close form and refresh schedules after submission
        setIsFormOpen(false);
        await fetchSchedules(); // Refresh schedules
      }
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

  const handleExemptionTypeChange = async (value) => {
    setExemptionType(value);
    // Calculate the date based on currentWeek and dayOfWeek, this is used to populate schedule exemptions with the schedule's date of the selected week
    if (formMode.includes("schedule")) {
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
      } else if (value == 2) {
        setDatetimeIn(calculatedInDate.toDate());
      } else if (value == 5) {
        setDatetimeOut(calculatedOutDate.toDate());
      }
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
  };

  const resetTimeValues = () => {
    const defaultTimeIn = moment().set({ hour: 9, minute: 0 }).toDate(); // Set to 9:00 AM
    const defaultTimeOut = moment().set({ hour: 17, minute: 0 }).toDate(); // Set to 5:00 PM
  
    setTimeIn(defaultTimeIn);
    setTimeOut(defaultTimeOut);
  };  

  const resetDateTimeValues = () => {
    const defaultTimeIn = moment().set({ hour: 9, minute: 0 }).toDate(); // Set to 9:00 AM
    const defaultTimeOut = moment().set({ hour: 17, minute: 0 }).toDate(); // Set to 5:00 PM
  
    setDatetimeIn(defaultTimeIn);
    setDatetimeOut(defaultTimeOut);
  };  

  const getFormComponents = () => {
    let components = [];
    const isUserError = (!selectedUser || isNaN(selectedUser)) && formError && formError.includes('Please select a user');
    const isLabError = (!selectedLab || isNaN(selectedLab)) && formError && formError.includes('Please select a lab');
    if (formMode === 'scheduleOptions') {
      return [
        [
          <Pressable key="modifySchedule" style={styles.optionButton} onPress={() => setFormMode('work')}>
            <Text style={styles.optionText}>Modify Schedule</Text>
          </Pressable>,
          <Pressable key="addExemption" style={styles.optionButton} onPress={() => {
            handleExemptionTypeChange(1); // Default to "Calling out"
            setVerified(true); // Set verified to true
            setFormMode('exemption-schedule');
          }}>
            <Text style={styles.optionText}>Add Exemption</Text>
          </Pressable>,
        ]
      ];
    }
    // If the formMode is for selecting options to add a schedule or exemption
    if (formMode === 'addOptions') {
      return [
        [
          <Pressable key="addSchedule" style={styles.optionButton} onPress={() => {setFormMode('work'); setTimeIn(new Date()); setSelectedSchedule(null); resetTimeValues()}}>
            <Text style={styles.optionText}>Add New Schedule</Text>
          </Pressable>,
          <Pressable key="addExemption" style={styles.optionButton} onPress={handleAddExemption}>
            <Text style={styles.optionText}>Add a Schedule Exemption</Text>
          </Pressable>,
        ]
      ];
    }
    if (formMode === 'work') {
      console.log(selectedSchedule);
      components = [
        <View key="userId" style={styles.formGroup}>
          <Text>
            <UserPicker selectedUser={selectedUser} onUserChange={setSelectedUser} />
            {isUserError && <Text style={styles.errorAsterisk}>*</Text>}
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
    
        // Conditional rendering based on whether selectedSchedule is null or not
        selectedSchedule ? (
          <View key="dayOfWeek">
            <Text>Day of Week</Text>
            <Picker selectedValue={dayOfWeek} onValueChange={setDayOfWeek}>
              {daysOfWeek.map((day, index) => (
                <Picker.Item key={index} label={day} value={index} />
              ))}
            </Picker>
          </View>
        ) : (
          <View key="dayOfWeekCheckboxes" style={styles.checkboxContainer}>
            <Text>Days of the Week</Text>
            <View style={styles.checkboxRow}>
              {daysOfWeek.map((day, index) => (
                <View key={index} style={styles.checkboxItem}>
                  <Text>{day}</Text>
                  <Checkbox
                    value={selectedDays.includes(index)}
                    onValueChange={() => handleDaySelection(index)}
                  />
                </View>
              ))}
            </View>
            <View style={styles.checkboxItem}>
              <Text>Repeat for Work Week</Text>
              <Checkbox
                value={isWorkWeek}
                onValueChange={handleWorkWeekSelection}
              />
            </View>
          </View>
        ),
    
        <Pressable key="submitButton" style={styles.submitButton} onPress={handleFormSubmit}>
          <Text style={styles.optionText}>{selectedSchedule ? "Update Schedule" : "Add Schedule"}</Text>
        </Pressable>
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
              <Picker.Item label="Leaving early" value={5} />
            </Picker>
          </View>,
          <View key="verified">
            <Text>Verified</Text>
            <Checkbox value={verified} onValueChange={setVerified} color={verified ? '#007BFF' : undefined} />
          </View>,
          <Pressable key="submitButton" style={styles.submitButton} onPress={handleFormSubmit}>
            <Text style={styles.optionText}>Add Exemption</Text>
          </Pressable>
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
              <Picker selectedValue={exemptionType} onValueChange={handleExemptionTypeChange} enabled={selectedSchedule ? false : true}>
                <Picker.Item label="Calling out" value={1} />
                <Picker.Item label="Late" value={2} />
                <Picker.Item label="Working in new room" value={3} />
                {selectedSchedule && <Picker.Item label="Working outside of schedule" value={4} />}
                <Picker.Item label="Leaving early" value={5} />
              </Picker>
            </>)}
          </View>,
          <View key="verified">
            <Text>Verified</Text>
            <Checkbox value={verified} onValueChange={setVerified} color={verified ? '#007BFF' : undefined} />
          </View>,
          <Pressable key="submitButton" style={styles.submitButton} onPress={handleFormSubmit}>
            <Text style={styles.optionText}>{selectedSchedule ? "Update Exemption" : "Add Exemption"}</Text>
          </Pressable>
        ];
      }
    }

    if (selectedSchedule && formMode != 'exemption-schedule') {
      components.push(
        <Pressable key="deleteButton" style={[styles.submitButton, { backgroundColor: 'red' }]} onPress={handleDelete}>
          <Text style={styles.optionText}>Delete</Text>
        </Pressable>
      );
    }
    return [components];
  };

  const clearForm = () => {
    // Keep existing times for schedule updates, but reset for new entries
    if (!selectedSchedule) {
      setDatetimeIn(new Date()); // Only reset to current time if no selected schedule
      setDatetimeOut(new Date());
    }
    setSelectedDays([]);\
    setIsWorkWeek(false);

    // Reset other form fields
    //setTimeIn(new Date());
    //setTimeOut(new Date());
    handleExemptionTypeChange(4); // Default to 'Working outside of schedule'
    setVerified(true);
    setSelectedUser(undefined);
    setSelectedLab(undefined);
    setFormError(null);
  };
  
  

  const handleCloseForm = () => {
    setIsFormOpen(false);
    clearForm();
  };

  const handleAddExemption = () => {
    setSelectedSchedule(null);
    resetDateTimeValues();
    clearForm();
    handleExemptionTypeChange(4); // set the exemption type to working outside of schedule
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
        <Pressable style={styles.navigationButton} onPress={handlePreviousWeek}>
          <Text style={styles.optionText}>{"< Previous Week"}</Text>
        </Pressable>
        <Text style={styles.weekDisplay}>{weekDisplay}</Text>
        <Pressable style={styles.navigationButton} onPress={handleNextWeek}>
          <Text style={styles.optionText}>{"Next Week >"}</Text>
        </Pressable>
      </View>

      {/* Outer scroll for horizontal and vertical scrolling */}
      <ScrollView horizontal={true}>
        <ScrollView vertical={true} style={styles.tableBody}>
          <View style={styles.stickyHeaderContainer}>
            <View style={[styles.tableRow, styles.stickyHeader]}>
              <Text style={[styles.tableCell, styles.tableHeader]}>User</Text>
              {daysOfWeek.map((day) => (
                <Text key={day} style={[styles.tableCell, styles.tableHeader]}>{day}</Text>
              ))}
            </View>
          </View>

          <View style={styles.table}>
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
                      <Pressable
                        key={idx}
                        style={[styles.scheduleItem, getScheduleStyle(item.scheduleType)]}
                        onPress={() => handleScheduleClick(item.scheduleId, item.scheduleType)}
                      >
                        {item.lab && <Text>{`${item.lab} (${formatHours(item.hours)})`}</Text>}
                        <Text>{item.scheduleType}</Text>
                        {renderVerificationStatus(item.scheduleId)}
                      </Pressable>
                    ))}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>

      <View style={styles.colorKeyContainer}>
        <Text style={styles.colorKeyTitle}>Color Code Key:</Text>
        <View style={styles.colorKeyItem}>
          <View style={[styles.colorSquare, styles.work]} />
          <Text>Work</Text>
        </View>
        <View style={styles.colorKeyItem}>
          <View style={[styles.colorSquare, styles.school]} />
          <Text>School</Text>
        </View>
        <View style={styles.colorKeyItem}>
          <View style={[styles.colorSquare, styles.off]} />
          <Text>Off</Text>
        </View>
        <View style={styles.colorKeyItem}>
          <View style={[styles.colorSquare, styles.late]} />
          <Text>Late</Text>
        </View>
        <View style={styles.colorKeyItem}>
          <View style={[styles.colorSquare, styles.callingOut]} />
          <Text>Calling Out</Text>
        </View>
        <View style={styles.colorKeyItem}>
          <View style={[styles.colorSquare, styles.leavingEarly]} />
          <Text>Leaving Early</Text>
        </View>
      </View>

      <Pressable style={styles.addButton} onPress={() => { setFormMode('addOptions'); clearForm(); setIsFormOpen(true); }}>
        <Text style={styles.addButtonText}>+</Text>
      </Pressable>

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
    width: '100%',
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
    backgroundColor: 'rgb(255, 193, 7)', // Updated color
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
    backgroundColor: 'rgb(255, 193, 7)', // Updated color
    borderRadius: 5,
  },
  optionText: {
    color: 'white',
    fontSize: 18,
  },
  submitButton: {
    backgroundColor: 'rgb(255, 193, 7)', // Updated color
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
  },
  errorAsterisk: {
    color: 'red',
  },
  tableContainer: {
    width: '150%',
    alignSelf: 'center',
    overflow: 'scroll',
  },
  leavingEarly: {
    backgroundColor: '#ffcccc',
  },
  stickyHeaderContainer: {
    height: 50,
    position: 'sticky',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#fff',
  },
  stickyHeader: {
    backgroundColor: '#fff',
    zIndex: 10,
    elevation: 3,
  },
  tableBody: {
    maxHeight: '80%',
    width: '150%',
    paddingTop: 0,
    marginTop: 50,
  },
  colorKeyContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    width: '25%',
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  colorKeyTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  colorKeyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  colorSquare: {
    width: 20,
    height: 20,
    marginRight: 10,
    borderRadius: 3,
  },
  navigationButton: {
    backgroundColor: 'rgb(255, 193, 7)', // Updated color for buttons
    padding: 10,
    borderRadius: 5,
  },
});

export default LabSchedules;