import React, { useState, useRef, useEffect } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Text, ScrollView, Animated, Easing, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DynamicFormProps {
    visible: boolean;
    title: string;
    onClose: () => void;
    components: React.ReactNode[][]; // Array of arrays of components (one array per tab)
    tabs?: string[]; // Optional list of tab titles
    activeTabIndex?: number; // To manage the active tab from the parent if needed
    isStudentSearcherOpen?: boolean; // New prop to conditionally hide tabs
    onBackPress?: () => void; // Callback for the back button in the searcher
    error?: string | null; // Error message to display
}

const MobileDynamicForm = ({
    visible,
    title,
    onClose,
    components = [[]], // Ensure components is always an array of arrays
    tabs = [''],
    activeTabIndex = 0,
    isStudentSearcherOpen = false,
    onBackPress,
    error = null,
}: DynamicFormProps) => {
    const [activeTab, setActiveTab] = useState(activeTabIndex);
    const slideAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                easing: Easing.out(Easing.poly(4)),
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: Dimensions.get('window').width,
                duration: 300,
                easing: Easing.in(Easing.poly(4)),
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const renderTabs = () => {
        if (!isStudentSearcherOpen && tabs.length > 1) {
            return (
                <View style={styles.tabsContainer}>
                    {tabs.map((tab, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.tabButton, activeTab === index ? styles.activeTab : styles.inactiveTab]}
                            onPress={() => setActiveTab(index)}
                        >
                            <Text style={styles.tabText}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            );
        }
        return null;
    };

    return (
        <Modal
            // transparent={true}
            
            visible={visible}
            onRequestClose={onClose}
            animationType="slide"
            presentationStyle='pageSheet'
        >
            
                    <View style={styles.header}>
                        {isStudentSearcherOpen && onBackPress ? (
                            <TouchableOpacity onPress={onBackPress}>
                                <Ionicons name="arrow-back" size={24} color="black" />
                            </TouchableOpacity>
                        ) : null}
                        <Text style={styles.title}>{title}</Text>
                    </View>
                    {error && <Text style={styles.errorLabel}>{error}</Text>}
                    <ScrollView style={styles.content}>
                        {components[activeTab]?.map((Component, index) => (
                            <View key={index} style={styles.componentContainer}>
                                {Component}
                            </View>
                        ))}
                    </ScrollView>
                    {renderTabs()}
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    overlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    modalContainer: {
        // width: '33%',
        height: '100%',
        backgroundColor: '#d6d6d6',
        borderTopLeftRadius: 15,
        borderBottomLeftRadius: 15,
        position: 'absolute',
        right: 0,
    },
    header: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10, // Add margin to push title when back button is visible
    },
    content: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 20,
    },
    componentContainer: {
        marginBottom: 15,
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        backgroundColor: '#d6d6d6',
        paddingBottom: 20,
        paddingTop: 10,
    },
    tabButton: {
        padding: 10,
        flex: 1,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#d6d6d6',
    },
    inactiveTab: {
        backgroundColor: '#dddddd',
    },
    tabText: {
        color: '#333',
        fontWeight: 'bold',
    },
    errorLabel: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
});

export default MobileDynamicForm;
