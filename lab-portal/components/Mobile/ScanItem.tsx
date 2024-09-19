import { Camera, CameraView, useCameraPermissions } from "expo-camera";
import { View, Text, StyleSheet, Button, TouchableOpacity } from "react-native";

export const MobileScanItem = () => {
	const [permission, requestPermission] = useCameraPermissions();

	if (!permission) {
		return <Text>Loading</Text>;
	}

	if (!permission.granted) {
		// Camera permissions are not granted yet.
		return (
			<SafeAreaView>
				<Text>We need your permission to show the camera</Text>
				<Button onPress={requestPermission} title="grant permission" />
			</SafeAreaView>
		);
	}

	const barcodescanned = ({ data }) => {
		alert(`Scanned ${data}`);
	};

	return (
		<SafeAreaView style={styles.container}>
			<Text style={styles.text}>Mobile Scan Item</Text>
			<Text>Coming soon!</Text>
			<CameraView
				barcodeScannerSettings={{
					barcodeTypes: ["code128"],
				}}
				onBarcodeScanned={barcodescanned}
				style={styles.camera}
			/>
		</SafeAreaView>
	);
};

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   text: {
//     fontSize: 20,
//   },
//   camera:{
//     width:500,
//     height:500
//   }
// });
//

import React, { useState, useEffect } from "react";
import { getUserByToken } from "../../services/loginService";
import BarcodeScannerModal from "../Modals/BarCodeScannerModal";
import itemService from "../../services/itemService";
import userService from "../../services/userService";
import ConfirmationModal from "../Modals/ConfirmationModal";
import StudentWorkerView from "../Desktop/Views/StudentWorkerView";
import { SafeAreaView } from "react-native-safe-area-context";

const ScannerScreen = ({ reset }) => {
	const [scannedItem, setScannedItem] = useState(null);
	const [scannedStudent, setScannedStudent] = useState(null);
	const [isScannerVisible, setIsScannerVisible] = useState(false);
	const [privLvl, setPrivLvl] = useState(null);
	const [scanType, setScanType] = useState(null);
	const [permission, requestPermission] = useCameraPermissions();
	const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
	const [confirmationTitle, setConfirmationTitle] = useState("");
	const [confirmationDescription, setConfirmationDescription] = useState("");
	const [isScanningAgain, setIsScanningAgain] = useState(true);

	<MobileScanItem />;

	const fetchUserPrivilege = async () => {
		const user = await getUserByToken();
		setPrivLvl(user.privLvl);

		if (user.privLvl === 2) {
			setScanType("student");
		} else {
			setScanType("all");
		}
	};

	const handleScanResult = async (scannedData) => {
		const { type, itemId, userId } = scannedData;

		if (type === "Item") {
			const item = await itemService.getItemById(itemId);
			setScannedItem({
				itemId: item.itemId,
				description: item.description,
				serialNum: item.serialNum,
			});
			setIsScanningAgain(true);
			setScanType("student");
			// Show the confirmation modal, but don't trigger any action yet
			setConfirmationTitle("Scan Student?");
			setConfirmationDescription(
				"Do you want to scan a student for this item?"
			);
			setIsConfirmationVisible(true); // Show the modal
		}

		if (type === "Student" || userId) {
			const student = await userService.getUserById(userId);
			setScannedStudent({
				userId: student.userId,
				fName: student.fName,
				lName: student.lName,
			});
			setIsScanningAgain(false);
		}

		setIsScannerVisible(false); // Close the scanner after processing
	};

	const handleConfirm = () => {
		setScanType("student"); // Change scan mode to student
		setIsScannerVisible(true); // Reopen the scanner for student scan
		setIsScanningAgain(true);
		setIsConfirmationVisible(false); // Close the modal
	};

	const resetScannedStates = () => {
		setScannedItem(null);
		setScannedStudent(null);
		setIsScanningAgain(false);
		setIsScannerVisible(true);
		reset = false;
	};

	useEffect(() => {
		resetScannedStates();
		fetchUserPrivilege();
	}, []);

	useEffect(() => {
		if (permission?.granted) {
			setIsScannerVisible(true);
		} else if (permission?.status === "undetermined") {
			requestPermission();
		}
	}, [permission]);

	if (!permission) {
		return <Text>Loading</Text>;
	}

	if (!permission.granted) {
		// Camera permissions are not granted yet.
		return (
			<SafeAreaView>
				<Text>We need your permission to show the camera.</Text>
				<Button onPress={requestPermission} title="Grant Permission" />
			</SafeAreaView>
		);
	}

	let readers = [];
	// Adjust readers based on scanType
	if (scanType === "student") {
		readers = ["code_39_reader"];
	} else if (scanType === "item") {
		readers = ["code_128_reader"];
	} else if (scanType === "all") {
		readers = ["code_128_reader", "code_39_reader"];
	}

	if ((scannedItem || scannedStudent) && !isScanningAgain) {
		return (
			<StudentWorkerView
				scannedStudent={scannedStudent}
				scannedItem={scannedItem}
			/>
		);
	}

	return (
		<View style={styles.container}>
			{!permission || !permission.granted ? (
				<View style={styles.permissionContainer}>
					<Text>We need camera permission to scan barcodes.</Text>
					<TouchableOpacity
						onPress={requestPermission}
						style={styles.permissionButton}
					>
						<Text style={styles.permissionButtonText}>Grant Permission</Text>
					</TouchableOpacity>
				</View>
			) : (
				isScannerVisible && (
					<>
						{/* <BarcodeScannerModal
              visible={isScannerVisible}
              onClose={() => setIsScannerVisible(false)}
              onBarCodeScanned={handleScanResult}
              scanType={scanType}
            /> */}
						<SafeAreaView style={styles.container}>
							<Text style={styles.text}>Mobile Scan Item</Text>
							<Text>Coming soon!</Text>
							<CameraView
								barcodeScannerSettings={{
									barcodeTypes: readers,
								}}
								onBarcodeScanned={handleScanResult}
								style={styles.camera}
							/>
						</SafeAreaView>
					</>
				)
			)}

			{/* Confirmation modal */}
			<ConfirmationModal
				visible={isConfirmationVisible}
				title={confirmationTitle}
				description={confirmationDescription}
				onConfirm={handleConfirm}
				onCancel={() => {
					setIsConfirmationVisible(false);
					setIsScanningAgain(false);
				}}
				type="yesNo"
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	permissionContainer: {
		justifyContent: "center",
		alignItems: "center",
	},
	permissionButton: {
		backgroundColor: "#007BFF",
		padding: 10,
		borderRadius: 5,
		marginTop: 10,
	},
	permissionButtonText: {
		color: "#fff",
		fontSize: 16,
	},
	camera: {
		width: 500,
		height: 500,
	},
});

export const ScanPlaceholder = () => {
	return (
		<SafeAreaView>
			<Text style={{ fontSize: 30 }}>Coming soon</Text>
		</SafeAreaView>
	);
};

export default ScannerScreen;
