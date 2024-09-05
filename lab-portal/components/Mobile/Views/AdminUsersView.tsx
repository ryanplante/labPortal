import axios from "axios";
import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	Pressable,
	FlatList,
} from "react-native";
import userService, { User } from "../../../services/userService";
import { Item } from "react-native-picker-select";
import ActionsModal from "../../Modals/ActionsModal";
import UserManagementModal from "../../Modals/UserManagementModal";
import { ChangePermissionModal } from "../../Modals/ChangePermissionModal";
import { BanStatus } from "../../Modals/BanStatus";
import { Department } from "../../../services/departmentService";
import { ResetPasswordConfirmationModal } from "../../Modals/ResetPasswordConfirmation";

const AdminUsersView = () => {
	const [searchText, setSearchText] = useState("");
	const [searchResults, setSearchResults] = useState([]);

	// type SearchResultType = {
	// 	$id: Number;
	// 	fName: String;
	// 	lName: String;
	// 	privLvl: Number;
	// 	userDept: String;
	// 	userId: Number;
	// };

	const [isActionsMenuVisible, setActionsMenuVisible] = useState(false);
	const [itemForAction, setItemForAction] = useState<Item | null>(null);
	const [isBanMenuVisible, setBanMenuVisible] = useState(false);
	const [isPasswordConfirmVisible, setPasswordConfirmVisible] =
		useState(false);
	const [isPermissionLevelMenuVisible, setPermissionLevelMenuVisible] =
		useState(false);
	const [departments, setDepartments] = useState<Department[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);

	const openActionsMenu = (item: Item) => {
		setItemForAction(item);
		setActionsMenuVisible(true);
	};

	const closeActionsMenu = () => {
		setActionsMenuVisible(false);
		setRefreshKey((prevKey) => prevKey + 1);
	};
	const closePermissionsMenu = () => {
		setPermissionLevelMenuVisible(false);
		setRefreshKey((prevKey) => prevKey + 1);
	};
	const closeBanMenu = () => {
		setBanMenuVisible(false);
		setRefreshKey((prevKey) => prevKey + 1);
	};
	const closeResetMenu = () => {
		setPasswordConfirmVisible(false)
		setRefreshKey((prevKey) => prevKey + 1);
	}

	useEffect(() => {
		// Function to fetch data from the API
		const fetchSearchResults = async () => {
			if (searchText.length > 0) {
				// Make sure to only search if there's input
				try {
					let trimmedSearchText = searchText;

					const response = await userService.fuzzySearchById(
						Number(trimmedSearchText)
					);

					const updatedResults = response.$values;

					console.log(updatedResults);

					setSearchResults(updatedResults);
				} catch (error) {
					setSearchResults([]);
					console.error("Error fetching search results:", error, error.stack);
				}
			} else {
				setSearchResults([]); // Clear results when input is empty
			}
		};

		fetchSearchResults();
	}, [searchText, refreshKey]);

	useEffect(() => {
		// Function to fetch departments
		const fetchDepartments = async () => {
			try {
				const response = await axios.get(
					`${process.env.EXPO_PUBLIC_API}/Departments`
				);
				setDepartments(response.data.$values); // Update state with fetched departments
			} catch (error) {
				console.error("Error fetching departments:", error);
			}
		};

		fetchDepartments();
	}, []);

	const getDeptName = (deptId: Number) => {
		const department = departments.find((o: Department) => o.deptId === deptId);
		return department ? department.name : "unknown";
	};

	const actionButtons = [
		{
			text: "Ban Status",
			onPress: () => {
				setActionsMenuVisible(false);
				setBanMenuVisible(true);
			},
		},
		{
			text: "Reset Password",
			onPress: () => {
				setActionsMenuVisible(false);
				setPasswordConfirmVisible(true)
			},
		},
		{
			text: "Change Permission Level",
			onPress: () => {
				setActionsMenuVisible(false);
				setPermissionLevelMenuVisible(true);
			},
		},
	];

	if (searchResults.length == 0) {
		return (
			<View style={styles.container}>
				<TextInput
					placeholder="Enter a student ID..."
					style={styles.searchBox}
					value={searchText}
					inputMode="numeric"
					onChangeText={setSearchText} // Update searchText state when input changes
				/>
				<Text>No results!</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<TextInput
				placeholder="Enter a student ID..."
				style={styles.searchBox}
				value={searchText}
				inputMode="numeric"
				onChangeText={setSearchText} // Update searchText state when input changes
			/>
			<View style={styles.tableHeaderView}>
				<Text style={styles.tableHeaderText}>Student ID</Text>
				<Text style={styles.tableHeaderText}>Name</Text>
				<Text style={styles.tableHeaderText}>Dept</Text>
				<Text style={styles.tableHeaderText}>User level</Text>
			</View>
			<FlatList
				data={searchResults}
				keyExtractor={(item: User) => item.userId.toString()}
				style={styles.tableBody}
				renderItem={({ item }) => (
					<Pressable
						onPress={() => openActionsMenu(item)}
						style={[styles.tableRow]}
					>
						<Text style={styles.tableCell}>
							{item.userId.toString().padStart(9, "0")}
						</Text>
						<Text style={styles.tableCell}>
							{item.fName} {item.lName}
						</Text>
						<Text style={styles.tableCell}>{getDeptName(item.userDept)}</Text>
						<Text style={styles.tableCell}>{item.privLvl}</Text>
					</Pressable>
				)}
			/>
			<UserManagementModal
				visible={isActionsMenuVisible}
				onClose={closeActionsMenu}
				actionButtons={actionButtons}
				userId={itemForAction ? itemForAction.userId : 0}
			/>
			<ChangePermissionModal
				visible={isPermissionLevelMenuVisible}
				onClose={closePermissionsMenu}
				user={itemForAction ? itemForAction : null}
				currentLevel={itemForAction ? itemForAction.privLvl : 0}
			/>
			<BanStatus
				visible={isBanMenuVisible}
				onClose={closeBanMenu}
				userId={itemForAction ? itemForAction.userId : 0}
			/>
			<ResetPasswordConfirmationModal
			visible={isPasswordConfirmVisible}
			onClose={closeResetMenu}
			userId={itemForAction ? itemForAction.userId : 0} />
		</View>
	);
};

const boderColor = "#f2f2f2";

const styles = StyleSheet.create({
	container: {
		width: "100%",
		height: "100%",
		alignItems: "center",
		// backgroundColor: "lightblue",
	},
	tableHeaderView: {
		flexDirection: "row",
		width: "90%",
		justifyContent: "space-around",
		borderTopColor: boderColor,
		borderRightColor: boderColor,
		borderLeftColor: boderColor,
		borderBottomColor: "black",
		borderWidth: 1,
		height: 25,
	},
	tableHeaderText: {
		fontSize: 20,
		textAlign: "center",
		width: "25%",
	},
	searchBox: {
		borderColor: "black",
		borderWidth: 1,
		height: 50,
		width: "90%",
		marginVertical: 20,
		paddingHorizontal: 10,
	},
	tableBody: {
		width: "90%",
	},
	tableRow: {
		flexDirection: "row",
		justifyContent: "space-around",
		borderBottomColor: "black",
		borderBottomWidth: 1,
		paddingVertical: 5,
	},
	tableCell: {
		fontSize: 18,
		// color:"red",
		width: "25%",
		// backgroundColor:"white",
		textAlign: "center",
	},
});

export default AdminUsersView;
