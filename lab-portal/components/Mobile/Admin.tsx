import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	Pressable,
	SafeAreaView,
	StatusBar,
} from "react-native";
import { useEffect } from "react";
import AdminUsersView from "./Views/AdminUsersView";
import DepartmentHeadView from "../Desktop/Views/DepartmentHeadView";
import AdminDeptView from "./Views/AdminDeptView";
import AdminLabView from "./Views/AdminLabView";
import AdminItemsView from "./Views/AdminItemsView";

const MobileAdmin = () => {
	const [selectedView, setSelectedView] = useState("Users");

	const renderView = () => {
		switch (selectedView) {
			case "Users":
				console.log("users view");
				return <AdminUsersView />;
			case "Departments":
				console.log("dept view");
				return <AdminDeptView />;
			case "Labs":
				console.log("lab view");
				return <AdminLabView />;
			case "Items":
				console.log("items view");
				return <AdminItemsView />;
		}
	};
	return (
		<SafeAreaView style={[styles.container]}>
			<Text style={styles.text}>Mobile Admin</Text>
			<View style={styles.tabView}>
				<Pressable
					style={styles.pressable}
					onPress={() => setSelectedView("Users")}
				>
					<Text>Users</Text>
				</Pressable>
				<Pressable
					style={styles.pressable}
					onPress={() => setSelectedView("Departments")}
				>
					<Text>Departments</Text>
				</Pressable>
				<Pressable
					style={styles.pressable}
					onPress={() => setSelectedView("Labs")}
				>
					<Text>Labs</Text>
				</Pressable>
				<Pressable
					style={styles.pressable}
					onPress={() => setSelectedView("Items")}
				>
					<Text>Items</Text>
				</Pressable>
			</View>
			<View>{renderView()}</View>
		</SafeAreaView>
	);
};

export default MobileAdmin;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		// justifyContent: "center",
		alignItems: "center",
		width: "100%",
		marginTop: StatusBar.currentHeight,
	},
	text: {
		fontSize: 20,
	},
	pressable: {
		borderWidth: 1,
		borderColor: "black",
		width: "20%",
		backgroundColor: "lightgray",
		marginVertical: 5,
	},
	tabView:{
		flexDirection:"row",
		height:100
	}
});
