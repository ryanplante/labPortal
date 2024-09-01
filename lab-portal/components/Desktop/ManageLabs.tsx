import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Picker, FlatList, TouchableOpacity, TextInput, Image, Button, Alert } from 'react-native';
import userService, { User } from '../../services/userService';
import LabService, { Lab } from '../../services/labsService';
import DepartmentService, { Department } from '../../services/departmentService';
import { getUserByToken } from '../../services/loginService';
import DynamicForm from '../Modals/DynamicForm';
import ActionsModal from '../Modals/ActionsModal';
import ConfirmationModal from '../Modals/ConfirmationModal';

const ManageLabs = ({ route, navigation, department: initialDepartment }: { route: any; navigation: any; department?: Department }) => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(initialDepartment || route.params?.department || null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('Labs');
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isActionsMenuVisible, setActionsMenuVisible] = useState(false);
  const [selectedItemForAction, setSelectedItemForAction] = useState<Lab | User | null>(null);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Lab | User | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadUserInfo();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      fetchLabsAndEmployees(selectedDepartment.deptId);
    }
  }, [selectedDepartment]);

  const loadUserInfo = async () => {
    try {
      const user = await getUserByToken();
      setIsAdmin(user.privLvl >= 5);

      if (!selectedDepartment && !initialDepartment) {
        const defaultDept = { deptId: user.userDept } as Department;
        setSelectedDepartment(defaultDept);
      }

      if (user.privLvl >= 5) {
        const fetchedDepartments = await DepartmentService.getAllDepartments();
        setDepartments(fetchedDepartments);

        if (!selectedDepartment && initialDepartment) {
          setSelectedDepartment(initialDepartment);
        }
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const fetchLabsAndEmployees = async (deptId: number) => {
    try {
      const fetchedLabs = await LabService.getLabByDept(deptId);
      setLabs(fetchedLabs.$values || []);

      const response = await userService.getAllUsers();
      const fetchedUsers = response.$values || [];
      const filteredEmployees = fetchedUsers.filter(emp => emp.userDept === deptId && emp.privLvl > 0);
      setEmployees(filteredEmployees);
    } catch (error) {
      console.error('Error fetching labs or employees:', error);
    }
  };

  const validateFormData = (formData: { name: string; roomNum: string }) => {
    if (formData.name.length > 25) {
      return 'Lab Name must be 25 characters or less.';
    }
    if (formData.roomNum.length > 5) {
      return 'Room Number must be 5 characters or less.';
    }
    return null;
  };

  const handleCreateOrUpdateLab = async (formData: { name: string; roomNum: string }) => {
    const validationError = validateFormData(formData);
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError(null);

    try {
      const selectedDeptId = selectedDepartment?.deptId;
      if (isEditing && editingLab) {
        await LabService.updateLab(editingLab.labId, { ...editingLab, ...formData, deptId: selectedDeptId });
        Alert.alert('Success', 'Lab updated successfully');
      } else {
        await LabService.createLab({ ...formData, deptId: selectedDeptId });
        Alert.alert('Success', 'Lab created successfully');
      }
      setIsFormVisible(false);
      setEditingLab(null);
      setIsEditing(false);
      fetchLabsAndEmployees(selectedDeptId || 0);
    } catch (error) {
      console.error('Error creating/updating lab:', error);
    }
  };

  const handleEditLab = (lab: Lab) => {
    setEditingLab(lab);
    setIsEditing(true);
    setIsFormVisible(true);
  };

  const handleDeleteLab = async (lab: Lab) => {
    setItemToDelete(lab);
    setDeleteModalVisible(true);
    setActionsMenuVisible(false);
  };

  const confirmDeleteLab = async () => {
    if (itemToDelete && 'labId' in itemToDelete) {
      try {
        await LabService.deleteLab(itemToDelete.labId);
        fetchLabsAndEmployees(selectedDepartment?.deptId || 0);
        Alert.alert('Success', 'Lab deleted successfully');
      } catch (error) {
        console.error('Error deleting lab:', error);
      } finally {
        setDeleteModalVisible(false);
        setItemToDelete(null);
      }
    }
  };

  const handleDeleteEmployee = async (employee: User) => {
    setItemToDelete(employee);
    setDeleteModalVisible(true);
    setActionsMenuVisible(false);
  };

  const confirmDeleteEmployee = async () => {
    if (itemToDelete && 'userId' in itemToDelete) {
      try {
        Alert.alert('Success', 'Employee deleted successfully');
      } catch (error) {
        console.error('Error deleting employee:', error);
      } finally {
        setDeleteModalVisible(false);
        setItemToDelete(null);
      }
    }
  };

  const openActionsMenu = (item: Lab | User) => {
    setSelectedItemForAction(item);
    setActionsMenuVisible(true);
  };

  const handleEditEmployee = (employee: User) => {
    console.log('Editing employee:', employee);
  };

  const actionButtons = activeTab === 'Labs' ? [
    {
      name: 'Edit',
      icon: require('../../assets/edit.png'),
      onPress: () => {
        setActionsMenuVisible(false);
        handleEditLab(selectedItemForAction as Lab);
      },
    },
    {
      name: 'Delete',
      icon: require('../../assets/trash.png'),
      onPress: () => {
        setActionsMenuVisible(false);
        handleDeleteLab(selectedItemForAction as Lab);
      },
    },
  ] : [
    {
      name: 'Edit',
      icon: require('../../assets/edit.png'),
      onPress: () => {
        setActionsMenuVisible(false);
        handleEditEmployee(selectedItemForAction as User);
      },
    },
    {
      name: 'Delete',
      icon: require('../../assets/trash.png'),
      onPress: () => {
        setActionsMenuVisible(false);
        handleDeleteEmployee(selectedItemForAction as User);
      },
    },
  ];

  const renderLabItem = ({ item }: { item: Lab }) => (
    <TouchableOpacity onPress={() => openActionsMenu(item)} style={styles.entryRow}>
      <View style={[styles.tableCell, styles.tableCellLabName]}>
        <Text style={styles.cellText}>{item.name}</Text>
      </View>
      <View style={[styles.tableCell, styles.tableCellLabRoom]}>
        <Text style={styles.cellText}>{item.roomNum}</Text>
      </View>
      <View style={[styles.tableCell, styles.tableCellActions]}>
        <TouchableOpacity onPress={() => handleEditLab(item)} style={styles.actionButton}>
          <Image source={require('../../assets/edit.png')} style={styles.iconImage} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteLab(item)} style={styles.actionButton}>
          <Image source={require('../../assets/trash.png')} style={styles.iconImage} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmployeeItem = ({ item }: { item: User }) => (
    <TouchableOpacity onPress={() => openActionsMenu(item)} style={styles.entryRow}>
      <View style={[styles.tableCell, styles.tableCellEmployeeId]}>
        <Text style={styles.cellText}>{item.userId}</Text>
      </View>
      <View style={[styles.tableCell, styles.tableCellEmployeeName]}>
        <Text style={styles.cellText}>{item.fName} {item.lName}</Text>
      </View>
      <View style={[styles.tableCell, styles.tableCellEmployeeRole]}>
        <Text style={styles.cellText}>{getRoleName(item)}</Text>
      </View>
      <View style={[styles.tableCell, styles.tableCellActions]}>
        <TouchableOpacity onPress={() => handleEditEmployee(item)} style={styles.actionButton}>
          <Image source={require('../../assets/edit.png')} style={styles.iconImage} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteEmployee(item.userId)} style={styles.actionButton}>
          <Image source={require('../../assets/trash.png')} style={styles.iconImage} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const getRoleName = (user: User) => {
    switch (user.privLvl) {
      case 0:
        return user.isTeacher ? 'Teacher' : 'Student';
      case 1:
        return 'Monitor';
      case 2:
        return 'Tutor';
      case 3:
        return 'Hybrid';
      case 4:
        return 'Department Head';
      default:
        return 'Unknown';
    }
  };

  return (
    <View style={styles.container}>
      {isAdmin && !initialDepartment && (
        <Picker
          selectedValue={selectedDepartment?.deptId}
          onValueChange={(itemValue) => {
            const dept = departments.find(dept => dept.deptId == itemValue);
            setSelectedDepartment(dept || null);
            if (dept) {
              fetchLabsAndEmployees(dept.deptId);
            }
          }}
          style={styles.picker}
        >
          {departments.map((dept) => (
            <Picker.Item key={dept.deptId} label={dept.name} value={dept.deptId} />
          ))}
        </Picker>
      )}
      <Text style={styles.header}>Manage Labs</Text>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Labs' && styles.activeTab]}
          onPress={() => setActiveTab('Labs')}
        >
          <Text style={styles.tabText}>Labs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Employees' && styles.activeTab]}
          onPress={() => setActiveTab('Employees')}
        >
          <Text style={styles.tabText}>Employees</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tableHeader}>
        {activeTab === 'Labs' ? (
          <>
            <Text style={[styles.tableHeaderText, styles.tableHeaderLabName]}>Lab Name</Text>
            <Text style={[styles.tableHeaderText, styles.tableHeaderLabRoom]}>Room Number</Text>
            <Text style={[styles.tableHeaderText, styles.tableHeaderActions]}>Actions</Text>
          </>
        ) : (
          <>
            <Text style={[styles.tableHeaderText, styles.tableHeaderEmployeeId]}>ID</Text>
            <Text style={[styles.tableHeaderText, styles.tableHeaderEmployeeName]}>Name</Text>
            <Text style={[styles.tableHeaderText, styles.tableHeaderEmployeeRole]}>Role</Text>
            <Text style={[styles.tableHeaderText, styles.tableHeaderActions]}>Actions</Text>
          </>
        )}
      </View>
      {activeTab === 'Labs' ? (
        labs.length > 0 ? (
          <FlatList
            data={labs}
            keyExtractor={(lab) => lab.labId.toString()}
            renderItem={renderLabItem}
          />
        ) : (
          <Text style={styles.noDataText}>No Labs Found</Text>
        )
      ) : (
        employees.length > 0 ? (
          <FlatList
            data={employees}
            keyExtractor={(employee) => employee.userId.toString()}
            renderItem={renderEmployeeItem}
          />
        ) : (
          <Text style={styles.noDataText}>No Employees Found</Text>
        )
      )}
      {isAdmin && activeTab === 'Labs' && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingLab(null);
            setIsEditing(false);
            setIsFormVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>Add Lab</Text>
        </TouchableOpacity>
      )}

      <DynamicForm
        visible={isFormVisible}
        title={isEditing ? 'Edit Lab' : 'Add Lab'}
        onClose={() => {
          setIsFormVisible(false);
          setEditingLab(null);
          setIsEditing(false);
        }}
        components={[
          [
            <View key="nameGroup">
              <Text style={styles.label}>Lab Name</Text>  
              <TextInput
                key="name"
                placeholder="Lab Name"
                defaultValue={editingLab?.name || ''}
                onChangeText={(text) => {
                  if (editingLab) {
                    setEditingLab({ ...editingLab, name: text });
                  } else {
                    setEditingLab({ name: text, roomNum: '' });
                  }
                }}
                style={[styles.input, formError && formError.includes('Lab Name') ? styles.inputError : null]}
              />
            </View>,
            <View key="roomNumGroup">
              <Text style={styles.label}>Room Number</Text> 
              <TextInput
                key="roomNum"
                placeholder="Room Number"
                defaultValue={editingLab?.roomNum || ''}
                onChangeText={(text) => setEditingLab({ ...editingLab, roomNum: text })}
                style={[styles.input, formError && formError.includes('Room Number') ? styles.inputError : null]}
              />
            </View>,
            <Button
              key="submit"
              title={isEditing ? 'Update Lab' : 'Create Lab'}
              onPress={() => handleCreateOrUpdateLab({ name: editingLab?.name || '', roomNum: editingLab?.roomNum || '' })}
              color="#FFC107"
            />
          ]
        ]}
        error={formError}
      />


      <ActionsModal
        visible={isActionsMenuVisible}
        onClose={() => setActionsMenuVisible(false)}
        actionButtons={actionButtons}
      />

      <ConfirmationModal
        visible={isDeleteModalVisible}
        title={<Text>Confirm Deletion</Text>}
        description={<Text>Are you sure you want to delete this {activeTab.toLowerCase()}? This action cannot be undone.</Text>}
        onConfirm={activeTab === 'Labs' ? confirmDeleteLab : confirmDeleteEmployee}
        onCancel={() => setDeleteModalVisible(false)}
        type="yesNoDanger"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
    label: {
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    marginBottom: 20,
    height: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
  },
  activeTab: {
    borderBottomColor: '#ffc107',
  },
  tabText: {
    fontSize: 18,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#f8f8f8',
    marginBottom: 10,
  },
  tableHeaderText: {
    fontWeight: 'bold',
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
    textAlign: 'center',
  },
  entryRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableCell: {
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  cellText: {
    textAlign: 'left',
  },
  tableCellLabName: {
    flex: 2,
  },
  tableCellLabRoom: {
    flex: 1,
  },
  tableCellActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
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
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#ffc107',
    padding: 15,
    borderRadius: 50,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  inputError: {
    borderColor: 'red',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#777',
    marginVertical: 20,
  },
});

export default ManageLabs;
