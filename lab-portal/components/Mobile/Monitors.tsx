import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, FlatList, ScrollView } from 'react-native';
import ActionsModal from '../Modals/ActionsModal';  // Adjust the path as needed
import userService, { User } from '../../services/userService';  // Adjust the path as needed
import EditUserModal from '../Modals/editUserModal'; // Adjust the path as needed
import FuzzySearchModal from '../Modals/FuzzySearchModal';
import ConfirmMonitorModal from '../Modals/ConfirmMonitorModal';


const MobileLabs = () => {
    const [users, setUsers] = useState([]);
    const [isActionsMenuVisible, setActionsMenuVisible] = useState(false);
    const [itemForAction, setItemForAction] = useState<User | null>(null);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [isSearchModalVisible, setSearchModalVisible] = useState(false);
    const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await userService.getAllUsers();
                const allUsers = response["$values"];
                const filteredUsers = allUsers.filter((user: { position: number; }) => user.position === 0 || user.position === 1 || user.position === 2);
                setUsers(filteredUsers);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };

        fetchUsers();
    }, []);

    const openActionsMenu = (user: User) => {
        setItemForAction(user);
        setActionsMenuVisible(true);
    };

    const handleEdit = (user: User) => {
      setItemForAction(user);  // Set the user to be edited
      setEditModalVisible(true);  // Open the edit modal
    };

    const handleSave = async (updatedUser: User) => {
        try {
          await userService.updateUser(updatedUser.userId, updatedUser);

          setConfirmModalVisible(false);

            const response = await userService.getAllUsers();
            const allUsers = response["$values"];
            const filteredUsers = allUsers.filter((user: { position: number; }) => user.position === 0 || user.position === 1 || user.position === 2);
            setUsers(filteredUsers);
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    };

    const handleDelete = async (user: User) => {
        if (user) {
            const updatedUser = { ...user, position: null }; // Set position to NULL
            try {
                await handleSave(updatedUser);  // Save the updated user
            } catch (error) {
                console.error('Failed to update user:', error);
            }
        }
        console.log("Demoted User:", user);
    };

    const actionButtons = [
        {
            icon: require('../../assets/edit.png'),
            onPress: () => {
                setActionsMenuVisible(false);
                handleEdit(itemForAction!);
            },
        },
        {
            icon: require('../../assets/trash.png'),
            onPress: () => {
                setActionsMenuVisible(false);
                handleDelete(itemForAction!);
            },
        },
    ];

    const handleSelectUser = (user: User) => {
      setItemForAction(user);
      setSearchModalVisible(false);
      setConfirmModalVisible(true);
  };

    return (
      <SafeAreaView style={styles.container}>
          <View style={styles.headerContainer}>
              <Text style={styles.header}>[Department] Lab Monitors & Tutors</Text>
          </View>
          <Text style={styles.subHeader}>Current Monitors & Tutors</Text>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <FlatList
                data={users}
                keyExtractor={(item) => item.userId.toString()}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => openActionsMenu(item)}
                        style={styles.tableRow}
                    >
                        <Text style={styles.tableCell}>{item.userId}</Text>
                        <Text style={styles.tableCell}>{item.fName} {item.lName}</Text>
                        <Text style={styles.tableCell}>{item.position === 0 ? "Tutor" : item.position === 1 ? "Monitor" : item.position === 2 ? "Monitor/Tutor" : ""}</Text>
                    </TouchableOpacity>
                )}
            />
          <TouchableOpacity style={styles.addButton} onPress={() => setSearchModalVisible(true)}>
              <Text style={styles.addButtonText}>Add New Monitor/Tutor</Text>
          </TouchableOpacity>
          </ScrollView>
          <ActionsModal
              visible={isActionsMenuVisible}
              onClose={() => setActionsMenuVisible(false)}
              actionButtons={actionButtons}
          />
          <EditUserModal
              visible={isEditModalVisible}
              user={itemForAction}
              onClose={() => setEditModalVisible(false)}
              onSave={handleSave}
          />
          <FuzzySearchModal
              visible={isSearchModalVisible}
              onClose={() => setSearchModalVisible(false)}
              onSelectUser={handleSelectUser}
          />
          <ConfirmMonitorModal
              visible={isConfirmModalVisible}
              user={itemForAction}
              onClose={() => setConfirmModalVisible(false)}
              onSave={handleSave}
          />
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      padding: 20,
      backgroundColor: 'white',
  },
  headerContainer: {
      backgroundColor: '#004A8F',
      paddingVertical: 20,
      alignItems: 'center',
      marginBottom: 20,
  },
  header: {
      color: 'white',
      fontSize: 24,
      fontWeight: 'bold',
  },
  subHeader: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
  },
  scrollViewContent: {
    paddingHorizontal: 20,  // Add padding around the content
},
  listContainer: {
    marginHorizontal: 20,  // Add padding around the entire list
},
  tableRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderColor: '#ccc',
      paddingHorizontal: 10,
  },
  tableCell: {
      fontSize: 16,
      flex: 1,
      textAlign: 'left',
  },
  iconContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: 80,
  },
  icon: {
      width: 24,
      height: 24,
  },
  addButton: {
      backgroundColor: '#ffc107',
      padding: 15,
      borderRadius: 5,
      alignSelf: 'center',
      marginTop: 20,
      width: '60%',
      alignItems: 'center',
  },
  addButtonText: {
      color: '#000',
      fontSize: 18,
      fontWeight: 'bold',
  }
});

export default MobileLabs;
