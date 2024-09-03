import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, Alert, Text } from 'react-native';
import userService from '../../services/userService';
import { Ionicons } from '@expo/vector-icons';

type User = {
    userId: number;
    fName: string;
    lName: string;
    isTeacher: boolean;
};

interface UserSearcherProps {
    onSelect: (user: User) => void;
    onBackPress: () => void;
    isTeacher: boolean | null; // Accepts true, false, or null to filter by user type
}

const UserSearcher = ({ onSelect, onBackPress, isTeacher }: UserSearcherProps) => {
    const [searchId, setSearchId] = useState('');
    const [searchFirstName, setSearchFirstName] = useState('');
    const [searchLastName, setSearchLastName] = useState('');
    const [users, setUsers] = useState<User[]>([]);

    const handleSearch = async () => {
        try {
            if (searchId.trim() === '' && searchFirstName.trim() === '' && searchLastName.trim() === '') {
                Alert.alert('Error', 'Please enter an ID, first name, or last name to search.');
                return;
            }
    
            let results;
            if (searchId.trim() !== '') {
                results = await userService.fuzzySearchById(parseInt(searchId, 10));
            } else {
                results = await userService.fuzzySearchByName(searchFirstName, searchLastName);
            }
    
            if (results?.$values) {
                let filteredResults = results.$values;
                if (isTeacher !== null) {
                    filteredResults = filteredResults.filter(user => {
                        console.log(user)
                        if (isTeacher) {
                            return user.isTeacher === true;
                        } else {
                            console.log(user.isTeacher)
                            return user.isTeacher === false || user.isTeacher === undefined;
                        }
                    });
                }
    
                const mappedResults = filteredResults.map((user: any) => ({
                    userId: parseInt(user.userId.toString().padStart(8, '0')),
                    fName: user.fName,
                    lName: user.lName,
                }));
                console.log(mappedResults)
    
                setUsers(mappedResults);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };
    

    const handleSelect = (user: User) => {
        onSelect(user);
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
                data={users}
                keyExtractor={(item) => item.userId.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleSelect(item)} style={styles.userRow}>
                        <Text style={styles.selectText}>Select</Text>
                        <Text>ID: {item.userId.toString().padStart(8, '0')}</Text>
                        <Text>First Name: {item.fName}</Text>
                        <Text>Last Name: {item.lName}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text>No users found.</Text>}
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
    userRow: {
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

export default UserSearcher;
