import React, { useEffect, useState, useRef } from "react";
import { FlatList, TouchableOpacity, View, Text, StyleSheet } from "react-native";
import * as SignalR from "@microsoft/signalr";
import ActionsModal from "../Modals/ActionsModal";
import ConfirmationModal from "../Modals/ConfirmationModal";

const Admin = () => {
  const connectedUsersRef = useRef<any[]>([]); // Ref to store connected users without triggering re-renders
  const [connectedUsers, setConnectedUsers] = useState<any[]>([]); // State to trigger re-render for FlatList
  const connectionRef = useRef<SignalR.HubConnection | null>(null); // Reference for SignalR connection
  const [selectedUser, setSelectedUser] = useState<any>(null); // Selected user for actions
  const [isActionsModalVisible, setActionsModalVisible] = useState<boolean>(false); // Control visibility of actions modal
  const [isKickConfirmationVisible, setKickConfirmationVisible] = useState<boolean>(false); // Kick confirmation modal

  useEffect(() => {
    const connectToHub = async () => {
      // Initialize the SignalR connection for admin
      const connection = new SignalR.HubConnectionBuilder()
        .withUrl(process.env.EXPO_PUBLIC_SOCKET)
        .configureLogging(SignalR.LogLevel.Information)
        .build();

      connection.on("connectedUsers", (users) => {
        // Filter out any invalid users without a UserId
        const validUsers = users.filter((user) => user?.UserId);
        console.log(validUsers)
        connectedUsersRef.current = validUsers; // Store valid users in ref
        setConnectedUsers([...connectedUsersRef.current]); // Trigger re-render with updated users
      });

      try {
        await connection.start();
        connectionRef.current = connection;

        // Fetch the connected users
        await connection.invoke("GetConnectedUsers");
      } catch (error) {
        console.error("Failed to connect to the SignalR hub", error);
      }
    };

    connectToHub();

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop(); // Cleanup the connection
      }
    };
  }, []);

  const refreshConnectedUsers = async () => {
    const connection = connectionRef.current;
    if (connection) {
      try {
        await connection.invoke("GetConnectedUsers"); // Re-fetch the users
        setConnectedUsers([...connectedUsersRef.current]); // Update state with ref data to trigger re-render
        console.log(connectedUsersRef.current);
      } catch (err) {
        console.error("Error refreshing users:", err);
      }
    }
  };

  const handleKickUser = async () => {
    const connection = connectionRef.current;
    if (connection && selectedUser) {
      try {
        await connection.invoke("KickUser", selectedUser.UserId); // Invoke the KickUser method on the server
        setKickConfirmationVisible(false); // Close the kick confirmation modal after kicking
      } catch (err) {
        console.error("Error kicking user:", err);
      }
    }
  };

  const handleUserPress = (user) => {
    setSelectedUser(user); // Set the selected user for actions
    setActionsModalVisible(true); // Open the actions modal
  };

  const handleKickAction = () => {
    setActionsModalVisible(false); // Close the actions modal
    setKickConfirmationVisible(true); // Open the kick confirmation modal
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Panel - Connected Users</Text>

      {/* Refresh Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={refreshConnectedUsers}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>

      <FlatList
        data={connectedUsers}
        keyExtractor={(item, index) => item?.UserId?.toString() || index.toString()} // Use UserId or fallback to array index
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleUserPress(item)}>
            <View style={styles.userRow}>
              <Text style={styles.userText}>
                {item.FName} {item.LName} (User ID: {item.UserId}) - {item.PrivLvl >= 2 ? "Tutor" : "Student"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No connected users</Text>} // Show when there are no users
      />

      {/* Actions Modal */}
      <ActionsModal
        visible={isActionsModalVisible}
        onClose={() => setActionsModalVisible(false)}
        actionButtons={[
          {
            icon: require('../../assets/kick.png'),
            onPress: handleKickAction,
            disabled: false, // Enable the Kick action
          },
        ]}
      />

      {/* Kick Confirmation Modal */}
      <ConfirmationModal
        visible={isKickConfirmationVisible}
        title="Confirm Kick"
        description={`Are you sure you want to kick ${selectedUser?.FName} ${selectedUser?.LName}?`}
        onConfirm={handleKickUser}
        onCancel={() => setKickConfirmationVisible(false)}
        type="yesNoDanger"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  refreshButton: {
    backgroundColor: '#ffc107',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  userText: {
    fontSize: 16,
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});

export default Admin;
