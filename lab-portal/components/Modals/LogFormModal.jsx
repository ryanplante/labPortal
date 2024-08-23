import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';

const LogFormModal = ({ visible, onClose, onSave, log }) => {
    const [studentId, setStudentId] = React.useState(log?.studentId || '');
    const [studentName, setStudentName] = React.useState(log?.studentName || '');
    const [timeIn, setTimeIn] = React.useState(log?.timeIn || '');
    const [timeOut, setTimeOut] = React.useState(log?.timeOut || '');

    return (
        <Modal
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <Text style={styles.title}>{log ? 'Edit Entry' : 'Add New Entry'}</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Student ID"
                    value={studentId}
                    onChangeText={setStudentId}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Student Name"
                    value={studentName}
                    onChangeText={setStudentName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Time In"
                    value={timeIn}
                    onChangeText={setTimeIn}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Time Out"
                    value={timeOut}
                    onChangeText={setTimeOut}
                />
                <TouchableOpacity style={styles.button} onPress={() => onSave({ studentId, studentName, timeIn, timeOut })}>
                    <Text style={styles.buttonText}>{log ? 'Update' : 'Add'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#ffc107',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    cancelButton: {
        marginTop: 10,
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        backgroundColor: '#007bff',
    },
});

export default LogFormModal;
