import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	TextInput,
	Image,
	Button,
} from "react-native";
import userService, { User } from "../../services/userService";
import LabService from "../../services/labsService";
import DepartmentService from "../../services/departmentService";
import { getUserByToken } from "../../services/loginService";
import EditUserModal from "../Modals/editUserModal"; // Assuming this is the correct path
import ActionsModal from "../Modals/ActionsModal";
import ConfirmationModal from "../Modals/ConfirmationModal";
import UserSearcher from "../Modals/UserSearcher";
import { Picker } from "@react-native-picker/picker";
import DynamicForm from "../Modals/DynamicForm";
import EmployeeFormModal from "../Modals/EmployeeFormModal";
import FuzzySearchModal from "../Modals/FuzzySearchModal";
import ConfirmMonitorModal from "../Modals/ConfirmMonitorModal";
import { SafeAreaView } from "react-native-safe-area-context";
import LabFormModal from "../Modals/LogFormModal";

// Main component to manage labs and employees within a department
const ManageLabsMobile = ({
	route,
	navigation,
	department: initialDepartment,
}) => {
	// State management
	const [labs, setLabs] = useState([]);
	const [employees, setEmployees] = useState([]);
	const [selectedDepartment, setSelectedDepartment] = useState(
		initialDepartment || route.params?.department || null
	);
	const [departments, setDepartments] = useState([]);
	const [isAdmin, setIsAdmin] = useState(false);
	const [activeTab, setActiveTab] = useState("Labs");
	const [isLabFormVisible, setLabFormVisible] = useState(false);
	const [isEmployeeFormVisible, setEmployeeFormVisible] = useState(false);
	const [editingLab, setEditingLab] = useState(null);
	const [editingUser, setEditingUser] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [isActionsMenuVisible, setActionsMenuVisible] = useState(false);
	const [selectedItemForAction, setSelectedItemForAction] = useState(null);
	const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
	const [itemToDelete, setItemToDelete] = useState(null);
	const [formError, setFormError] = useState(null);
	const [role, setRole] = useState("");
	const [isUserSearcherOpen, setUserSearcherOpen] = useState(false);
	const [isSearchModalVisible, setSearchModalVisible] = useState(false);
	const [itemForAction, setItemForAction] = useState<User | null>(null);
	const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
	const [users, setUsers] = useState([]);

	// console.log("route", route)
	// console.log("navigation", navigation)
	// console.log("dept", initialDepartment)
	// console.log("selecteddept", selectedDepartment)

	// Load user information on component mount
	useEffect(() => {
		loadUserInfo();
		if (route.params?.department) {
			console.log("Selected department:", route.params.department);
			setSelectedDepartment(route.params.department);
			if (!selectedDepartment) {
				setSelectedDepartment(
					route.params?.department || initialDepartment || null
				);
			} else {
				setSelectedDepartment(selectedDepartment);
			}
		}

		// Fetch labs and employees when a department is selected
		if (selectedDepartment) {
			fetchLabsAndEmployees(selectedDepartment.deptId);
		}
	}, [selectedDepartment, route.params?.department]);

	// Fetch labs and employees when a department is selected
	useEffect(() => {
		if (route.params?.department) {
			console.log("Selected department:", route.params.department);
			setSelectedDepartment(route.params.department);
		}
	}, [route.params?.department]);

	// Function to load user information and set department
	const loadUserInfo = async () => {
		try {
			const user = await getUserByToken();
			setIsAdmin(user.privLvl >= 5);

			// Ensure selectedDepartment is set from initialDepartment or route params
			if (!selectedDepartment) {
				setSelectedDepartment(
					initialDepartment ||
						route.params?.department || { deptId: user.userDept }
				);
			}

			if (user.privLvl >= 5) {
				const fetchedDepartments = await DepartmentService.getAllDepartments();
				setDepartments(fetchedDepartments);

				if (!selectedDepartment && initialDepartment) {
					setSelectedDepartment(initialDepartment);
				}
			}
		} catch (error) {
			console.error("Error loading user info:", error);
		}
	};

	const handleSave = async (updatedUser: User) => {
		try {
			await userService.updateUser(updatedUser.userId, updatedUser);

			setConfirmModalVisible(false);

			// Refresh the labs and employees after saving the user
			fetchLabsAndEmployees(selectedDepartment?.deptId || 0);

			// Optionally, you can also reset the form state
			setEditingUser(null);
			setIsEditing(false);
		} catch (error) {
			console.error("Failed to update user:", error);
		}
	};

	// Function to fetch labs and employees for the selected department
	const fetchLabsAndEmployees = async (deptId) => {
		try {
			const fetchedLabs = await LabService.getLabByDept(deptId);
			setLabs(fetchedLabs.$values || []);

			const response = await userService.getAllUsers();
			const fetchedUsers = response.$values || [];
			const filteredEmployees = fetchedUsers.filter(
				(emp) => emp.userDept === deptId && (emp.privLvl > 0 || emp.isTeacher)
			);
			setEmployees(filteredEmployees);
		} catch (error) {
			console.error("Error fetching labs or employees:", error);
		}
	};

	// Function to validate lab data before submission
	const validateLabFormData = (formData) => {
		if (formData.name.length > 25) {
			return "Lab Name must be 25 characters or less.";
		}
		if (formData.roomNum.length > 5) {
			return "Room Number must be 5 characters or less.";
		}
		return null;
	};

	// Function to handle the creation or update of a lab
	const handleCreateOrUpdateLab = async (formData) => {
		const validationError = validateLabFormData(formData);
		if (validationError) {
			setFormError(validationError);
			return;
		}
		setFormError(null);

		try {
			const selectedDeptId = selectedDepartment?.deptId;
			if (isEditing && editingLab) {
				await LabService.updateLab(editingLab.labId, {
					...editingLab,
					...formData,
					deptId: selectedDeptId,
				});
			} else {
				await LabService.createLab({ ...formData, deptId: selectedDeptId });
			}
			setLabFormVisible(false);
			setEditingLab(null);
			setIsEditing(false);
			fetchLabsAndEmployees(selectedDeptId || 0);
		} catch (error) {
			console.error("Error creating/updating lab:", error);
		}
	};

	// Function to handle the update of an existing user
	const handleCreateOrUpdateUser = async () => {
		if (!editingUser) {
			setFormError("No user selected.");
			return;
		}

		try {
			const updatedUser = {
				...editingUser,
				privLvl: parseInt(role, 10),
				userDept: selectedDepartment?.deptId,
			};

			// Update the user's permissions and department
			await userService.updateUser(editingUser.userId, updatedUser);

			setEmployeeFormVisible(false);
			setEditingUser(null);
			setIsEditing(false);
			fetchLabsAndEmployees(selectedDepartment?.deptId || 0);
		} catch (error) {
			console.error("Error updating user:", error);
		}
	};

	// Function to handle the edit of a lab
	const handleEditLab = (lab) => {
		setEditingLab(lab);
		setIsEditing(true);
		setLabFormVisible(true);
	};

	const handleAddLab = () => {
		setEditingLab(null);
		setIsEditing(false);
		setLabFormVisible(true);
	};

	const handleSelectUser = (user) => {
		setItemForAction(user);
		setSearchModalVisible(false);
		setConfirmModalVisible(true);
	};

	// Function to handle the edit of an employee
	const handleEditUser = (user) => {
		setEditingUser(user);
		setIsEditing(true);
		setRole(user.privLvl.toString());
		setEmployeeFormVisible(true);
	};

	// Function to handle the deletion of a lab
	const handleDeleteLab = async (lab) => {
		setItemToDelete(lab);
		setDeleteModalVisible(true);
		setActionsMenuVisible(false);
	};

	// Function to confirm and execute the deletion of a lab
	const confirmDeleteLab = async () => {
		if (itemToDelete && "labId" in itemToDelete) {
			try {
				await LabService.deleteLab(itemToDelete.labId);
				fetchLabsAndEmployees(selectedDepartment?.deptId || 0);
			} catch (error) {
				console.error("Error deleting lab:", error);
			} finally {
				setDeleteModalVisible(false);
				setItemToDelete(null);
			}
		}
	};

	// Function to handle the deletion of an employee
	const handleDeleteUser = async (user) => {
		if (user.isTeacher) {
			setFormError("Deleting teachers is not allowed.");
			return;
		}
		setItemToDelete(user);
		setDeleteModalVisible(true);
		setActionsMenuVisible(false);
	};

	// Function to confirm and execute the deletion of an employee
	const confirmDeleteUser = async () => {
		if (itemToDelete && "userId" in itemToDelete) {
			try {
				// Set privLvl to 0 to "delete" the user
				await userService.updatePermission(itemToDelete.userId, 0);
				fetchLabsAndEmployees(selectedDepartment?.deptId || 0);
			} catch (error) {
				console.error("Error downgrading user:", error);
			} finally {
				setDeleteModalVisible(false);
				setItemToDelete(null);
			}
		}
	};

	// Function to open the actions menu for a selected item
	const openActionsMenu = (item) => {
		if (item.isTeacher) {
			return; // Don't show actions menu for teachers
		}
		setSelectedItemForAction(item);
		setActionsMenuVisible(true);
	};

	// Define the action buttons for labs and employees
	const actionButtons =
		activeTab === "Labs"
			? [
					{
						name: "Edit",
						icon: require("../../assets/edit.png"),
						onPress: () => {
							setActionsMenuVisible(false);
							handleEditLab(selectedItemForAction);
						},
					},
					{
						name: "Delete",
						icon: require("../../assets/trash.png"),
						onPress: () => {
							setActionsMenuVisible(false);
							handleDeleteLab(selectedItemForAction);
						},
					},
			  ]
			: [
					{
						name: "Edit",
						icon: require("../../assets/edit.png"),
						onPress: () => {
							setActionsMenuVisible(false);
							handleEditUser(selectedItemForAction);
						},
					},
					{
						name: "Delete",
						icon: require("../../assets/trash.png"),
						onPress: () => {
							setActionsMenuVisible(false);
							handleDeleteUser(selectedItemForAction);
						},
					},
			  ];

	// Render a single lab item in the list
	const renderLabItem = ({ item }) => {
		console.log("render lab item is running");
		console.log(item.name);
		return (
			<TouchableOpacity
				onPress={() => openActionsMenu(item)}
				style={styles.entryRow}
			>
				<View style={[styles.tableCell, styles.tableCellLabName]}>
					<Text style={styles.cellText}>{item.name}</Text>
				</View>
				<View style={[styles.tableCell, styles.tableCellLabRoom]}>
					<Text style={styles.cellText}>{item.roomNum}</Text>
				</View>
				<View style={[styles.tableCell, styles.tableCellActions]}>
					<TouchableOpacity
						onPress={() => handleEditLab(item)}
						style={styles.actionButton}
					>
						<Image
							source={require("../../assets/edit.png")}
							style={styles.iconImage}
						/>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => handleDeleteLab(item)}
						style={styles.actionButton}
					>
						<Image
							source={require("../../assets/trash.png")}
							style={styles.iconImage}
						/>
					</TouchableOpacity>
				</View>
			</TouchableOpacity>
		);
	};

	// Render a single employee item in the list
	const renderEmployeeItem = ({ item }) => (
		<TouchableOpacity
			onPress={() => openActionsMenu(item)}
			style={styles.entryRow}
		>
			<View style={[styles.tableCell, styles.tableCellEmployeeId]}>
				<Text style={styles.cellText}>
					{item.userId.toString().padStart(8, "0")}
				</Text>
			</View>
			<View style={[styles.tableCell, styles.tableCellEmployeeName]}>
				<Text style={styles.cellText}>
					{item.fName} {item.lName}
				</Text>
			</View>
			<View style={[styles.tableCell, styles.tableCellEmployeeRole]}>
				<Text style={styles.cellText}>{getRoleName(item)}</Text>
			</View>
			<View style={[styles.tableCell, styles.tableCellActions]}>
				{!item.isTeacher && (
					<>
						<TouchableOpacity
							onPress={() => handleEditUser(item)}
							style={styles.actionButton}
						>
							<Image
								source={require("../../assets/edit.png")}
								style={styles.iconImage}
							/>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => handleDeleteUser(item)}
							style={styles.actionButton}
						>
							<Image
								source={require("../../assets/trash.png")}
								style={styles.iconImage}
							/>
						</TouchableOpacity>
					</>
				)}
			</View>
		</TouchableOpacity>
	);

	// Function to get the role name for a user
	const getRoleName = (user) => {
		if (user.isTeacher) {
			switch (user.privLvl) {
				case 4:
					return "Department Head";
				case 5:
					return "Admin";
				default:
					return "Teacher";
			}
		}
		switch (user.privLvl) {
			case 1:
				return "Monitor";
			case 2:
				return "Tutor";
			case 3:
				return "Monitor/Tutor";
			default:
				return "Unknown";
		}
	};

	console.log("labs", labs);

	return (
		<View style={styles.container}>
			{/* Picker to select the department (visible to admins) */}
			{isAdmin && !initialDepartment && (
				<Picker
					selectedValue={selectedDepartment?.deptId}
					onValueChange={(itemValue) => {
						const dept = departments.find((dept) => dept.deptId == itemValue);
						setSelectedDepartment(dept || null);
						if (dept) {
							fetchLabsAndEmployees(dept.deptId);
						}
					}}
					style={styles.picker}
				>
					{departments.map((dept) => (
						<Picker.Item
							key={dept.deptId}
							label={dept.name}
							value={dept.deptId}
						/>
					))}
				</Picker>
			)}

			{/* <Text style={styles.header}>Manage Labs</Text> */}

			{/* Tabs for switching between Labs and Employees */}
			<View style={styles.tabsContainer}>
				<TouchableOpacity
					style={[styles.tab, activeTab === "Labs" && styles.activeTab]}
					onPress={() => setActiveTab("Labs")}
				>
					<Text style={styles.tabText}>Labs</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.tab, activeTab === "Employees" && styles.activeTab]}
					onPress={() => setActiveTab("Employees")}
				>
					<Text style={styles.tabText}>Employees</Text>
				</TouchableOpacity>
			</View>

			{/* Table headers based on the active tab */}
			<View style={styles.tableHeader}>
				{activeTab === "Labs" ? (
					<>
						<Text style={[styles.tableHeaderText, styles.tableHeaderLabName]}>
							Lab Name
						</Text>
						<Text style={[styles.tableHeaderText, styles.tableHeaderLabRoom]}>
							Room Number
						</Text>
						<Text style={[styles.tableHeaderText, styles.tableHeaderActions]}>
							Actions
						</Text>
					</>
				) : (
					<>
						<Text
							style={[styles.tableHeaderText, styles.tableHeaderEmployeeId]}
						>
							ID
						</Text>
						<Text
							style={[styles.tableHeaderText, styles.tableHeaderEmployeeName]}
						>
							Name
						</Text>
						<Text
							style={[styles.tableHeaderText, styles.tableHeaderEmployeeRole]}
						>
							Role
						</Text>
						<Text style={[styles.tableHeaderText, styles.tableHeaderActions]}>
							Actions
						</Text>
					</>
				)}
			</View>

			{/* List of labs or employees based on the active tab */}
			{/* <View style={styles.flatlistview}> */}
				{activeTab === "Labs" ? (
					labs.length > 0 ? (
						<FlatList
							data={labs}
							keyExtractor={(lab) => lab.labId.toString()}
							renderItem={renderLabItem}
							style={styles.flatlistview}
              scrollEnabled={true}
              />
            ) : (
              <Text style={styles.noDataText}>No Labs Found</Text>
            )
          ) : employees.length > 0 ? (
            <FlatList
						data={employees}
						keyExtractor={(employee) => employee.userId.toString()}
						renderItem={renderEmployeeItem}
            style={styles.flatlistview}
            scrollEnabled={true}
					/>
				) : (
					<Text style={styles.noDataText}>No Employees Found</Text>
				)}
			{/* </View> */}

			{/* Add Lab button */}
			{isAdmin && activeTab === "Labs" && (
				<TouchableOpacity
					style={styles.addButton}
					onPress={() => {
						setEditingLab(null);
						setIsEditing(false);
						setLabFormVisible(true);
					}}
				>
					<Text style={styles.addButtonText}>Add Lab</Text>
				</TouchableOpacity>
			)}

			{/* Add Employee button */}
			{isAdmin && activeTab === "Employees" && (
				<TouchableOpacity
					style={styles.addButton}
					onPress={() => {
						setSearchModalVisible(true);
					}}
				>
					<Text style={styles.addButtonText}>Add Employee</Text>
				</TouchableOpacity>
			)}

			{/* Lab Form */}
			<LabFormModal
				isLabFormVisible={isLabFormVisible}
				isEditing={isEditing}
				setLabFormVisible={setLabFormVisible}
				setEditingLab={setEditingLab}
				setIsEditing={setIsEditing}
				editingLab={editingLab}
				handleCreateOrUpdateLab={handleCreateOrUpdateLab}
				formError={formError}
			/>

			{/* Employee Edit Form */}
			<EditUserModal
				visible={isEmployeeFormVisible}
				title={"Update Employee"}
				onClose={() => {
					setEmployeeFormVisible(false);
					setEditingUser(null);
					setIsEditing(false);
				}}
				user={editingUser}
				onSave={handleCreateOrUpdateUser}
			/>

			{/* Employee Add Form */}
			<EmployeeFormModal
				visible={isEmployeeFormVisible}
				title={"Add Employee"}
				onClose={() => {
					setEditingUser(null);
					setIsEditing(false);
				}}
				onSave={handleCreateOrUpdateUser}
				user={editingUser}
				isEditing={isEditing}
			/>

			<FuzzySearchModal
				visible={isSearchModalVisible}
				onClose={() => setSearchModalVisible(false)}
				onSelectUser={handleSelectUser}
			/>

			{/* Actions Modal */}
			<ActionsModal
				visible={isActionsMenuVisible}
				onClose={() => setActionsMenuVisible(false)}
				actionButtons={actionButtons}
			/>

			{/* Confirmation Modal */}
			<ConfirmationModal
				visible={isDeleteModalVisible}
				title={<Text>Confirm Deletion</Text>}
				description={
					<Text>
						Are you sure you want to delete this {activeTab.toLowerCase()}? This
						action cannot be undone.
					</Text>
				}
				onConfirm={activeTab === "Labs" ? confirmDeleteLab : confirmDeleteUser}
				onCancel={() => setDeleteModalVisible(false)}
				type="yesNoDanger"
			/>

			<ConfirmMonitorModal
				visible={isConfirmModalVisible}
				user={itemForAction}
				onClose={() => setConfirmModalVisible(false)}
				onSave={handleSave}
			/>
		</View>
	);
};

