import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Image, ImageSourcePropType, Text } from 'react-native';

interface ActionButtonProps {
    icon: ImageSourcePropType;
    onPress: () => void;
    disabled?: boolean;
}

interface ActionsModalProps {
    visible: boolean;
    onClose: () => void;
    actionButtons: ActionButtonProps[];
}

const ActionsModal = ({ visible, onClose, actionButtons }: ActionsModalProps) => {
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
                    <Text style={styles.modalTitle}>Actions</Text>
                    <View style={styles.buttonsContainer}>
                        {actionButtons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.actionButton}
                                onPress={button.onPress}
                                disabled={button.disabled}
                            >
                                <Image source={button.icon} style={styles.iconImage} />
                            </TouchableOpacity>
                        ))}
                    </View>
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
    overlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    modalContainer: {
        width: 'auto',
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#000',
    },
    buttonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Allow buttons to wrap to the next line
        justifyContent: 'center',
    },
    actionButton: {
        backgroundColor: '#FFC107',
        padding: 10,
        borderRadius: 10,
        margin: 5,
        width: 60, // Width adjusted to allow two buttons per row
        height: 60, // Height adjusted to maintain square shape
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconImage: {
        width: 30,
        height: 30,
    },
});

export default ActionsModal;
