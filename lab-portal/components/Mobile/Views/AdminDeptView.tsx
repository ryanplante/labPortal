import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Button, ActivityIndicator, Dimensions, Image } from 'react-native';
import DepartmentService, { Department } from '../../../services/departmentService';
import DynamicForm from '../../Modals/DynamicForm';
import ConfirmationModal from '../../Modals/ConfirmationModal';
import ActionsModal from '../../Modals/ActionsModal';
import UserSearcher from '../../Modals/UserSearcher';
import userService, { User } from '../../../services/userService';
import MobileDynamicForm from '../../Modals/MobileDynamicForm';
import { useNavigation } from '@react-navigation/native';

const AdminDeptView = ({ navigation }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedDepartmentHead, setSelectedDepartmentHead] = useState<User | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isTeacherSearcherOpen, setTeacherSearcherOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isActionsMenuVisible, setActionsMenuVisible] = useState(false);
  const [departmentForAction, setDepartmentForAction] = useState<Department | null>(null);
  const [passwordVisibility, setPasswordVisibility] = useState<{ [key: number]: boolean }>({});
  const [formPasswordVisible, setFormPasswordVisible] = useState<boolean>(false);

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const fetchedDepartments = await DepartmentService.getAllDepartments();
      setDepartments(fetchedDepartments);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    } finally {
      setLoading(false);
    }
  };

