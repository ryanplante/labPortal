import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
	Modal,
	Pressable,
	TouchableOpacity,
	View,
	Text,
	StyleSheet,
	TextInput,
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import PlatformSpecificDatePicker from "./PlatformSpecificDatePicker";

type BanStatusProps = {
    visible: boolean,
    onClose: () => void,
    userId: Number
}

export const BanStatus: React.FC<BanStatusProps> = ({ visible, onClose, userId }) => {

    type Ban = {
        userId: Number,
        banId?: Number,
        expirationDate: Date,
        reason: string
    }

	// console.log("getting into banstatus");
	// console.log(process.env.EXPO_PUBLIC_API + "/Bans/CheckBan/" + userId);

	const [isUserBanned, setUserBanned] = useState<boolean>(false);
	const [reasonText, setReasonText] = useState<string>("");
	const [selectedDate, setSelectedDate] = useState<Date>(
		new Date("09-20-2020")
	);
    const [banStatus, setBanStatus] = useState<Ban | null>(null)

    const handleBanSubmit = async () => {
        try {
            if (!isUserBanned && banStatus) {
                // User is unbanned, and there is an existing ban status, so delete the ban
                await axios.delete(`${process.env.EXPO_PUBLIC_API}/Bans/${banStatus.banId}`);
                console.log("Ban deleted successfully");
            } else if (isUserBanned && banStatus) {
                // User is banned, and there is an existing ban status, so update the ban
                const updatedBan = {
                    ...banStatus,
                    expirationDate: selectedDate,
                    reason: reasonText
                };
                await axios.put(`${process.env.EXPO_PUBLIC_API}/Bans/${banStatus.banId}`, updatedBan);
                console.log("Ban updated successfully");
            } else if (isUserBanned && !banStatus) {
                // User is banned, but there is no existing ban status, so create a new ban
                const newBan = {
                    userId: userId,
                    expirationDate: selectedDate,
                    reason: reasonText
                };
                await axios.post(`${process.env.EXPO_PUBLIC_API}/Bans`, newBan);
                console.log("Ban created successfully");
            }
            onClose(); // Close the modal after the operation
        } catch (error) {
            console.error("Error submitting ban:", error);
        }
    };
    

	useEffect(() => {
		const fetchBanStatus = async () => {
			try {
				const result = await axios.get(
					process.env.EXPO_PUBLIC_API + "/Bans/CheckBan/" + userId
				);
				setUserBanned(true);
                // const result = await axios.get(process.env.EXPO_PUBLIC_API + "/Bans/" + userId)
                console.log(result.data)
                setBanStatus(result.data)
                setSelectedDate(new Date(result.data.expirationDate))
                setReasonText(result.data.reason)
			} catch (error) {
				setUserBanned(false);
				setReasonText("")
				setSelectedDate(new Date("1-1-2020"))
                setBanStatus(null)
				console.error("Error fetching ban status:", error);
			}
		};

		if (visible) {
			fetchBanStatus();
		}
	}, [visible, userId]);

	if (isUserBanned === null) {
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
						<Text>Loading...</Text>
					</View>
				</View>
			</Modal>
		);
	}

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
					<Text style={styles.modalTitle}>Ban Status</Text>
					<Text>
						User id {userId.toString().padStart(9, "0")}:
						{isUserBanned ? "banned" : "not banned"}
					</Text>
					<View style={styles.checkboxView}>
                        <Text style={styles.checkboxlabel}>Ban user?   </Text>
						<BouncyCheckbox
							style={styles.checkbox}
							onPress={(isChecked: boolean) => setUserBanned(isChecked)}
                            isChecked={isUserBanned}
						/>
					</View>
					<View style={styles.datePickerContainer}>
                        <Text style={styles.datePickerLabel}>Ban expiration date:   </Text>
					    <PlatformSpecificDatePicker
    						onDateChange={setSelectedDate}
    						date={selectedDate}
    					/>
					</View>
                    <Text>Selected date: {selectedDate.toString()}</Text>
					<TextInput
						placeholder="Reason for ban"
						style={styles.textInput}
						value={reasonText}
						onChangeText={setReasonText}
					/>
					<View style={styles.confirmationView}>
						{/* <Pressable style={styles.pressable}>
							<Text>Cancel</Text>
						</Pressable> */}
						<Pressable style={styles.pressable} onPress={handleBanSubmit}>
							<Text>Submit</Text>
						</Pressable>
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
	confirmationView: {
		flexDirection: "row",
	},
	pressable: {
		margin: 10,
		backgroundColor: "lightblue",
        width:50,
        height:30
	},
	checkbox: {
		// backgroundColor: "blue",
	},
	datepicker: {
		marginVertical: 10,
	},
	textInput: {
        margin:10,
        width:"75%",
        height:40,
        borderWidth:1,
        borderColor:"black",
        padding:10
    },
	checkboxView: {
		marginTop: 20,
        marginBottom:10,
        flexDirection:"row",
	},
	checkboxlabel: {
        height:20,
        marginTop:4
    },
    datePickerContainer:{
        flexDirection:"row"
    },
    datePickerLabel:{
        // backgroundColor:"lightblue",
        height:20,
        marginTop:7
    }

});
