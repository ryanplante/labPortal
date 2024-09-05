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
				// console.log("users view");
				return <AdminUsersView />;
			case "Departments":
				// console.log("dept view");
				return <AdminDeptView />;
			case "Labs":
				// console.log("lab view");
				return <AdminLabView />;
			case "Items":
				// console.log("items view");
				return <AdminItemsView />;
		}
	};
	return (
		<SafeAreaView style={[styles.container]}>
			<View style={styles.tabView}>
				<Pressable
					style={[
						styles.pressable,
						selectedView === "Users" && styles.selectedPressable,
					]}
					onPress={() => setSelectedView("Users")}
				>
					<Text style={[styles.pressableText]}>Users</Text>
				</Pressable>

				<Pressable
					style={[
						styles.pressable,
						selectedView === "Departments" && styles.selectedPressable,
					]}
					onPress={() => setSelectedView("Departments")}
				>
					<Text style={styles.pressableText}>Departments</Text>
				</Pressable>
				<Pressable
					style={[
						styles.pressable,
						selectedView === "Labs" && styles.selectedPressable,
					]}
					onPress={() => setSelectedView("Labs")}
				>
					<Text style={styles.pressableText}>Labs</Text>
				</Pressable>
				<Pressable
					style={[
						styles.pressable,
						selectedView === "Items" && styles.selectedPressable,
					]}
					onPress={() => setSelectedView("Items")}
				>
					<Text style={styles.pressableText}>Items</Text>
				</Pressable>
			</View>
			<View style={styles.renderView}>{renderView()}</View>
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
	renderView:{
		width:"100%"
	},
	text: {
		fontSize: 20,
	},
	pressable: {
		// borderWidth: 1,
		// borderColor: "black",
		width: "25%",
		backgroundColor: "lightgray",
		justifyContent: "center",
	},
	pressableText: {
		width: "100%",
		textAlign: "center",
		fontSize: 20,
	},
	tabView: {
		flexDirection: "row",
		height: 60,
		width: "100%",
	},
	selectedPressable: {
		backgroundColor: "#f2f2f2",
	},
	modalTitle: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 10,
		color: "#000",
	},
});
