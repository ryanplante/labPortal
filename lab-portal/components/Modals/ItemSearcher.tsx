import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, Alert, Text, Image } from 'react-native';
import itemService from '../../services/itemService'; // Assuming itemService is similar to userService
import { Ionicons } from '@expo/vector-icons';

type Item = {
    itemId: number;
    description: string;
    quantity: number;
    serialNum: string;
    picture: string | null;
    lab: number;
};

interface ItemSearcherProps {
    onSelect: (item: Item) => void;
    onBackPress: () => void;
    labId: number | null; // To filter items by lab
}

const ItemSearcher = ({ onSelect, onBackPress, labId }: ItemSearcherProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState<Item[]>([]);

    const handleSearch = async () => {
        try {
            if (searchQuery.trim() === '') {
                Alert.alert('Error', 'Please enter a serial number or description to search.');
                return;
            }

            const results = await itemService.searchItems(labId, searchQuery);
            if (results) {
                const mappedResults = results.map((item: any) => ({
                    itemId: item.itemId,
                    description: item.description,
                    quantity: item.quantity,
                    serialNum: item.serialNum,
                    picture: item.picture ? item.picture : null, // Directly use the picture if already properly formatted
                    lab: item.lab,
                }));

                setItems(mappedResults);
            } else {
                setItems([]);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const handleSelect = (item: Item) => {
        onSelect(item);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            <Text style={styles.label}>Search by Serial Number or Description</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter Serial Number or Description"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            <Button title="Search" onPress={handleSearch} />

            <FlatList
                data={items}
                keyExtractor={(item) => item.itemId.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleSelect(item)} style={styles.itemRow}>
                        <Text style={styles.selectText}>Select</Text>
                        <Text>ID: {item.itemId.toString().padStart(8, '0')}</Text>
                        <Text>Description: {item.description}</Text>
                        <Text>Serial Number: {item.serialNum}</Text>
                        <Text>Quantity: {item.quantity}</Text>
                        {item.picture ? (
                            <Image
                                source={{ uri: item.picture.startsWith('data:image') ? item.picture : `data:image/jpeg;base64,${item.picture}` }}
                                style={styles.image}
                                resizeMode="contain"
                            />
                        ) : (
                            <Text>No Image</Text>
                        )}
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text>No items found.</Text>}
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
    itemRow: {
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
    image: {
        width: 100,
        height: 100,
        marginTop: 10,
        borderRadius: 5,
    },
});

export default ItemSearcher;
