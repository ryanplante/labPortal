import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import * as SignalR from '@microsoft/signalr';
import { getUserByToken } from '../../services/loginService';
import { crossPlatformAlert } from '../../services/helpers';
import ActionsModal from '../Modals/ActionsModal';
import ConfirmationModal from '../Modals/ConfirmationModal';
import { useFocusEffect } from '@react-navigation/native';
import { User } from '../../services/userService';
import { CreateErrorLog } from '../../services/errorLogService';

const Chat = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState<string>('');
  const [status, setStatus] = useState<string>('Connecting...');
  const connectedTo = useRef<string | null>(null);
  const [waitingMessage, setWaitingMessage] = useState<string>('No Students available at this time!');
  const [available, setAvailable] = useState<boolean>(false);
  const [disconnected, setDisconnected] = useState<boolean>(false);
  const connectionRef = useRef<SignalR.HubConnection | null>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isActionsModalVisible, setActionsModalVisible] = useState<boolean>(false);
  const [isKickConfirmationVisible, setKickConfirmationVisible] = useState<boolean>(false);
  const [kicked, setKicked] = useState<boolean>(false);
  const [rejoin, setRejoin] = useState<boolean>(false);
  const pingIntervalRef = useRef<any>(null);

  useEffect(() => {
    const init = async () => {
      const fetchedUser = await fetchUserData();
      if (fetchedUser) {
        connectToChatHub(fetchedUser);
      }
    };
    if (!disconnected) {
      init();
    } else {
      return () => {
        disconnectFromChatHub();
        setStatus("Disconnected from chat");
        setAvailable(false);
        setDisconnected(true);
      };
    }
  }, [disconnected]);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setStatus("Disconnected from chat");
        disconnectFromChatHub();
        setAvailable(false);
        setDisconnected(true);
      };
    }, [])
  );

  const connectToChatHub = async (fetchedUser: User) => {
    const connection = new SignalR.HubConnectionBuilder()
      .withUrl(process.env.EXPO_PUBLIC_SOCKET)
      .configureLogging(SignalR.LogLevel.Information)
      .build();

    connection.on('requestUserInfo', () => {
      connection.invoke('JoinChatLobby', fetchedUser.userId);
    });

    connection.on('movedToRoom', (connectedUserName) => {
      setStatus(`Connected to ${connectedUserName}`);
      connectedTo.current = connectedUserName;
      setWaitingMessage('');
      setAvailable(true);
      setDisconnected(false);
    });
    // Kicked socket
    connection.on('kicked', (kickMessage) => {
      setKicked(true);
      setWaitingMessage(kickMessage);
      setAvailable(false);
    });

    connection.on('duplicateUser', (message) => {
      setWaitingMessage(message);
      setAvailable(false);
      setDisconnected(true);
    });

    connection.on('receiveMessage', (userId, message, role) => {
      const isCurrentUser = userId === fetchedUser.userId;
      const messageObj = {
        userId,
        message,
        role,
        displayName: isCurrentUser ? 'You' : role ? `${role} ${connectedTo.current}` : connectedTo.current,
      };
      setMessages((prevMessages) => [...prevMessages, messageObj]);
    });

    connection.on('waitingForMatch', (message) => {
      setAvailable(false);
      setWaitingMessage(message);
    });

    connection.on('disconnectUser', (reason) => {
      setStatus(reason)
      setRejoin(true);
    });

    try {
      await connection.start();
      setStatus('Connecting...');
      connectionRef.current = connection;

      // Start pinging the server every 5 seconds to keep the connection alive
      pingIntervalRef.current = setInterval(() => {
        connection.invoke('Ping');
      }, 5000);
    } catch (error: any) {
      // Log the error using the error service
      await CreateErrorLog(
        error, 
        'Chat Connection', // Source of the error
        user?.userId || null, // User ID, if available
        'error' // Type of the error log
      );
    }
  };

  const disconnectFromChatHub = () => {
    if (connectionRef.current) {
      connectionRef.current.invoke('LeaveChatLobby').finally(() => {
        connectionRef.current?.stop();
        connectionRef.current = null;
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
      });
    }
  };

  const handleReconnect = () => {
    setMessages([]); // Clear chat history
    setDisconnected(false);
  };

  const handleRejoin = () => {
    const connection = connectionRef.current;
    setMessages([]); // Clear chat history
    if (connection && user) {
      connection.invoke('JoinChatLobby', user.userId);
    }
    setRejoin(false);
  }

  const handleSend = async () => {
    if (input.trim() !== '') {
      const connection = connectionRef.current;
      if (connection) {
        try {
          await connection.invoke('SendMessage', input);
          setInput('');
        } catch (err) {
          console.error('Error sending message: ', err);
        }
      }
    }
  };

  const fetchUserData = async () => {
    try {
      const user = await getUserByToken();
      setUser(user);
      return user;
    } catch (error) {
      crossPlatformAlert('Error', error);
    }
    return null;
  };

  // Handle the selection of a message for the actions modal
  const handleMessagePress = (message: any) => {
    if (user.privLvl >= 2 && message.userId != user.userId) {
      setSelectedMessage(message);
      setActionsModalVisible(true);
    }
  };

  const handleKickUser = () => {
    setKickConfirmationVisible(true);
    setActionsModalVisible(false);
    setAvailable(true);
  };

  const confirmKick = async () => {
    if (connectionRef.current && selectedMessage) {
      setKickConfirmationVisible(false);
      await connectionRef.current.invoke('KickUser', selectedMessage.userId);
    }
  };

  return (
    <View style={styles.container}>
      {!available ? (
        <View style={styles.unavailableContainer}>
          <Text style={styles.unavailableText}>{waitingMessage}</Text>
          {disconnected && (
            <TouchableOpacity style={styles.reconnectButton} onPress={handleReconnect}>
              <Text style={styles.reconnectButtonText}>Reconnect</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <>
          <Text style={styles.header}>Chat - Status: {status}</Text>
          {rejoin && (
            <TouchableOpacity style={styles.reconnectButton} onPress={handleRejoin}>
              <Text style={styles.reconnectButtonText}>Reconnect</Text>
            </TouchableOpacity>
          )}

          <FlatList
            data={messages}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleMessagePress(item)}>
                <View style={styles.messageRow}>
                  <Text style={styles.messageText}>
                    {item.displayName}: {item.message}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type here..."
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
              readOnly={rejoin} // Disable input if rejoin is true
            />
            <TouchableOpacity
              style={[styles.sendButton, rejoin ? styles.disabledButton : null]}
              onPress={handleSend}
              disabled={rejoin} // Disable button if rejoin is true
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>

        </>
      )}

      <ActionsModal
        visible={isActionsModalVisible}
        onClose={() => setActionsModalVisible(false)}
        actionButtons={[
          {
            icon: require('../../assets/kick.png'),
            onPress: handleKickUser,
            disabled: !(user?.privLvl >= 2 || user?.isTeacher),
          },
        ]}
      />

      <ConfirmationModal
        visible={isKickConfirmationVisible}
        title="Confirm Kick"
        description="Are you sure you want to kick this user from the chat?"
        onConfirm={confirmKick}
        onCancel={() => setKickConfirmationVisible(false)}
        type="yesNoDanger"
      />

      <ConfirmationModal
        visible={kicked}
        title="You have been kicked"
        description="You have been kicked from the chat."
        onConfirm={() => setKicked(false)}
        onCancel={() => []}
        type="ok"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  messageRow: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  messageText: { fontSize: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginRight: 10 },
  sendButton: { backgroundColor: '#ffc107', padding: 10, borderRadius: 5 },
  sendButtonText: { color: '#fff', fontSize: 16 },
  unavailableContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  unavailableText: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  reconnectButton: { backgroundColor: '#ffc107', padding: 10, marginTop: 20, borderRadius: 5 },
  reconnectButtonText: { color: '#000', fontSize: 16, textAlign: 'center' },
  disabledButton: {
    backgroundColor: '#d3d3d3' // Light gray color for disabled state
  }
});

export default Chat;
