import React, { useState } from 'react';
import { View, Button, StyleSheet, FlatList, Text, TextInput, TouchableOpacity } from 'react-native';
import DynamicForm from '../Modals/DynamicForm';
import StudentSearcher from '../Modals/StudentSearcher';
import moment from 'moment-timezone';
import { Ionicons } from '@expo/vector-icons';
import PlatformSpecificTimePicker from '../Modals/PlatformSpecificTimePicker';

type Entry = {
    id: string;
    studentId: string;
    studentName: string;
    timeIn: string;
    timeOut: string | null;
};

const ExamplePage = () => {
    const [isFormOpen, setFormOpen] = useState(false);
    const [isStudentSearcherOpen, setStudentSearcherOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState({ id: '', firstName: '', lastName: '' });
    const [checkInTime, setCheckInTime] = useState(new Date());
    const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);
    const [entries, setEntries] = useState<Entry[]>([]);
    const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const handleStudentSelect = (student: { userId: string, fName: string, lName: string }) => {
        setSelectedStudent({
            id: student.userId,
            firstName: student.fName,
            lastName: student.lName,
        });
        setError(null);
        setStudentSearcherOpen(false);
        setActiveTabIndex(0);
    };

    const handleCheckIn = () => {
        if (!selectedStudent.id) {
            setError('Please select a student.');
            return;
        }

        const newEntry: Entry = {
            id: editingEntryId || Date.now().toString(),
            studentId: selectedStudent.id,
            studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
            timeIn: moment(checkInTime).format('MMMM Do YYYY, h:mm:ss a'), // Human-readable format in local time
            timeOut: checkOutTime ? moment(checkOutTime).format('MMMM Do YYYY, h:mm:ss a') : null,
        };

        setEntries((prevEntries) =>
            editingEntryId
                ? prevEntries.map((entry) => (entry.id === editingEntryId ? newEntry : entry))
                : [...prevEntries, newEntry]
        );

        resetForm();
        setFormOpen(false);
    };

    const handleEdit = (entry: Entry) => {
        setSelectedStudent({
            id: entry.studentId,
            firstName: entry.studentName.split(' ')[0],
            lastName: entry.studentName.split(' ')[1],
        });
        setCheckInTime(new Date(entry.timeIn));
        setCheckOutTime(entry.timeOut ? new Date(entry.timeOut) : null);
        setEditingEntryId(entry.id);
        setFormOpen(true);
        setActiveTabIndex(0); // Open in Tab 1, but with the time-out field and Update button
        setError(null);
    };

    const resetForm = () => {
        setSelectedStudent({ id: '', firstName: '', lastName: '' });
        setCheckInTime(new Date());
        setCheckOutTime(null);
        setEditingEntryId(null);
        setError(null);
    };

    const studentPickerComponent = [
        <View style={styles.inputContainer} key="inputContainer">
            <Text style={[styles.label, !selectedStudent.id && error ? styles.errorText : null]}>
                Student ID{!selectedStudent.id && error ? '*' : ''}
            </Text>
            <TextInput
                key="studentId"
                style={styles.readOnlyInput}
                placeholder="Student ID"
                value={selectedStudent.id}
                editable={false}
            />
            <TouchableOpacity
                key="searchButton"
                style={styles.iconButton}
                onPress={() => setStudentSearcherOpen(true)}
            >
                <Ionicons name="md-search" size={24} color="black" />
            </TouchableOpacity>
        </View>,
        <Text style={[styles.label, !selectedStudent.id && error ? styles.errorText : null]}>
            Student Name{!selectedStudent.id && error ? '*' : ''}
        </Text>,
        <TextInput
            key="studentName"
            style={styles.readOnlyInput}
            placeholder="Student Name"
            value={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
            editable={false}
        />,
    ];

    const timePickerComponent = [
        <Text style={styles.label} key="checkInLabel">Check-In Time</Text>,
        <PlatformSpecificTimePicker
            key="checkInPicker"
            time={checkInTime}
            onTimeChange={setCheckInTime}
        />,
        editingEntryId && (
            <>
                <Text style={styles.label} key="checkOutLabel">Check-Out Time</Text>,
                <PlatformSpecificTimePicker
                    key="checkOutPicker"
                    time={checkOutTime || new Date()} // Default to new Date() if null, but this will be replaced if user selects a time
                    onTimeChange={(newTime) => {
                        if (newTime) {
                            setCheckOutTime(newTime);
                        } else {
                            setCheckOutTime(null); // Allow the user to set it to null
                        }
                    }}
                />
            </>
        ),
    ];

    const addButtonComponent = [
        <Button 
            key="updateAdd" 
            title={editingEntryId ? "Update" : "Add"} 
            onPress={handleCheckIn} 
        />,
    ];

    const example1Components = [
        ...studentPickerComponent,
        timePickerComponent[0], // Check-In Time
        timePickerComponent[1], // Check-In Picker
        ...(editingEntryId ? timePickerComponent.slice(2, 4) : []), // Conditionally include time out fields
        ...addButtonComponent, // Update/Add button
    ];

    const example2Components = [
        <View style={styles.inputContainer} key="exampleInputs">
            <Text style={styles.label}>Example Input</Text>
            <TextInput style={styles.input} placeholder="Enter text here" />
            <Button title="Example Button" onPress={() => console.log('Button Pressed')} />
        </View>,
        ...studentPickerComponent,
        <Text style={styles.label} key="checkInLabel">Check-In Time</Text>,
        timePickerComponent[0],
        timePickerComponent[1],
        <Text style={styles.label} key="checkOutLabel">Check-Out Time</Text>,
        timePickerComponent[2],
        timePickerComponent[3],
    ];

    return (
        <View style={styles.container}>
            <Button title="Open Form" onPress={() => setFormOpen(true)} />

            <FlatList
                style={styles.tableContainer}
                data={entries}
                renderItem={({ item }) => (
                    <View style={styles.entryRow}>
                        <View style={styles.tableCell}>
                            <Text>{item.studentId}</Text>
                        </View>
                        <View style={styles.tableCell}>
                            <Text>{item.studentName}</Text>
                        </View>
                        <View style={styles.tableCell}>
                            <Text>{item.timeIn}</Text>
                        </View>
                        {item.timeOut && (
                            <View style={styles.tableCell}>
                                <Text>{item.timeOut}</Text>
                            </View>
                        )}
                        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
                            <Ionicons name="md-create" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                )}
                keyExtractor={(item) => item.id}
            />

            {isFormOpen && (
                <DynamicForm
                    visible={isFormOpen}
                    onClose={() => {
                        setFormOpen(false);
                        resetForm();
                    }}
                    title={activeTabIndex === 0 ? "Example 1" : "Example 2"}
                    components={isStudentSearcherOpen ? [[<StudentSearcher key="searcher" onSelect={handleStudentSelect} onBackPress={() => setStudentSearcherOpen(false)} />]] : [example1Components, example2Components]}
                    tabs={['Example 1', 'Example 2']}
                    activeTabIndex={activeTabIndex}
                    backgroundColor="#d6d6d6"
                    isStudentSearcherOpen={isStudentSearcherOpen}
                />
            )}

            {error && (
                <Text style={styles.errorText}>
                    {error}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
        marginBottom: 10,
    },
    readOnlyInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
    },
    iconButton: {
        marginLeft: 10,
    },
    entryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    tableCell: {
        flex: 1,
        justifyContent: 'center',
    },
    editButton: {
        backgroundColor: '#ffc700',
        padding: 10,
        borderRadius: 5,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
    },
    errorText: {
        color: 'red',
    },
});

export default ExamplePage;
