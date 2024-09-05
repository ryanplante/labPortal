import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Image, ImageSourcePropType, Text, Pressable } from 'react-native';

interface UserManagementModalProps {
    onPress: () => void;
    disabled?: boolean;
    text: String
}



interface ActionsModalProps {
    visible: boolean;
    onClose: () => void;
    actionButtons: ActionButtonProps[];
    userId: Number
}

const UserManagementModal = ({ visible, onClose, actionButtons, userId }: ActionsModalProps) => {
    return (
        <Modal
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            animationType="fade"
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1} />
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>User {userId.toString().padStart(9, "0")}</Text>
                    <View style={styles.buttonsContainer}>
                        {actionButtons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.actionButton}
                                onPress={button.onPress}
                                disabled={button.disabled}
                            >
                                <Text>{button.text}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {/* <Text style={styles.banText}>User is banned</Text> */}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    banText:{
        color:"red",
        marginTop:20,
        marginBottom:10
    },
    overlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    modalContainer: {
        width: 250,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        // height:300
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#000',
    },
    buttonsContainer: {
        flexDirection: 'column',
        flexWrap: 'wrap', // Allow buttons to wrap to the next line
        justifyContent: 'center',
        alignItems:"center",
        width:"100%",
        borderWidth:1,
        borderRightColor:"#f0f0f0",
        borderLeftColor:"#f0f0f0",
        borderBottomColor:"#f0f0f0",
        borderTopColor:"black",
    },
    actionButton: {
        padding: 10,
        borderWidth:1,
        borderRightColor:"#f0f0f0",
        borderLeftColor:"#f0f0f0",
        borderBottomColor:"black",
        borderTopColor:"#f0f0f0",
        width: "100%", // Width adjusted to allow two buttons per row
        height: 60, // Height adjusted to maintain square shape
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconImage: {
        width: 30,
        height: 30,
    },
});

export default UserManagementModal;
