import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import logService from '../../services/logService';
import { AuditLogType, getAllChatLogs, fetchFilteredAuditLogs } from '../../services/auditService'; // Import updated function
import moment from 'moment';
import PlatformSpecificDateTimePicker from '../Modals/PlatformSpecificDateTimePicker';
import { convertToLocalTime } from '../../services/helpers';
import userService, { User } from '../../services/userService';
import PlatformSpecificDatePicker from '../Modals/PlatformSpecificDatePicker';
import itemService from '../../services/itemService';
import labsService from '../../services/labsService';
import { getUserByToken } from '../../services/loginService';
import { Picker } from '@react-native-picker/picker';

// Map auditLogTypeId to human-readable audit log types
const auditLogTypeMap: Record<number, AuditLogType> = {
    1: 'insert',
    2: 'update',
    3: 'delete',
    4: 'login',
    5: 'logout',
    6: 'view',
    7: 'access',
    8: 'permission change',
    9: 'data export',
    10: 'information',
};


const LogsHistory = () => {
    const [activeTab, setActiveTab] = useState('Student Logs');
    const [loading, setLoading] = useState(true);
    const [studentLogs, setStudentLogs] = useState([]);
    const [itemLogs, setItemLogs] = useState([]);
    const [chatLogs, setChatLogs] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [auditLogsPage, setAuditLogsPage] = useState(1); // State to keep track of page number
    const [expandedLogId, setExpandedLogId] = useState<number | null>(null);
    const [logHistory, setLogHistory] = useState<any[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [selectedAuditLogType, setSelectedAuditLogType] = useState<number>(0);

    // Fetch user data 
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await getUserByToken();  // Fetch user data
                setUser(user);
            } catch (error) {
                console.error("Failed to fetch user privileges", error);
            }
        };
        fetchUser();
    }, []);


    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);

                // Clear logs before fetching
                setAuditLogs([]);
                setChatLogs([]);
                setItemLogs([]);
                setStudentLogs([]);
                const user = await getUserByToken();  // Fetch user data
                setUser(user);
                const localDate = moment.tz(selectedDate, 'America/New_York').startOf('day');
                const startOfDay = moment.utc(localDate).toISOString();
                const endOfDay = moment.utc(localDate).endOf('day').toISOString();
                const [summaries, audits, chats] = await Promise.all([
                    logService.getAllSummaries(user && user?.privLvl < 5 ? user.userDept : undefined),
                    fetchFilteredAuditLogs(selectedDate, selectedAuditLogType, auditLogsPage),
                    getAllChatLogs(),
                ]);

                const filteredSummaries = summaries.filter(log =>
                    moment(log.timein).isBetween(startOfDay, endOfDay)
                );
                const filteredStudentLogs = filteredSummaries.filter(log => log.itemId === undefined);
                const filteredItemLogs = filteredSummaries.filter(log => log.itemId !== undefined);

                const updatedStudentLogs = await Promise.all(
                    filteredStudentLogs.map(async (log) => {
                        const studentName = await userService.getNameById(log.studentId);
                        const monitorName = await userService.getNameById(log.monitorId);
                        const lab = await labsService.getLabById(log.labId);
                        return { ...log, studentName, monitorName, labName: lab.name };
                    })
                );

                const updatedItemLogs = await Promise.all(
                    filteredItemLogs.map(async (log) => {
                        const studentName = await userService.getNameById(log.studentId);
                        const monitorName = await userService.getNameById(log.monitorId);
                        const itemName = await itemService.getNameById(log.itemId);
                        const lab = await labsService.getLabById(log.labId);
                        return { ...log, studentName, monitorName, itemName, labName: lab.name };
                    })
                );

                const filteredChatLogs = chats.filter(log =>
                    moment(log.timestamp).isBetween(startOfDay, endOfDay)
                );

                const updatedChatLogs = await Promise.all(
                    filteredChatLogs.map(async (log) => {
                        const userName = await userService.getNameById(log.userId);
                        return { ...log, userName };
                    })
                );

                const updatedAuditLogs = await Promise.all(
                    audits.map(async (log) => {
                        const userName = await userService.getNameById(log.userID);
                        return { ...log, userName };
                    })
                );

                setAuditLogs(updatedAuditLogs);
                setStudentLogs(updatedStudentLogs);
                setItemLogs(updatedItemLogs);
                setChatLogs(updatedChatLogs);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch logs.');
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [selectedDate, auditLogsPage, selectedAuditLogType]); // Add selectedAuditLogType to the dependency array




    const fetchLogHistory = async (logId) => {
        try {
            const history = await logService.getLogHistory(logId);

            const updatedHistory = await Promise.all(
                history.map(async (log) => {
                    const itemName = log.itemId ? await itemService.getNameById(log.itemId) : null;
                    const studentName = log.studentId ? await userService.getNameById(log.studentId) : null;
                    const lab = log.labId ? await labsService.getLabById(log.labId) : null;
                    const monitorName = log.monitorId ? await userService.getNameById(log.monitorId) : null;

                    return {
                        ...log,
                        itemName,
                        studentName,
                        labName: lab ? lab.name : null,
                        monitorName
                    };
                })
            );

            setLogHistory(updatedHistory);
        } catch (error) {
            console.error("Error fetching log history:", error);
        }
    };


    const handleLogToggle = async (logId) => {
        if (expandedLogId === logId) {
            // If the log is already expanded, collapse it by setting expandedLogId to null
            setExpandedLogId(null);
        } else {
            // If the log is not expanded, fetch the log history and expand
            await fetchLogHistory(logId);
            setExpandedLogId(logId);
        }
    };


    const renderAuditPagination = () => (
        <View style={styles.paginationContainer}>
            {auditLogsPage > 1 && (
                <TouchableOpacity
                    style={styles.paginationButton}
                    onPress={() => setAuditLogsPage(auditLogsPage - 1)}
                >
                    <Text style={styles.paginationText}>Previous Page</Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity
                style={styles.paginationButton}
                onPress={() => setAuditLogsPage(auditLogsPage + 1)}
            >
                <Text style={styles.paginationText}>Next Page</Text>
            </TouchableOpacity>
        </View>
    );

    const renderChatLog = ({ item }) => (
        <View style={styles.logItem}>
            <View style={styles.logRow}>
                <Text style={styles.logText}>User: {item.userName} ({item.userId}), Message: {item.message}</Text>
            </View>
            <Text style={styles.timestamp}>Time: {convertToLocalTime(item.timestamp)}</Text>
        </View>
    );

    const renderStudentLog = ({ item }) => (
        <View style={styles.logItem}>
            <View style={styles.logRow}>
                <Text style={styles.logText}>
                    Student: {item.studentName} ({String(item.studentId).padStart(8, '0')}), Lab: {item.labName} ({item.labId}), Time In: {convertToLocalTime(item.timein)}, Time Out: {item.timeout ? convertToLocalTime(item.timeout) : 'N/A'}
                </Text>
            </View>
            <Text style={styles.timestamp}>Monitor: {item.monitorName} ({item.monitorId})</Text>

            <TouchableOpacity onPress={() => handleLogToggle(item.summaryId)}>
                <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>
                    {expandedLogId === item.summaryId ? 'Collapse History' : 'View History'}
                </Text>
            </TouchableOpacity>

            {expandedLogId === item.summaryId && (
                <View style={styles.expandedLogContainer}>
                    {logHistory.map((historyItem, index) => (
                        <View key={index} style={styles.historyItem}>
                            <Text style={styles.logText}>Transaction Type: {historyItem.transactionType}</Text>
                            <Text style={styles.logText}>Timestamp: {moment(historyItem.timestamp).format('MM/DD/YYYY, h:mm A')}</Text>
                            <Text style={styles.logText}>Lab: {historyItem.labName} ({historyItem.labId})</Text>
                            <Text style={styles.logText}>Monitor: {historyItem.monitorName} ({historyItem.monitorId})</Text>
                            <Text style={styles.logText}>Student: {historyItem.studentName} ({historyItem.studentId})</Text>
                            <Text style={styles.logText}>Is Scanned: {historyItem.isScanned ? 'Yes' : 'No'}</Text>
                            {historyItem.itemId && <Text style={styles.logText}>Item Borrowed: {historyItem.itemName}</Text>}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );



    const renderItemLog = ({ item }) => (
        <View style={styles.logItem}>
            <View style={styles.logRow}>
                <Text style={styles.logText}>
                    Item Borrowed: {item.itemName}, Student: {item.studentName} ({String(item.studentId).padStart(8, '0')}), Lab: {item.labName} ({item.labId}), Time In: {convertToLocalTime(item.timein)}, Time Out: {item.timeout ? convertToLocalTime(item.timeout) : 'N/A'}
                </Text>
            </View>
            <Text style={styles.timestamp}>Monitor: {item.monitorName} ({item.monitorId})</Text>

            <TouchableOpacity onPress={() => handleLogToggle(item.summaryId)}>
                <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>
                    {expandedLogId === item.summaryId ? 'Collapse History' : 'View History'}
                </Text>
            </TouchableOpacity>

            {expandedLogId === item.summaryId && (
                <View style={styles.expandedLogContainer}>
                    {logHistory.map((historyItem, index) => (
                        <View key={index} style={styles.historyItem}>
                            <Text style={styles.logText}>Transaction Type: {historyItem.transactionType}</Text>
                            <Text style={styles.logText}>Timestamp: {moment(historyItem.timestamp).format('MM/DD/YYYY, h:mm A')}</Text>
                            <Text style={styles.logText}>Lab: {historyItem.labName} ({historyItem.labId})</Text>
                            <Text style={styles.logText}>Monitor: {historyItem.monitorName} ({historyItem.monitorId})</Text>
                            <Text style={styles.logText}>Student: {historyItem.studentName} ({historyItem.studentId})</Text>
                            <Text style={styles.logText}>Is Scanned: {historyItem.isScanned ? 'Yes' : 'No'}</Text>
                            {historyItem.itemId && <Text style={styles.logText}>Item Borrowed: {historyItem.itemName}</Text>}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );


    const renderAuditLog = ({ item }) => {
        const auditLogTypeName = auditLogTypeMap[item.auditLogTypeId];

        return (
            <View style={styles.logItem}>
                <View style={styles.logRow}>
                    <Text style={styles.logText}>Audit Type: {auditLogTypeName}, Description: {item.description}</Text>
                </View>
                <Text style={styles.timestamp}>User: {item.userName} ({item.userID}), Time: {convertToLocalTime(item.timestamp)}</Text>
            </View>
        );
    };

    const renderLogsList = () => {
        if (loading) {
            return <ActivityIndicator size="large" color="#ffc107" />;  // Custom loading color
        }

        if (error) {
            return <Text style={styles.error}>{error}</Text>;
        }

        switch (activeTab) {
            case 'Student Logs':
                return (
                    <>
                        <FlatList data={studentLogs} renderItem={renderStudentLog} keyExtractor={(item) => item.summaryId.toString()} />
                    </>
                );
            case 'Item Logs':
                return (
                    <>
                        <FlatList data={itemLogs} renderItem={renderItemLog} keyExtractor={(item) => item.summaryId.toString()} />
                    </>
                )
            case 'Chat Logs':
                return <FlatList data={chatLogs} renderItem={renderChatLog} keyExtractor={(item) => item.timestamp} />;
            case 'Audit Logs':
                return (
                    <>
                        <FlatList
                            data={auditLogs}
                            renderItem={renderAuditLog}
                            keyExtractor={(item) => item.timestamp}
                        />
                        {renderAuditPagination()}
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.filterContainer}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.datePickerLabel}>Filter by Date:</Text>
                    <PlatformSpecificDatePicker
                        dateTime={selectedDate}
                        onDateTimeChange={(date) => setSelectedDate(date.$d)}
                    />
                </View>
                {activeTab === 'Audit Logs' && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.filterLabel}>Filter by Type:</Text>
                        <Picker
                            selectedValue={selectedAuditLogType}
                            onValueChange={(itemValue) => {
                                setSelectedAuditLogType(itemValue);
                                setAuditLogsPage(1); // Reset the page to 1 when audit log type changes
                            }}
                            style={styles.picker}
                        >
                            <Picker.Item label="All" value={0} />
                            <Picker.Item label="Insert" value={1} />
                            <Picker.Item label="Update" value={2} />
                            <Picker.Item label="Delete" value={3} />
                            <Picker.Item label="Login" value={4} />
                            <Picker.Item label="Logout" value={5} />
                            <Picker.Item label="View" value={6} />
                            <Picker.Item label="Access" value={7} />
                            <Picker.Item label="Permission Change" value={8} />
                            <Picker.Item label="Data Export" value={9} />
                            <Picker.Item label="Information" value={10} />
                        </Picker>

                    </View>
                )}
            </View>




            <View style={styles.tabBar}>
                <TouchableOpacity onPress={() => setActiveTab('Student Logs')} style={[styles.tabButton, activeTab === 'Student Logs' && styles.activeTab]}>
                    <Text style={styles.tabText}>Student Logs</Text>
                </TouchableOpacity>
                {user && user?.privLvl != 2 && (  // Render items tab only if they're not a tutor
                    <TouchableOpacity onPress={() => setActiveTab('Item Logs')} style={[styles.tabButton, activeTab === 'Item Logs' && styles.activeTab]}>
                        <Text style={styles.tabText}>Item Logs</Text>
                    </TouchableOpacity>
                )}
                {user && user?.privLvl >= 2 && (  // Only render Chat Logs for tutors
                    <TouchableOpacity onPress={() => setActiveTab('Chat Logs')} style={[styles.tabButton, activeTab === 'Chat Logs' && styles.activeTab]}>
                        <Text style={styles.tabText}>Chat Logs</Text>
                    </TouchableOpacity>
                )}

                {user && user?.privLvl === 5 && (  // Only render Audit Logs for admin
                    <TouchableOpacity onPress={() => setActiveTab('Audit Logs')} style={[styles.tabButton, activeTab === 'Audit Logs' && styles.activeTab]}>
                        <Text style={styles.tabText}>Audit Logs</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.logsContainer}>
                {renderLogsList()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f4f4f4',
    },
    datePickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    datePickerLabel: {
        marginRight: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    tabButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#ffa500',
    },
    tabText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    logsContainer: {
        flex: 1,
    },
    logItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    logRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    expandedLogContainer: {
        paddingLeft: 10,
        marginTop: 10,
        backgroundColor: '#f9f9f9',  // Optional: light background for contrast
        borderRadius: 5,             // Optional: rounded corners for the entire expanded section
    },
    historyItem: {
        padding: 10,
        borderBottomWidth: 1,        // Add a separator between history items
        borderBottomColor: '#ddd',   // Light gray border color
        marginBottom: 10,            // Space between items
        backgroundColor: '#fff',     // White background for each history item
        borderRadius: 5,             // Rounded corners for each individual item (optional)
    },
    logText: {
        fontSize: 14,
        color: '#333',
    },
    timestamp: {
        fontSize: 12,
        color: '#999',
        marginTop: 5,
    },
    error: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    paginationButton: {
        padding: 10,
        backgroundColor: '#ffa500',
        borderRadius: 5,
    },
    paginationText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Ensures the date picker is on the left and the filter on the right
        alignItems: 'center',
        marginBottom: 20,
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10,
    },
    picker: {
        height: 50,
        width: 200,
    },
});

export default LogsHistory;
