import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, Alert, Text } from 'react-native';
import userService from '../../services/userService';
import { Ionicons } from '@expo/vector-icons';

type Teacher = {
    userId: number;
    fName: string;
    lName: string;
    userDept: number;
};

interface TeacherSearcherProps {
    onSelect: (teacher: Teacher) => void;
    onBackPress: () => void;
}

const TeacherSearcher = ({ onSelect, onBackPress }: TeacherSearcherProps) => {
    const [searchId, setSearchId] = useState('');
    const [searchFirstName, setSearchFirstName] = useState('');
    const [searchLastName, setSearchLastName] = useState('');
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    const handleSearch = async () => {
        try {
            if (searchId.trim() === '' && searchFirstName.trim() === '' && searchLastName.trim() === '') {
                Alert.alert('Error', 'Please enter an ID, first name, or last name to search.');
                return;
            }
    
            let results;
            if (searchId.trim() !== '') {
                results = await userService.fuzzySearchById(searchId);
            } else {
                results = await userService.fuzzySearchByName(searchFirstName, searchLastName);
            }
    
            // Debugging: Check the structure of `results`
            console.log('Search results:', results);
    
            // Ensure `results` is an object and extract the `$values` array if present
            const filteredResults = Array.isArray(results.$values) ? results.$values.filter(user => user.isTeacher) : [];
    
            if (filteredResults.length > 0) {
                const mappedResults = filteredResults.map((teacher: any) => ({
                    userId: teacher.userId,
                    fName: teacher.fName,
                    lName: teacher.lName,
                    userDept: teacher.userDept,
                }));
    
                setTeachers(mappedResults);
            } else {
                setTeachers([]);
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
        }
    };
    

    const handleSelect = (teacher: Teacher) => {
        onSelect(teacher);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            <Text style={styles.label}>Search by ID</Text>
            <TextInput
                style={styles.input}
                placeholder="Search by ID"
                value={searchId}
                onChangeText={setSearchId}
            />

            <Text style={styles.label}>Search by First Name</Text>
            <TextInput
                style={styles.input}
                placeholder="Search by First Name"
                value={searchFirstName}
                onChangeText={setSearchFirstName}
            />

            <Text style={styles.label}>Search by Last Name</Text>
            <TextInput
                style={styles.input}
                placeholder="Search by Last Name"
                value={searchLastName}
                onChangeText={setSearchLastName}
            />

            <Button title="Search" onPress={handleSearch} />

            <FlatList
                data={teachers}
                keyExtractor={(item) => item.userId.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleSelect(item)} style={styles.teacherRow}>
                        <Text style={styles.selectText}>Select</Text>
                        <Text>ID: {item.userId}</Text>
                        <Text>First Name: {item.fName}</Text>
                        <Text>Last Name: {item.lName}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text>No teachers found.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    backButton: {
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 10,
    },
    teacherRow: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        marginBottom: 10,
    },
    selectText: {
        color: '#007bff',
        marginBottom: 5,
    },
});

export default TeacherSearcher;
