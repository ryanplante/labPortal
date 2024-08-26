import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useEffect } from "react";
import { AdminUsersView } from "./Views/AdminUsersView";
import DepartmentHeadView from "../Desktop/Views/DepartmentHeadView";
import { AdminDeptView } from "./Views/AdminDeptView";
import { AdminLabView } from "./Views/AdminLabView";

const MobileAdmin = () => {
	const [selectedView, setSelectedView] = useState("Users");

	const renderView = () => {
		switch (selectedView) {
			case "Users":
				console.log("users view")
				return <AdminUsersView />;
			case "Departments":
				console.log("dept view")
				return <AdminDeptView />;
			case "Labs":
				console.log("lab view")
				return <AdminLabView />;
		}
	};
	return (
		<View style={[styles.container]}>
			<Text style={styles.text}>Mobile Admin</Text>
			<View style={styles.tabView}>
				<Pressable style={styles.pressable} onPress={() => setSelectedView("Users")}>
					<Text>Users</Text>
				</Pressable>
				<Pressable style={styles.pressable} onPress={() => setSelectedView("Departments")}>
					<Text>Department</Text>
				</Pressable>
				<Pressable style={styles.pressable} onPress={() => setSelectedView("Labs")}>
					<Text>Lab</Text>
				</Pressable>
			</View>
			<View>{renderView()}</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
	},
	text: {
		fontSize: 20,
	},
	pressable:{
		borderWidth:1,
		borderColor:"black",
		width:"20%",
		backgroundColor:"lightgray",
		marginVertical:5

	},
	tabView:{
		flexDirection:"row",
		height:100
	}
});

export default MobileAdmin;