import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import userService, { User, BanCreateDto } from '../../services/userService';
import ConfirmationModal from '../Modals/ConfirmationModal';
import DynamicForm from '../Modals/DynamicForm';

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banExpiration, setBanExpiration] = useState('');
  const [showBanModal, setShowBanModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false); // State for showing user creation/update form
  const [isUpdateMode, setIsUpdateMode] = useState(false); // To check if we are updating or creating a user
  const [searchQuery, setSearchQuery] = useState(''); // Search query for fuzzy search

  const emptyUser: User = {
    userId: 0,
    fName: '',
    lName: '',
    userDept: 0,
    privLvl: 1,
    position: 1,
    isTeacher: false,
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const users = await userService.getAllUsers();
      setUsers(users);
    } catch (error) {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUsers = async () => {
    if (searchQuery) {
      try {
        const searchResults = await userService.fuzzySearchById(Number(searchQuery));
        setUsers(searchResults);
      } catch (error) {
        setError('No users found.');
      }
    } else {
      fetchUsers(); // If search query is empty, fetch all users
    }
  };

  const handleResetPassword = async () => {
    if (selectedUser) {
      try {
        await userService.updatePassword(selectedUser.userId, 'password');
        alert('Password reset to "password"');
      } catch (error) {
        alert('Failed to reset password.');
      }
    }
  };

  const handleUnlockAccount = async () => {
    if (selectedUser) {
      try {
        await userService.unlockAccount(selectedUser.userId);
        alert('Account unlocked.');
      } catch (error) {
        alert('Failed to unlock account.');
      }
    }
  };

  const handleCheckBanStatus = async () => {
    if (selectedUser) {
      try {
        const ban = await userService.checkUserBan(selectedUser.userId);
        if (ban) {
          alert(`User is banned for reason: ${ban.reason}, expires: ${ban.expirationDate}`);
        } else {
          alert('User is not banned.');
        }
      } catch (error) {
        alert('Failed to check ban status.');
      }
    }
  };

  const handleBanUser = async () => {
    if (selectedUser && banReason && banExpiration) {
      const banDto: BanCreateDto = {
        userId: selectedUser.userId,
        reason: banReason,
        expirationDate: new Date(banExpiration),
      };
      try {
        await userService.createBan(banDto);
        alert('User banned successfully.');
        setShowBanModal(false);
      } catch (error) {
        alert('Failed to ban user.');
      }
    }
  };

  const openBanModal = (user: User) => {
    setSelectedUser(user);
    setShowBanModal(true);
  };

  const openUnlockModal = (user: User) => {
    setSelectedUser(user);
    setShowUnlockModal(true);
  };

  const openUserForm = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setIsUpdateMode(true);
    } else {
      setSelectedUser(emptyUser); // For new user creation
      setIsUpdateMode(false);
    }
    setShowUserForm(true);
  };

  const handleSaveUser = async (userData: User) => {
    if (isUpdateMode && selectedUser) {
      // Update user
      try {
        await userService.updateUser(selectedUser.userId, userData);
        alert('User updated successfully');
        fetchUsers(); // Refresh user list
      } catch (error) {
        alert('Failed to update user');
      }
    } else {
      // Create new user
      try {
        await userService.createUser(userData);
        alert('User created successfully');
        fetchUsers(); // Refresh user list
      } catch (error) {
        alert('Failed to create user');
      }
    }
    setShowUserForm(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>User Management</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by User ID"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearchUsers}>
        <Text>Search</Text>
      </TouchableOpacity>

      {/* Create User Button */}
      <TouchableOpacity style={styles.createButton} onPress={() => openUserForm()}>
        <Text>Create New User</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {users.map((user) => (
        <View key={user.userId} style={styles.userRow}>
          <Text style={styles.userName}>
            {user.fName} {user.lName}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.button} onPress={() => openUserForm(user)}>
              <Text>Update User</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => handleResetPassword(user)}>
              <Text>Reset Password</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => openUnlockModal(user)}>
              <Text>Unlock Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => openBanModal(user)}>
              <Text>Ban User</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => handleCheckBanStatus(user)}>
              <Text>Check Ban Status</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Confirmation Modal for Unlocking */}
      <ConfirmationModal
        visible={showUnlockModal}
        title="Unlock Account"
        description="Are you sure you want to unlock this account?"
        onConfirm={handleUnlockAccount}
        onCancel={() => setShowUnlockModal(false)}
        type="yesNo"
      />

      {/* DynamicForm for Creating/Updating Users */}
      <DynamicForm
        visible={showUserForm}
        title={isUpdateMode ? 'Update User' : 'Create User'}
        onClose={() => setShowUserForm(false)}
        components={[
          [
            <TextInput
              key="fName"
              placeholder="First Name"
              style={styles.input}
              value={selectedUser?.fName}
              onChangeText={(text) => setSelectedUser((prev) => prev && { ...prev, fName: text })}
            />,
            <TextInput
              key="lName"
              placeholder="Last Name"
              style={styles.input}
              value={selectedUser?.lName}
              onChangeText={(text) => setSelectedUser((prev) => prev && { ...prev, lName: text })}
            />,
            <TextInput
              key="userDept"
              placeholder="User Department"
              style={styles.input}
              value={String(selectedUser?.userDept)}
              onChangeText={(text) => setSelectedUser((prev) => prev && { ...prev, userDept: Number(text) })}
            />,
            <TextInput
              key="privLvl"
              placeholder="Privilege Level"
              style={styles.input}
              value={String(selectedUser?.privLvl)}
              onChangeText={(text) => setSelectedUser((prev) => prev && { ...prev, privLvl: Number(text) })}
            />,
            <TextInput
              key="position"
              placeholder="Position"
              style={styles.input}
              value={String(selectedUser?.position)}
              onChangeText={(text) => setSelectedUser((prev) => prev && { ...prev, position: Number(text) })}
            />,
            <TextInput
              key="isTeacher"
              placeholder="Is Teacher (true/false)"
              style={styles.input}
              value={String(selectedUser?.isTeacher)}
              onChangeText={(text) => setSelectedUser((prev) => prev && { ...prev, isTeacher: text === 'true' })}
            />,
          ],
        ]}
        tabs={['User Details']}
        activeTabIndex={0}
        onConfirm={() => handleSaveUser(selectedUser!)} // Save user on confirm
      />

      {/* DynamicForm for Banning User */}
      <DynamicForm
        visible={showBanModal}
        title="Ban User"
        onClose={() => setShowBanModal(false)}
        components={[
          [
            <TextInput
              key="reason"
              placeholder="Reason for ban"
              style={styles.input}
              value={banReason}
              onChangeText={setBanReason}
            />,
            <TextInput
              key="expiration"
              placeholder="Ban expiration date (YYYY-MM-DD)"
              style={styles.input}
              value={banExpiration}
              onChangeText={setBanExpiration}
            />,
          ],
        ]}
        tabs={['Ban Details']}
        activeTabIndex={0}
        onConfirm={handleBanUser} // Ban user on confirm
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  searchButton: {
    backgroundColor: '#ffc107',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#007bff',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  userName: {
    fontSize: 18,
  },
  actions: {
    flexDirection: 'row',
  },
  button: {
    backgroundColor: '#ffc107',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  errorText: {
    color: 'red',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
});

export default UserManagement;