// Styling for the component
const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		// backgroundColor: "indianred",
    // width:"100%",
    // height:"100%"
	},
	header: {
		fontSize: 24,
		height: 25,
		backgroundColor: "lightgray",
		fontWeight: "bold",
		marginBottom: 20,
		// backgroundColor:"red"
	},
	label: {
		fontSize: 16,
		marginBottom: 5,
	},
  pickerView:{

  },
	picker: {
		marginBottom: 20,
		height: 40,
		backgroundColor: "ghostwhite",
	},
	tabsContainer: {
		flexDirection: "row",
		marginBottom: 20,
		height: 50,
	},
	tab: {
		flex: 1,
		alignItems: "center",
		padding: 10,
		borderBottomWidth: 2,
		borderBottomColor: "#ccc",
	},
	activeTab: {
		borderBottomColor: "#ffc107",
	},
	tabText: {
		fontSize: 18,
	},
	tableHeader: {
		flexDirection: "row",
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#ccc",
		// backgroundColor: '#f8f8f8',
		// backgroundColor: "pink",
		marginBottom: 10,
    paddingHorizontal:10,
		height: 50,
	},
	tableHeaderText: {
		fontWeight: "bold",
	},
	tableHeaderLabName: {
		flex: 2,
	},
	tableHeaderLabRoom: {
		flex: 1,
	},
	tableHeaderEmployeeId: {
		flex: 1,
	},
	tableHeaderEmployeeName: {
		flex: 2,
	},
	tableHeaderEmployeeRole: {
		flex: 1,
	},
	tableHeaderActions: {
		flex: 1,
		textAlign: "center",
	},
	entryRow: {
		flexDirection: "row",
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#ccc",
		backgroundColor: "gainsboro",
	},
	flatlistview: {
		// backgroundColor:"blue",
		// borderStyle: "solid",
		// borderWidth: 1,
		// borderColor: "black",
		flex: 1,
		height: 350,
    paddingBottom:370,
	},
	tableCell: {
		justifyContent: "center",
		paddingHorizontal: 10,
		minHeight: 50,
	},
	cellText: {
		textAlign: "left",
	},
	tableCellLabName: {
		flex: 2,
	},
	tableCellLabRoom: {
		flex: 1,
	},
	tableCellActions: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "center",
	},
	tableCellEmployeeId: {
		flex: 1,
	},
	tableCellEmployeeName: {
		flex: 2,
	},
	tableCellEmployeeRole: {
		flex: 1,
	},
	actionButton: {
		marginLeft: 10,
	},
	iconImage: {
		width: 20,
		height: 20,
	},
	addButton: {
		// position: "absolute",
		// right: 20,
		// bottom: 20,
		backgroundColor: "#ffc107",
		padding: 15,
		borderRadius: 50,
    height:50,
    textAlign:"center",
    width:120,
    marginTop:10,
    justifyContent:"center",
    alignItems:"center"
	},
	addButtonText: {
		color: "white",
		fontWeight: "bold",
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 10,
		borderRadius: 10,
		marginBottom: 10,
	},
	inputError: {
		borderColor: "red",
	},
	noDataText: {
		textAlign: "center",
		fontSize: 18,
		color: "#777",
		marginVertical: 20,
		height: 25,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},
	readOnlyInput: {
		flex: 1,
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 10,
		borderRadius: 10,
		height: 45,
		backgroundColor: "#aaaaaaaa",
	},
	iconButton: {
		marginLeft: 10,
	},
	searchIcon: {
		width: 45,
		height: 45,
	},
});

export default ManageLabsMobile;
