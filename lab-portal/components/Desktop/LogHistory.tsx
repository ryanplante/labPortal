import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import logService from '../../services/logService';
import { AuditLogType, getAllChatLogs, getAuditLogsByDate } from '../../services/auditService'; // Import updated function
import moment from 'moment';
import PlatformSpecificDateTimePicker from '../Modals/PlatformSpecificDateTimePicker';
import { convertDateToUTC, convertToLocalTime } from '../../services/helpers';
import userService from '../../services/userService';
import PlatformSpecificDatePicker from '../Modals/PlatformSpecificDatePicker';

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



    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);

                // Clear logs before fetching
                setAuditLogs([]);
                setChatLogs([]);
                setItemLogs([]);
                setStudentLogs([]);

                // Convert selectedDate to a moment object in the local timezone (Eastern Time)
                const localDate = moment.tz(selectedDate, 'America/New_York').startOf('day');
                // Now convert the localDate to UTC for start of the day
                const startOfDay = moment.utc(localDate).toISOString();

                // Convert the end of the day in the same way
                const endOfDay = moment.utc(localDate).endOf('day').toISOString();



                const [summaries, audits, chats] = await Promise.all([
                    logService.getAllSummaries(),
                    getAuditLogsByDate(selectedDate, auditLogsPage),
                    getAllChatLogs(),
                ]);

                // Process logs
                const filteredSummaries = summaries.filter(log =>
                    moment(log.timein).isBetween(startOfDay, endOfDay)
                );
                const filteredStudentLogs = filteredSummaries.filter(log => log.itemId === undefined);
                const filteredItemLogs = filteredSummaries.filter(log => log.itemId !== undefined);

                const updatedStudentLogs = await Promise.all(
                    filteredStudentLogs.map(async (log) => {
                        const studentName = await userService.getNameById(log.studentId);
                        const monitorName = await userService.getNameById(log.monitorId);
                        return { ...log, studentName, monitorName };
                    })
                );

                const updatedItemLogs = await Promise.all(
                    filteredItemLogs.map(async (log) => {
                        const studentName = await userService.getNameById(log.studentId);
                        const monitorName = await userService.getNameById(log.monitorId);
                        return { ...log, studentName, monitorName };
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

                // Update state for all logs
                setStudentLogs(updatedStudentLogs);
                setItemLogs(updatedItemLogs);
                setChatLogs(updatedChatLogs);
                setAuditLogs(updatedAuditLogs);
            } catch (err) {
                console.error('Error fetching logs:', err);
                setError('Failed to fetch logs. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [selectedDate, auditLogsPage]);


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

    const renderStudentLog = ({ item }) => (
        <View style={styles.logItem}>
            <View style={styles.logRow}>
                <Text style={styles.logText}>
                    Student: {item.studentName} ({item.studentId}), Lab ID: {item.labId}, Time In: {convertToLocalTime(item.timein)}, Time Out: {item.timeout ? convertToLocalTime(item.timeout) : 'N/A'}
                </Text>
            </View>
            <Text style={styles.timestamp}>Monitor: {item.monitorName} ({item.monitorId})</Text>
        </View>
    );

    const renderItemLog = ({ item }) => (
        <View style={styles.logItem}>
            <View style={styles.logRow}>
                <Text style={styles.logText}>
                    Item ID: {item.itemId}, Student: {item.studentName} ({item.studentId}), Lab ID: {item.labId}, Time In: {convertToLocalTime(item.timein)}, Time Out: {item.timeout ? convertToLocalTime(item.timeout) : 'N/A'}
                </Text>
            </View>
            <Text style={styles.timestamp}>Monitor: {item.monitorName} ({item.monitorId})</Text>
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
                return <FlatList data={studentLogs} renderItem={renderStudentLog} keyExtractor={(item) => item.summaryId.toString()} />;
            case 'Item Logs':
                return <FlatList data={itemLogs} renderItem={renderItemLog} keyExtractor={(item) => item.summaryId.toString()} />;
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
            <View style={styles.datePickerContainer}>
                <Text style={styles.datePickerLabel}>Filter by Date:</Text>
                <PlatformSpecificDatePicker
                    dateTime={selectedDate}
                    onDateTimeChange={(date) => setSelectedDate(date.$d)}
                />
            </View>

            <View style={styles.tabBar}>
                <TouchableOpacity onPress={() => setActiveTab('Student Logs')} style={[styles.tabButton, activeTab === 'Student Logs' && styles.activeTab]}>
                    <Text style={styles.tabText}>Student Logs</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('Item Logs')} style={[styles.tabButton, activeTab === 'Item Logs' && styles.activeTab]}>
                    <Text style={styles.tabText}>Item Logs</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('Chat Logs')} style={[styles.tabButton, activeTab === 'Chat Logs' && styles.activeTab]}>
                    <Text style={styles.tabText}>Chat Logs</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('Audit Logs')} style={[styles.tabButton, activeTab === 'Audit Logs' && styles.activeTab]}>
                    <Text style={styles.tabText}>Audit Logs</Text>
                </TouchableOpacity>
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
    logText: {
        fontSize: 16,
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
});

export default LogsHistory;
