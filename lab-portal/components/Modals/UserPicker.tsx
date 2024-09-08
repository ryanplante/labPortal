import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Picker } from 'react-native';
import UserService from '../../services/userService'; // Service to fetch user data
import { getUserByToken } from '../../services/loginService'; // To get the logged-in user

interface UserPickerProps {
  selectedUser: number | null; // Tracks selected user
  onUserChange: (userId: number | null) => void; // Callback to parent component when a user is selected
  readOnly?: boolean; 
}

const UserPicker = ({ selectedUser, onUserChange, readOnly = false }: UserPickerProps) => {
  const [users, setUsers] = useState([]); // Holds the filtered users
  const [loading, setLoading] = useState(true); // Loading state for fetching users

  // Fetch users based on logged-in user's department
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const loggedInUser = await getUserByToken(); // Get logged-in user
        const departmentId = loggedInUser.userDept; // Get department ID

        // Fetch all users
        const usersResponse = await UserService.getAllUsers();
        // Access the $values property to get the actual array of users
        const users = usersResponse.$values;
        // Filter users by department, isTeacher, or privLvl >= 1
        const filteredUsers = users.filter(
            user => (user.isTeacher || user.privLvl >= 1) && user.userDept == loggedInUser.userDept
        )
        setUsers(filteredUsers); // Set filtered users
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchUsers();
  }, []); // Fetch users when the component mounts

  if (loading) {
    return <Text>Loading users...</Text>; // Display loading state
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select User</Text>
      <Picker
        selectedValue={selectedUser !== null ? selectedUser : undefined} // Use undefined when selectedUser is null
        style={styles.picker}
        onValueChange={(userId) => onUserChange(userId)} // Callback when a user is selected
        enabled = {!readOnly}
      >
        <Picker.Item label="Select User" value={undefined} /> {/* Placeholder option */}
        {/* Map over the filtered users to display fname and lname */}
        {users.map((user) => (
          <Picker.Item key={user.userId} label={`${user.fName} ${user.lName}`} value={user.userId} />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: '100%',
  },
});

export default UserPicker;
