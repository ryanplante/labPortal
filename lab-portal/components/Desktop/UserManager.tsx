import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Image, Picker, TouchableOpacity } from 'react-native';
import userService, { Ban, User } from '../../services/userService';
import departmentService, { Department } from '../../services/departmentService';
import { updatePassword } from '../../services/loginService';
import ActionsModal from '../Modals/ActionsModal';
import ConfirmationModal from '../Modals/ConfirmationModal';
import DynamicForm from '../Modals/DynamicForm';
import PlatformSpecificDateTimePicker from '../Modals/PlatformSpecificDateTimePicker';

const UserManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<{ [key: number]: string }>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [actionsModalVisible, setActionsModalVisible] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [confirmationType, setConfirmationType] = useState<'deleteUser' | 'deleteBan' | 'pardonBan' | null>(null);
  const [actionData, setActionData] = useState<any>(null); // To hold the user/ban data
  const [confirmationTitle, setConfirmationTitle] = useState('');
  const [confirmationDescription, setConfirmationDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [isStaffFilter, setIsStaffFilter] = useState<string>('All');
  const [isBannedFilter, setIsBannedFilter] = useState<string>('All');
  const [isLockedOutFilter, setIsLockedOutFilter] = useState<string>('All');
  const [lockedOutUserIds, setLockedOutUserIds] = useState<number[]>([]);
  const [bannedUserIds, setBannedUserIds] = useState<number[]>([]);

  const [dynamicFormVisible, setDynamicFormVisible] = useState(false); // To show/hide user form
  const [banFormVisible, setBanFormVisible] = useState(false); // To show/hide ban form
  const [isUpdateMode, setIsUpdateMode] = useState(false); // To differentiate between create/update mode
  const [formData, setFormData] = useState<User | null>(null); // For holding the user data to create/update
  const [banData, setBanData] = useState<Ban | null>(null); // For holding the ban data to create/update
  const [banList, setBanList] = useState<Ban[]>([]); // State to store the list of bans
  const [formError, setFormError] = useState<string | null>(null);



  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userList = await userService.getAllUsers();
      const departmentList = await departmentService.getAllDepartments();
      const lockedOutList = await userService.getLockedOutUsers();
      const bans = await userService.getAllBans(); // Get all bans

      // Convert the ban expirationDate from UTC to local timezone and filter out past bans
      const activeBans = bans.filter(ban => {
        const expirationDateLocal = new Date(ban.expirationDate);
        const nowLocal = new Date();
        return expirationDateLocal > nowLocal;  // Only include active bans
      });

      const departmentMap = departmentList.reduce((acc, department) => {
        acc[department.deptId] = department.name;
        return acc;
      }, {} as { [key: number]: string });

      setDepartments(departmentMap);

      const lockedOutUserIds = lockedOutList && lockedOutList.length > 0 ? lockedOutList.map(user => user.userId) : [];
      const bannedUserIds = activeBans && activeBans.length > 0 ? activeBans.map(ban => ban.userId) : [];

      setLockedOutUserIds(lockedOutUserIds);
      setBannedUserIds(bannedUserIds);
      setBanList(activeBans); // Store all active bans for reference

      // Ensure the `ban` property is correctly set
      const updatedUsers = userList.$values.map(user => ({
        ...user,
        departmentName: departmentMap[user.userDept] || 'Unknown',
        isLockedOut: lockedOutUserIds.includes(user.userId),
        ban: bannedUserIds.includes(user.userId), // Set the `ban` property for each user
      }));

      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const zeroPadUserId = (userId: number, length: number = 8): string => {
    return userId.toString().padStart(length, '0');
  };

  // Function to handle deleting the user (with confirmation)
  const handleDeleteUser = (userId: number) => {
    setConfirmationType('deleteUser');
    setActionData(userId); // Store the userId in the action data
    setConfirmationVisible(true);
  };
  const handleDeleteBan = (banId: number) => {
    setConfirmationTitle('Delete Ban');
    setConfirmationDescription(`Are you sure you want to delete the ban for ${selectedUser!.fName} ${selectedUser!.lName}?`);
    setConfirmationType('deleteBan');
    setActionData(banId); // Store the banId in the action data
    setConfirmationVisible(true);
  };

  const handlePardonBan = (banId: number) => {
    setConfirmationTitle('Pardon Ban');
    setConfirmationDescription(`Are you sure you want to pardon the ban for ${selectedUser!.fName} ${selectedUser!.lName}?`);
    setConfirmationType('pardonBan');
    setActionData(banId); // Store the banId in the action data
    setConfirmationVisible(true);
  };

  const handleCloseDynamicForm = () => {
    setFormError(null);
    setFormData(null);
    setDynamicFormVisible(false);
    setBanFormVisible(false);
    setBanData(null);
  };

  const handleConfirmAction = async () => {
    let success = false;
    let successMessage = '';
    let failureMessage = '';

    if (confirmationType === 'deleteUser') {
      successMessage = 'User deleted successfully.';
      failureMessage = 'Failed to delete user.';
      try {
        await userService.deleteUser(actionData); // actionData holds userId
        success = true;
      } catch (error) {
        success = false;
      }
    } else if (confirmationType === 'deleteBan') {
      successMessage = 'Ban deleted successfully.';
      failureMessage = 'Failed to delete ban.';
      try {
        await userService.deleteBan(actionData); // actionData holds banId
        success = true;
      } catch (error) {
        success = false;
      }
    } else if (confirmationType === 'pardonBan') {
      successMessage = 'Ban pardoned successfully.';
      failureMessage = 'Failed to pardon ban.';
      try {
        await userService.pardonBan(actionData); // actionData holds banId
        success = true;
      } catch (error) {
        success = false;
      }
    } else if (confirmationType === 'resetPassword') {
      successMessage = 'Password reset successfully.';
      failureMessage = 'Failed to reset password.';
      try {
        await updatePassword(actionData, 'password'); // actionData holds userId
        success = true;
      } catch (error) {
        success = false;
      }
    } else if (confirmationType === 'lockUser') {
      successMessage = 'User locked successfully.';
      failureMessage = 'Failed to lock user.';
      try {
        await userService.lockUser(actionData); // actionData holds userId
        success = true;
      } catch (error) {
        success = false;
      }
    } else if (confirmationType === 'unlockUser') {
      successMessage = 'User unlocked successfully.';
      failureMessage = 'Failed to unlock user.';
      try {
        await userService.unlockUser(actionData); // actionData holds userId
        success = true;
      } catch (error) {
        success = false;
      }

    }

    if (success) {
      setBanFormVisible(false);
      setDynamicFormVisible(false);
      setActionsModalVisible(false);
    }

    // Show result modal based on success or failure
    setConfirmationTitle(success ? 'Success' : 'Failure');
    setConfirmationDescription(success ? successMessage : failureMessage);
    setConfirmationType('result'); // Use 'result' type for the OK modal
    await loadData();
  };






  const getRoleDescription = (privLvl: number): string => {
    switch (privLvl) {
      case 0: return 'Student';
      case 1: return 'Monitor';
      case 2: return 'Tutor';
      case 3: return 'Hybrid';
      case 4: return 'Department Head';
      case 5: return 'Admin';
      default: return 'Unknown';
    }
  };

  // Show confirmation for locking/unlocking the user  
  const handleLockUnlock = (user: User) => {
    if (user.isLockedOut) {
      setConfirmationType('unlockUser');
      setConfirmationTitle('Unlock Account');
      setConfirmationDescription(`Are you sure you want to unlock the account for ${user.fName} ${user.lName}?`);
    } else {
      setConfirmationType('lockUser');
      setConfirmationTitle('Lock Account');
      setConfirmationDescription(`Are you sure you want to lock the account for ${user.fName} ${user.lName}?`);
    }
    setActionData(user.userId); // Set the user ID for the action
    setConfirmationVisible(true); // Show the confirmation modal
    setActionsModalVisible(false); // Close the actions modal
  };


  const handleAddUser = () => {
    setFormData({
      userId: 0, // New user
      fName: '',
      lName: '',
      userDept: 1, // Default department
      privLvl: 0, // Default role (Student)
      isTeacher: false,
    });
    setIsUpdateMode(false); // Create mode
    setDynamicFormVisible(true); // Show form
  };

  const handleUserAction = (user: User) => {
    setFormData(user); // Load user data for updating
    setIsUpdateMode(true); // Update mode
    setDynamicFormVisible(true); // Show form
  };

  const handleSubmitUserForm = async (formData: User) => {
    const numericUserId = parseInt(formData.userId.toString(), 10);
  
    if (isNaN(numericUserId)) {
      setFormError('User ID must be a valid number.');
      return;
    }
  
    if (formData.userId.toString().length > 8) {
      setFormError('User ID cannot be longer than 8 characters.');
      return;
    }
  
    if (formData.fName.length > 32 || formData.lName.length > 32 || formData.fName.length < 3 || formData.lName.length < 3) {
      setFormError('First Name and Last Name must be between [3-32] characters.');
      return;
    }
  
    setFormError(null);
  
    const updatedFormData = {
      ...formData,
      userId: numericUserId, // Convert to number for backend
    };
  
    let successMessage;
    if (isUpdateMode) {
      await userService.updateUser(updatedFormData.userId, updatedFormData); // Update user
      successMessage = 'User updated successfully.';
    } else {
      await userService.createUser(updatedFormData); // Create user
      successMessage = 'User created successfully.';
    }
  
    setConfirmationTitle('Success');
    setConfirmationDescription(successMessage);
    setConfirmationType('result'); // Set the type to result so it just shows OK modal
    setConfirmationVisible(true);
  
    loadData(); // Reload data after submission
    setDynamicFormVisible(false); // Hide form
  };
  


  const handleBanUser = (user: User) => {
    const existingBan = bannedUserIds.includes(user.userId);

    if (existingBan) {
      // Fetch the existing ban details from the banList state
      const banDetails = banList.find(ban => ban.userId === user.userId);
      if (banDetails) {
        setBanData({
          banId: banDetails.banId, // Include banId for updates
          userId: user.userId,
          reason: banDetails.reason, // Load existing reason
          expirationDate: new Date(banDetails.expirationDate), // Load existing expiration date
        });
      }
    } else {
      // If no existing ban, open form to create new ban
      setBanData({
        banId: 0, // New ban, no ID
        userId: user.userId,
        reason: '',
        expirationDate: new Date(),
      });
    }

    setBanFormVisible(true); // Show ban form (edit or add mode)
  };

  const handleSubmitBanForm = async (banData: Ban) => {
    if (!banData.reason || banData.reason.length > 150) {
      setFormError('Ban reason is required and must not exceed 150 characters.');
      return;
    }
  
    if (banData.expirationDate <= new Date()) {
      setFormError('Expiration date must be in the future.');
      return;
    }
  
    // If validation passes, proceed to submit
    setFormError(null);
    let successMessage;
    if (banData.banId) {
      await userService.updateBan(banData.banId, {
        userId: banData.userId,
        reason: banData.reason,
        expirationDate: banData.expirationDate,
      });
      successMessage = 'Ban updated successfully.';
    } else {
      await userService.createBan({
        userId: banData.userId,
        reason: banData.reason,
        expirationDate: banData.expirationDate,
      });
      successMessage = 'Ban created successfully.';
    }
  
    setConfirmationTitle('Success');
    setConfirmationDescription(successMessage);
    setConfirmationType('result'); // Set the type to result so it just shows OK modal
    setConfirmationVisible(true);
  
    loadData(); // Reload data after submission
    setBanFormVisible(false); // Hide ban form
  };
  


  const handleResetPassword = () => {
    setConfirmationType('resetPassword');
    setActionData(selectedUser!.userId); // Set user ID to action data
    setConfirmationTitle('Reset Password');
    setConfirmationDescription(`Are you sure you want to reset the password for ${selectedUser!.fName} ${selectedUser!.lName}?`);
    setConfirmationVisible(true); // Show the confirmation modal
    setActionsModalVisible(false); // Close the actions modal
  };



  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users); // Reset if search query is empty
      return;
    }

    const isNumeric = /^\d+$/.test(searchQuery);
    let result;
    if (isNumeric) {
      result = await userService.fuzzySearchById(parseInt(searchQuery));
    } else {
      const [fName, lName] = searchQuery.split(' ');
      result = await userService.fuzzySearchByName(fName, lName);
    }

    const updatedUsers = result.$values.map(user => ({
      ...user,
      departmentName: departments[user.userDept] || 'Unknown',
      isLockedOut: lockedOutUserIds.includes(user.userId),
      ban: bannedUserIds.includes(user.userId),
    }));

    setFilteredUsers(updatedUsers);
  };

  const applyFilters = () => {
    let filtered = users;

    if (selectedDepartment && selectedDepartment !== 'All Departments') {
      filtered = filtered.filter(user => user.userDept === parseInt(selectedDepartment));
    }

    if (isStaffFilter !== 'All') {
      filtered = filtered.filter(user => {
        switch (isStaffFilter) {
          case 'Monitors':
            return user.privLvl === 1 || user.privLvl === 3;
          case 'Tutors':
            return user.privLvl === 2 || user.privLvl === 3;
          case 'Student Workers':
            return user.privLvl >= 1 && user.privLvl <= 3;
          case 'Department Heads':
            return user.privLvl === 4;
          case 'Admin':
            return user.privLvl === 5;
          case 'Teachers':
            return user.isTeacher === true;
          default:
            return true;
        }
      });
    }

    if (isLockedOutFilter !== 'All') {
      filtered = filtered.filter(user => user.isLockedOut === (isLockedOutFilter === 'Locked Out'));
    }

    // Fix the ban filter
    if (isBannedFilter === 'Banned') {
      filtered = filtered.filter(user => user.ban === true); // Filter for banned users
    } else if (isBannedFilter === 'Not Banned') {
      filtered = filtered.filter(user => user.ban === false); // Filter for non-banned users
    }

    setFilteredUsers(filtered);
  };




  useEffect(() => {
    applyFilters(); // Apply filters whenever a filter state changes
  }, [selectedDepartment, isStaffFilter, isLockedOutFilter, isBannedFilter]);

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedUser(item); // Set the selected user
        setActionsModalVisible(true); // Open the ActionsModal
      }}
    >
      <View style={styles.userRow}>
        <Text style={[styles.userCell, styles.fixedWidthId]}>{zeroPadUserId(item.userId)}</Text>
        <Text style={[styles.userCell, styles.fixedWidthName]}>{item.fName} {item.lName}</Text>
        <Text style={[styles.userCell, styles.fixedWidthRole]}>{getRoleDescription(item.privLvl)}</Text>
        <Text style={[styles.userCell, styles.fixedWidthDept]}>{item.departmentName}</Text>
        <Text style={[styles.userCell, styles.fixedWidthStaff]}>{item.isTeacher ? 'Yes' : 'No'}</Text>
        <View style={[styles.iconCell, styles.fixedWidthIcon]}>
          <Image source={item.isLockedOut ? require('../../assets/lock.png') : require('../../assets/unlock.png')} style={styles.icon} />
        </View>
        <View style={[styles.iconCell, styles.fixedWidthIcon]}>
          <Image source={item.ban ? require('../../assets/ban.png') : require('../../assets/green_check.png')} style={styles.icon} />
        </View>
      </View>
    </TouchableOpacity>
  );



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Page</Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
        <Text style={styles.addButtonText}>Add New User</Text>
      </TouchableOpacity>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or ID"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Image source={require('../../assets/search-button.png')} style={styles.searchIcon} />
        </TouchableOpacity>
        <View style={styles.filterContainer}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Department</Text>
            <Picker
              selectedValue={selectedDepartment || 'All Departments'}
              style={styles.picker}
              onValueChange={(value) => {
                setSelectedDepartment(value); // Set selected department
                applyFilters(); // Reapply filters
              }}
            >
              <Picker.Item label="All Departments" value="All Departments" />
              {Object.entries(departments).map(([deptId, deptName]) => (
                <Picker.Item key={deptId} label={deptName} value={deptId} />
              ))}
            </Picker>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Staff Type</Text>
            <Picker
              selectedValue={isStaffFilter}
              style={styles.picker}
              onValueChange={(value) => {
                setIsStaffFilter(value); // Set staff filter
                applyFilters(); // Reapply filters
              }}
            >
              <Picker.Item label="All" value="All" />
              <Picker.Item label="Monitors" value="Monitors" />
              <Picker.Item label="Tutors" value="Tutors" />
              <Picker.Item label="Student Workers" value="Student Workers" />
              <Picker.Item label="Department Heads" value="Department Heads" />
              <Picker.Item label="Admin" value="Admin" />
              <Picker.Item label="Teachers" value="Teachers" />
            </Picker>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Locked Out</Text>
            <Picker
              selectedValue={isLockedOutFilter}
              style={styles.picker}
              onValueChange={(value) => {
                setIsLockedOutFilter(value); // Set locked out filter
                applyFilters(); // Reapply filters
              }}
            >
              <Picker.Item label="All" value="All" />
              <Picker.Item label="Locked Out" value="Locked Out" />
              <Picker.Item label="Not Locked Out" value="Not Locked Out" />
            </Picker>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Banned Status</Text>
            <Picker
              selectedValue={isBannedFilter}
              style={styles.picker}
              onValueChange={(value) => {
                setIsBannedFilter(value); // Set banned status filter
                applyFilters(); // Reapply filters
              }}
            >
              <Picker.Item label="All" value="All" />
              <Picker.Item label="Banned" value="Banned" />
              <Picker.Item label="Not Banned" value="Not Banned" />
            </Picker>
          </View>
        </View>



      </View>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.fixedWidthId]}>User ID</Text>
        <Text style={[styles.headerCell, styles.fixedWidthName]}>Name</Text>
        <Text style={[styles.headerCell, styles.fixedWidthRole]}>Role</Text>
        <Text style={[styles.headerCell, styles.fixedWidthDept]}>Department</Text>
        <Text style={[styles.headerCell, styles.fixedWidthStaff]}>Staff</Text>
        <Text style={[styles.headerCell, styles.fixedWidthIcon]}>Locked Out</Text>
        <Text style={[styles.headerCell, styles.fixedWidthIcon]}>Banned</Text>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.userId.toString()}
        renderItem={renderUserItem}
        contentContainerStyle={[styles.tableContainer, { paddingBottom: 150 }]}
      />
      <ActionsModal
        visible={actionsModalVisible}
        onClose={() => setActionsModalVisible(false)}
        actionButtons={[
          { icon: require('../../assets/edit.png'), onPress: () => handleUserAction(selectedUser!) },
          { icon: require('../../assets/reset.png'), onPress: handleResetPassword },
          { icon: selectedUser && selectedUser.ban ? require('../../assets/ban.png') : require('../../assets/green_check.png'), onPress: () => handleBanUser(selectedUser!) },
          {
            icon: selectedUser && selectedUser.isLockedOut
              ? require('../../assets/lock.png')  // Locked icon if user is locked
              : require('../../assets/unlock.png'),  // Unlock icon if user is unlocked
            onPress: () => handleLockUnlock(selectedUser!)
          },
        ]}
      />
      <DynamicForm
        visible={banFormVisible}
        title="Manage Ban"
        onClose={handleCloseDynamicForm}
        error={formError}
        components={[
          [
            banData && selectedUser && (
              <Text key="banUserInfo" style={styles.label}>
                {`Ban for: ${selectedUser.fName} ${selectedUser.lName} (${zeroPadUserId(selectedUser.userId)})`}
              </Text>
            ),
            <Text key="banReasonLabel" style={styles.label}>Ban Reason</Text>,
            <TextInput
              key="reason"
              placeholder="Ban Reason"
              style={styles.input}
              value={banData?.reason || ''}
              onChangeText={value => setBanData({ ...banData!, reason: value })}
            />,

            <Text key="banExpirationLabel" style={styles.label}>Expiration Date</Text>,
            <PlatformSpecificDateTimePicker
              key="expirationDatePicker"
              dateTime={banData?.expirationDate || new Date()}
              onDateTimeChange={date => setBanData({ ...banData!, expirationDate: date })}
            />,

            <TouchableOpacity key="submitBtn" style={styles.submitButton} onPress={() => handleSubmitBanForm(banData!)}>
              <Text style={styles.submitButtonText}>Save Ban</Text>
            </TouchableOpacity>,

            // Conditionally render delete and pardon buttons only if editing an existing ban
            banData?.banId && banData?.banId !== 0 ? (
              <>
                <TouchableOpacity
                  key="deleteBanBtn"
                  style={[styles.submitButton, styles.dangerButton]} // Apply a red button style for delete
                  onPress={() => handleDeleteBan(banData!.banId)}
                >
                  <Text style={styles.submitButtonText}>Delete Ban</Text>
                </TouchableOpacity>,

                <TouchableOpacity
                  key="pardonBanBtn"
                  style={styles.submitButton}
                  onPress={() => handlePardonBan(banData!.banId)}
                >
                  <Text style={styles.submitButtonText}>Pardon Ban</Text>
                </TouchableOpacity>
              </>
            ) : null, // Return null when the condition is not met, instead of leaving it empty
          ],
        ]}
      />



      <DynamicForm
        visible={dynamicFormVisible}
        title={isUpdateMode ? 'Update User' : 'Create New User'}
        onClose={handleCloseDynamicForm}
        error={formError}
        components={[
          [
            <Text key="userIdLabel" style={styles.label}>User ID</Text>,
            <TextInput
              key="userId"
              style={styles.input}
              value={
                isUpdateMode && formData?.userId
                  ? formData.userId.toString().padStart(8, '0')  // Zero-pad only in update mode
                  : formData?.userId || ''  // Show the raw value otherwise
              }
              onChangeText={(value) => {
                // Remove non-numeric characters and limit to 8 characters
                const numericValue = value.replace(/\D/g, '');
                const truncatedValue = numericValue.slice(0, 8); // Limit input to 8 digits
                setFormData({ ...formData, userId: truncatedValue });
              }}
              editable={!isUpdateMode}  // Make it read-only if updating an existing user
            />
            ,
            <Text key="fNameLabel" style={styles.label}>First Name</Text>,
            <TextInput
              key="fName"
              placeholder="First Name"
              style={styles.input}
              value={formData?.fName || ''}
              onChangeText={value => setFormData({ ...formData!, fName: value })}
            />,

            <Text key="lNameLabel" style={styles.label}>Last Name</Text>,
            <TextInput
              key="lName"
              placeholder="Last Name"
              style={styles.input}
              value={formData?.lName || ''}
              onChangeText={value => setFormData({ ...formData!, lName: value })}
            />,

            <Text key="deptLabel" style={styles.label}>Department</Text>,
            <Picker
              key="deptPicker"
              selectedValue={formData?.userDept || ''}
              style={styles.input}
              onValueChange={value => setFormData({ ...formData!, userDept: value })}
            >
              {Object.entries(departments).map(([deptId, deptName]) => (
                <Picker.Item key={deptId} label={deptName} value={deptId} />
              ))}
            </Picker>,

            <Text key="roleLabel" style={styles.label}>Role</Text>,
            <Picker
              key="privPicker"
              selectedValue={formData?.privLvl || ''}
              style={styles.input}
              onValueChange={value => setFormData({ ...formData!, privLvl: value })}
            >
              <Picker.Item label="Student" value={0} />
              <Picker.Item label="Monitor" value={1} />
              <Picker.Item label="Tutor" value={2} />
              <Picker.Item label="Hybrid" value={3} />
              <Picker.Item label="Department Head" value={4} />
              <Picker.Item label="Admin" value={5} />
            </Picker>,

            <Text key="isTeacherLabel" style={styles.label}>Is Teacher</Text>,
            <TouchableOpacity
              key="isTeacherCheckbox"
              onPress={() => setFormData({ ...formData!, isTeacher: !formData?.isTeacher })}
              style={[styles.checkbox, formData?.isTeacher ? styles.checked : styles.unchecked]}
            >
              <Text>{formData?.isTeacher ? '☑' : '☐'}</Text>
            </TouchableOpacity>,

            <TouchableOpacity key="submitBtn" style={styles.submitButton} onPress={() => handleSubmitUserForm(formData!)}>
              <Text style={styles.submitButtonText}>{isUpdateMode ? 'Update User' : 'Add User'}</Text>
            </TouchableOpacity>,

            // Delete user button
            isUpdateMode && (
              <TouchableOpacity
                key="deleteUserBtn"
                style={[styles.submitButton, styles.dangerButton]} // Apply a red button style for danger
                onPress={() => handleDeleteUser(formData!.userId)}
              >
                <Text style={styles.submitButtonText}>Delete User</Text>
              </TouchableOpacity>
            ),
          ],
        ]}
      />


      <ConfirmationModal
        visible={confirmationVisible}
        title={confirmationTitle}
        description={confirmationDescription}
        onConfirm={
          confirmationType === 'result'
            ? () => setConfirmationVisible(false) // Close modal for result
            : handleConfirmAction // Proceed with action for confirmation
        }
        onCancel={() => setConfirmationVisible(false)} // Allow cancel only for confirmation, not result
        type={confirmationType === 'result' ? 'ok' : 'yesNoDanger'} // Show OK for result, yes/no for confirmation
      />


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
  },

  headerCell: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
  },

  searchInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  searchButton: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  searchIcon: {
    width: 40,
    height: 40,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#ffc107',
    padding: 15,
    borderRadius: 50,
    elevation: 5,
    zIndex: 999, // Ensure the button is on top
  },

  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 15,
    alignItems: 'center',
  },
  userCell: {
    fontSize: 16,
    textAlign: 'center',
  },
  fixedWidthId: {
    width: 180,
  },
  fixedWidthName: {
    width: 350,
  },
  fixedWidthRole: {
    width: 250,
  },
  fixedWidthDept: {
    width: 300,
  },
  fixedWidthStaff: {
    width: 180,
  },
  fixedWidthIcon: {
    width: 120,
  },
  iconCell: {
    alignItems: 'center',
  },
  icon: {
    width: 25,
    height: 25,
    alignSelf: 'center',
  },
  tableContainer: {
    paddingBottom: 80, // Leave enough space for Add button
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  filterGroup: {
    flex: 1,
    marginHorizontal: 5,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  picker: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    height: 40,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 40,
    paddingHorizontal: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  checked: {
    backgroundColor: '#ffc107',
  },
  unchecked: {
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#ffc107', // Normal button color
    padding: 15,
    borderRadius: 5,
    marginBottom: 10, // Added margin for separation
  },
  dangerButton: {
    backgroundColor: 'red', // Red background for delete/pardon buttons
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },

});

export default UserManager;
