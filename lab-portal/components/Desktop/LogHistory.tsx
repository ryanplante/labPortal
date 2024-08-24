import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import ConfirmationModal from '../Modals/ConfirmationModal'; // Assuming this is your modal component
import LogService from '../../services/logService'; // Assuming LogService handles the API calls

const LogHistory = () => {
    const [activeTab, setActiveTab] = useState<'students' | 'items'>('students');
    const [logs, setLogs] = useState([]); // Will hold the logs data
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null); // This will hold the log data to be edited or added

    const loadLogs = async () => {
        try {
            const data = await LogService.getLogs(activeTab);
            setLogs(data);
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };

    const handleTabChange = (tab: 'students' | 'items') => {
        setActiveTab(tab);
        loadLogs();
    };

    const handleEditClick = (log) => {
        setSelectedLog(log);
        setIsModalVisible(true);
    };

    const handleNewLog = () => {
        setSelectedLog(null);
        setIsModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'students' && styles.activeTab]}
                    onPress={() => handleTabChange('students')}
                >
                    <Text style={styles.tabText}>Students</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'items' && styles.activeTab]}
                    onPress={() => handleTabChange('items')}
                >
                    <Text style={styles.tabText}>Items</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.logsContainer}>
                {logs.map((log, index) => (
                    <View key={index} style={styles.logRow}>
                        <Text style={styles.logText}>{log.studentName || log.itemName}</Text>
                        <Text style={styles.logText}>{log.studentId || log.itemId}</Text>
                        <Text style={styles.logText}>{log.timeIn}</Text>
                        <TouchableOpacity onPress={() => handleEditClick(log)}>
                            <Image source={require('../../assets/edit.png')} style={styles.editIcon} />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            <TouchableOpacity style={styles.newLogButton} onPress={handleNewLog}>
                <Text style={styles.newLogButtonText}>New Log</Text>
            </TouchableOpacity>

            <ConfirmationModal
                visible={isModalVisible}
                onConfirm={() => setIsModalVisible(false)}
                onCancel={() => setIsModalVisible(false)}
                type="ok"
                title={<Text>Edit or Add New Log</Text>}
                description={<Text>Details will go here in the form...</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    tabButton: {
        padding: 15,
        backgroundColor: '#d3d3d3',
        borderRadius: 5,
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    activeTab: {
        backgroundColor: '#ffc107',
    },
    tabText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    logsContainer: {
        flex: 1,
    },
    logRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    logText: {
        fontSize: 14,
        flex: 1,
    },
    editIcon: {
        width: 20,
        height: 20,
    },
    newLogButton: {
        padding: 15,
        backgroundColor: '#ffc107',
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    newLogButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default LogHistory;
