import React, { useEffect, useState } from "react";
import {
	Modal,
	TouchableOpacity,
	View,
	StyleSheet,
	Text,
	Button,
	Pressable,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { User } from "../../services/userService";
import userService from "../../services/userService";

type ChangePermissionModalProps = {
    visible: boolean,
    onClose: () => void,
    user: User | null
}

export const ChangePermissionModal = ({
	visible,
	onClose,
	user
}: ChangePermissionModalProps) => {

    if(user === null){
        return
    }

	const [selectedLevel, setSelectedLevel] = useState<number>(user.privLvl);

    const handlePermsSubmit = () => {
        // const newUser = {
        //     ...user,
        //     privLvl: selectedLevel
        // }
        // console.log(newUser)
        // console.log(`${process.env.EXPO_PUBLIC_API}/Users/${user.userId}`)
        // try{
        //     axios.put(`${process.env.EXPO_PUBLIC_API}/Users/${user.userId}`, newUser)
        // } catch (error){
        //     console.error("Error updating user:", error)
        // }

        userService.updatePermission(user.userId, selectedLevel)

        onClose()
    }

    useEffect(() => {
        if (visible) {
          setSelectedLevel(user.privLvl);
        }
      }, [visible, user.privLvl]);

	return (
		<Modal
			transparent={true}
			visible={visible}
			onRequestClose={onClose}
			animationType="fade"
		>
			<View style={styles.modalOverlay}>
				<TouchableOpacity
					style={styles.overlay}
					onPress={onClose}
					activeOpacity={1}
				/>
				<View style={styles.modalContainer}>
					<Text style={styles.modalTitle}>Change Permission Level</Text>
					<Picker
						selectedValue={selectedLevel}
						style={styles.picker}
						onValueChange={(itemValue) => setSelectedLevel(Number(itemValue))}
					>
						<Picker.Item label="Student" value={0} />
						<Picker.Item label="Monitor" value={1} />
						<Picker.Item label="Tutor" value={2} />
						<Picker.Item label="Tutor & Monitor" value={3} />
						<Picker.Item label="Department Head" value={4} />
						<Picker.Item label="Admin" value={5} />
					</Picker>
					<View style={styles.confirmationView}>
						{/* <Pressable style={styles.pressable}><Text>Cancel</Text></Pressable> */}
						<Pressable style={styles.pressable} onPress={handlePermsSubmit}><Text>Submit</Text></Pressable>
					</View>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	banText: {
		color: "red",
		marginTop: 20,
		marginBottom: 10,
	},
	overlay: {
		position: "absolute",
		width: "100%",
		height: "100%",
	},
	modalContainer: {
		width: 300,
		backgroundColor: "#f0f0f0",
		borderRadius: 10,
		padding: 15,
		alignItems: "center",
		// height:300
	},
	modalTitle: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 10,
		color: "#000",
	},
	buttonsContainer: {
		flexDirection: "column",
		flexWrap: "wrap", // Allow buttons to wrap to the next line
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
		borderWidth: 1,
		borderRightColor: "#f0f0f0",
		borderLeftColor: "#f0f0f0",
		borderBottomColor: "#f0f0f0",
		borderTopColor: "black",
	},
	actionButton: {
		padding: 10,
		borderWidth: 1,
		borderRightColor: "#f0f0f0",
		borderLeftColor: "#f0f0f0",
		borderBottomColor: "black",
		borderTopColor: "#f0f0f0",
		width: "100%", // Width adjusted to allow two buttons per row
		height: 60, // Height adjusted to maintain square shape
		justifyContent: "center",
		alignItems: "center",
	},
	iconImage: {
		width: 30,
		height: 30,
	},
	picker: {
		height: 50,
		width: 200,
		marginBottom: 20,
		backgroundColor: "lightblue",
	},
    confirmationView:{
        flexDirection:"row"
    },
    pressable:{
        margin:10,
        backgroundColor:"lightblue"

    }
});