//   console.log(departments)

  const fetchDepartmentHead = async (deptId: number) => {
    try {
      const usersResponse = await userService.getAllUsers();
      const users = usersResponse.$values;
      if (!Array.isArray(users)) {
        throw new Error('Expected an array of users');
      }

      const head = users.find(user => user.privLvl === 4 && user.userDept === deptId);
      setSelectedDepartmentHead(head || null);
    } catch (error) {
      console.error('Failed to fetch department head:', error);
    }
	console.log("am I getting here?")
  };

  const navigateToLabManager = (department: Department | null) => {
    navigation.navigate('ManageLabs', { department }); // Navigate to ManageLabs with the department prop
  };

  const handleCreateOrUpdateDepartment = async () => {
    let errors = {};

    if (!selectedDepartment) {
      errors['department'] = 'Department details are missing.';
    } else {
      if (!selectedDepartment.name) {
        errors['name'] = 'Name is required.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Please fix the highlighted errors.');
      return;
    }

    try {
      const departmentDto = {
        name: selectedDepartment?.name || '',
        password: selectedDepartment?.password || undefined,
        departmentHeadId: selectedDepartmentHead?.userId || null,
      };

      if (selectedDepartment?.deptId) {
        await DepartmentService.updateDepartment(selectedDepartment.deptId, departmentDto);
      } else {
        await DepartmentService.createDepartment(departmentDto);
      }

      await fetchDepartments();
      setFormOpen(false);
      resetForm();
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.includes('already a department head')) {
        setError('The selected user is already a department head.');
      } else {
        setError('Failed to save the department. Please try again.');
      }
      console.error('Error saving department:', error);
    }
  };

  const handleEdit = async (department: Department) => {
    setSelectedDepartment(department);
    await fetchDepartmentHead(department.deptId);
    setFormPasswordVisible(false); 
    setFormOpen(true);
    setError(null);
    setValidationErrors({});
	console.log("what about here")
  };

  const handleDelete = (department: Department) => {
    setDepartmentToDelete(department);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (departmentToDelete) {
      try {
        await DepartmentService.deleteDepartment(departmentToDelete.deptId);
        await fetchDepartments();
      } catch (error) {
        console.error('Failed to delete department:', error);
      } finally {
        setDeleteModalVisible(false);
        setDepartmentToDelete(null);
        setActionsMenuVisible(false);
      }
    }
  };

  const resetForm = () => {
    setSelectedDepartment(null);
    setSelectedDepartmentHead(null);
    setError(null);
    setValidationErrors({});
  };

  const openActionsMenu = (department: Department) => {
    setDepartmentForAction(department);
    setActionsMenuVisible(true);
  };

  const togglePasswordVisibility = (deptId: number) => {
    setPasswordVisibility(prevState => ({
      ...prevState,
      [deptId]: !prevState[deptId],
    }));
  };

  const clearDepartmentHead = () => {
    setSelectedDepartmentHead(null);
  };

  const actionButtons = [
    {
      name: 'Edit',
      icon: require('../../../assets/edit.png'),
      onPress: () => {
        setActionsMenuVisible(false);
        handleEdit(departmentForAction!);
      },
    },
    {
      name: 'Delete',
      icon: require('../../../assets/trash.png'),
      onPress: () => {
        setActionsMenuVisible(false);
        handleDelete(departmentForAction!);
      },
    },
    {
      name: 'Manage Labs',
      icon: require('../../../assets/manage-lab-action.png'),
      onPress: () => {
        setActionsMenuVisible(false);
        navigateToLabManager(departmentForAction);
      },
    },
  ];
  

  const formComponents = [
    <View key="nameWrapper">
      <Text style={styles.label}>
        Name <Text style={[styles.required, !validationErrors.name && styles.hiddenAsterisk]}>*</Text>
      </Text>
      <TextInput
        style={[styles.input, validationErrors.name ? styles.inputError : null]}
        placeholder="Department Name"
        value={selectedDepartment?.name || ''}
        onChangeText={(text) => {
          setSelectedDepartment((prev) => prev ? { ...prev, name: text } : { deptId: 0, name: text, password: null });
          setValidationErrors((prev) => ({ ...prev, name: '' }));
        }}
      />
      {validationErrors.name && <Text style={styles.errorText}>{validationErrors.name}</Text>}
    </View>,
    <View key="passwordWrapper">
      <Text style={styles.label}>
        Password
      </Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, validationErrors.password ? styles.inputError : null, styles.passwordInput]}
          placeholder="Password"
          secureTextEntry={!formPasswordVisible}
          maxLength={4}
          value={selectedDepartment?.password || ''}
          onChangeText={(text) => {
            setSelectedDepartment((prev) => prev ? { ...prev, password: text } : { deptId: 0, name: '', password: text });
            setValidationErrors((prev) => ({ ...prev, password: '' }));
          }}
        />
        {selectedDepartment?.password && (
          <Pressable onPress={() => setFormPasswordVisible(!formPasswordVisible)}>
            <Image 
              source={formPasswordVisible ? require('../../../assets/eyeball-hide.png') : require('../../../assets/eyeball.png')} 
              style={styles.eyeIcon} 
            />
          </Pressable>
        )}
      </View>
      {validationErrors.password && <Text style={styles.errorText}>{validationErrors.password}</Text>}
    </View>,
    <View key="departmentHeadWrapper">
      <Text style={styles.label}>
        Department Head
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.readOnlyInput}
          placeholder="Select Department Head"
          value={`${selectedDepartmentHead?.fName || ''} ${selectedDepartmentHead?.lName || ''}`}
          editable={false}
        />
        <Pressable
          style={styles.iconButton}
          onPress={() => setTeacherSearcherOpen(true)}
        >
          <Image source={require('../../../assets/search-button.png')} style={styles.searchIcon} />
        </Pressable>
        {selectedDepartmentHead && (
          <Pressable
            style={styles.clearButton}
            onPress={clearDepartmentHead}
          >
            <Text style={styles.clearText}>X</Text>
          </Pressable>
        )}
      </View>
      {validationErrors.departmentHead && <Text style={styles.errorText}>{validationErrors.departmentHead}</Text>}
    </View>,
    <Button
      key="submit"
      title={selectedDepartment?.deptId ? 'Update' : 'Create'}
      onPress={handleCreateOrUpdateDepartment}
      color="#FFC107"
    />,
  ];

  return (
    <>
      {loading ? (
        <ActivityIndicator size="large" color="#FFC107" />
      ) : (
        <>
          <Pressable style={styles.addButton} onPress={() => setFormOpen(true)}>
            <Text style={styles.addButtonText}>Add New Department</Text>
          </Pressable>

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.tableHeaderCellName]}>Name</Text>
            <Text style={[styles.tableHeaderCell, styles.tableHeaderCellPassword]}>Password</Text>
            {screenWidth >= 600 && (
              <Text style={[styles.tableHeaderCell, styles.tableHeaderCellActions]}>Actions</Text>
            )}
          </View>

          <FlatList
            data={departments}
            keyExtractor={(department) => department.deptId.toString()}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => openActionsMenu(item)}
                style={[styles.entryRow]}
              >
                <View style={styles.tableCellName}>
                  <Text>{item.name}</Text>
                </View>
                <View style={styles.tableCellPassword}>
                  <View style={styles.passwordContainer}>
                    <Text>{item.password ? (passwordVisibility[item.deptId] ? item.password : '••••••••') : 'No Password'}</Text>
                    {item.password && (
                      <Pressable onPress={() => togglePasswordVisibility(item.deptId)}>
                        <Image 
                          source={passwordVisibility[item.deptId] ? require('../../../assets/eyeball-hide.png') : require('../../../assets/eyeball.png')} 
                          style={styles.eyeIcon} 
                        />
                      </Pressable>
                    )}
                  </View>
                </View>
                {screenWidth >= 600 && (
                  <View style={styles.tableCellActions}>
                    <Pressable onPress={() => handleEdit(item)} style={styles.iconButton}>
                      <Image source={require('../../../assets/edit.png')} style={styles.iconImage} />
                    </Pressable>
                    <Pressable onPress={() => handleDelete(item)} style={styles.iconButton}>
                      <Image source={require('../../../assets/trash.png')} style={styles.iconImage} />
                    </Pressable>
                    <Pressable onPress={() => navigateToLabManager(item)} style={styles.iconButton}>
                      <Image source={require('../../../assets/manage-lab-action.png')} style={styles.iconImage} />
                    </Pressable>
                  </View>
                )}
              </Pressable>
            )}
          />

          <ConfirmationModal
            visible={isDeleteModalVisible}
            title={<Text>Confirm Deletion</Text>}
            description={<Text>Are you sure you want to delete this department? This action cannot be undone.</Text>}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteModalVisible(false)}
            type="yesNoDanger"
          />

			<MobileDynamicForm
            visible={isFormOpen}
            title={selectedDepartment?.deptId ? 'Update Department' : 'Add Department'}
            onClose={() => {
              setFormOpen(false);
              resetForm();
            }}
            components={
              isTeacherSearcherOpen ? (
                [[<UserSearcher
                    key="userSearcher"
                    onSelect={(user) => {
                        if (user.userId === selectedDepartmentHead?.userId) {
                            setError('Selected user is already the department head.');
                            return;
                        }
                        setSelectedDepartmentHead(user);
                        setTeacherSearcherOpen(false);
                        setError(null);
                    }}
                    onBackPress={() => setTeacherSearcherOpen(false)}
                    isTeacher={true}
                />
                ]]
              ) : (
                [formComponents] 
              )
            }
            error={error}
          />

          <ActionsModal
            visible={isActionsMenuVisible}
            onClose={() => setActionsMenuVisible(false)}
            actionButtons={actionButtons}
          />
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20

	// flexDirection:"column"
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
	height:50
  },
  addButton: {
    backgroundColor: '#ffc107',
    padding: 10,
    borderRadius: 5,
    marginVertical: 20,
	height:40
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#f0f0f0',
	height:40,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableHeaderCellName: {
    flex: 3,
  },
  tableHeaderCellPassword: {
    flex: 2,
  },
  tableHeaderCellActions: {
    flex: 2,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
	height:80,
  },
  tableCellName: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableCellPassword: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableCellActions: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    height: 40,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  required: {
    color: 'red',
  },
  hiddenAsterisk: {
    color: 'transparent',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 2,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    width: 25,
    height: 25,
    marginLeft: 10,
  },
  iconButton: {
    marginHorizontal: 5,
  },
  iconImage: {
    width: 20,
    height: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  readOnlyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    height: 45,
    backgroundColor: '#eaeaea',
  },
  searchIcon: {
    width: 45,
    height: 45,
  },
  clearButton: {
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AdminDeptView