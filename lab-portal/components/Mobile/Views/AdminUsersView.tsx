import axios from "axios";
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import userService from "../../../services/userService";

const AdminUsersView = () => {
	const [searchText, setSearchText] = useState("");
	const [searchResults, setSearchResults] = useState([]);

	type SearchResultType = {
		$id: Number;
		fName: String;
		lName: String;
		privLvl: Number;
		userDept: String;
		userId: Number;
	};

	useEffect(() => {
		// Function to fetch data from the API
		const fetchSearchResults = async () => {
			if (searchText.length > 0) {
				// Make sure to only search if there's input
				try {
					let trimmedSearchText = searchText;
					// if (searchText.length > 2 && searchText.substring(0, 2) == "00") {
					// 	trimmedSearchText = searchText.slice(2);
					// }
					// //trim off leading zeroes

					const response = await userService.fuzzySearchById(
						Number(trimmedSearchText)
					);
					const departments = await axios.get(
						`${process.env.EXPO_PUBLIC_API}/Departments`
					);
					const departmentsValues = departments.data.$values;

					const updatedResults = response.$values.map((user) => ({
						...user,
						userDept: departmentsValues.find((o) => o.deptId === user.userDept)
							.name,
					}));

					console.log(updatedResults);

					setSearchResults(updatedResults);
				} catch (error) {
					console.error("Error fetching search results:", error);
				}
			} else {
				setSearchResults([]); // Clear results when input is empty
			}
		};

		fetchSearchResults();
	}, [searchText]);

	//   console.log(searchResults)

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
			<View style={styles.tableBody}>
				{searchResults.map((result, index) => (
					<View key={index} style={styles.tableRow}>
						<Text style={styles.tableCell}>
							{result.userId.toString().padStart(9, "0")}
						</Text>
						<Text style={styles.tableCell}>
							{result.fName} {result.lName}
						</Text>
						<Text style={styles.tableCell}>{result.userDept}</Text>
						<Text style={styles.tableCell}>{result.privLvl}</Text>
					</View>
				))}
			</View>
		</View>
	);
};

const boderColor = "lightblue";

const styles = StyleSheet.create({
	container: {
		width: "100%",
		height: "100%",
		alignItems: "center",
		backgroundColor: "lightblue",
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
