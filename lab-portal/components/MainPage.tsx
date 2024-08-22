import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import ProfileSidebar from './Modals/ProfileSidebar';
import StudentView from './Desktop/Views/StudentView';
import MonitorView from './Desktop/Views/MonitorView';
import TutorView from './Desktop/Views/TutorView';
import TutorMonitorView from './Desktop/Views/HybridView';
import DepartmentHeadView from './Desktop/Views/DepartmentHeadView';
import AdminView from './Desktop/Views/AdminView';
import MobileStudentView from './Mobile/Views/StudentView';
import MobileMonitorView from './Mobile/Views/MonitorView';
import MobileTutorView from './Mobile/Views/TutorView';
import MobileTutorMonitorView from './Mobile/Views/HybridView';
import MobileDepartmentHeadView from './Mobile/Views/DepartmentHeadView';
import MobileAdminView from './Mobile/Views/AdminView';
import { isMobile } from 'react-device-detect';

const MainPage = () => {
  const [isProfileSidebarVisible, setIsProfileSidebarVisible] = useState(false);
  const [selectedView, setSelectedView] = useState('Admin');

  const toggleProfileSidebar = () => {
    setIsProfileSidebarVisible(!isProfileSidebarVisible);
  };

  const renderView = () => {
    console.log(isMobile)
    console.log(selectedView)
    if(!isMobile){
      console.log("is mobile == false (hopefully)")
      
      switch (selectedView) {
      case 'Student':
        return <StudentView />;
      case 'Monitor':
        return <MonitorView />;
      case 'Tutor':
        return <TutorView />;
      case 'Tutor/Monitor':
        return <TutorMonitorView />;
      case 'Department Head':
        return <DepartmentHeadView />;
      case 'Admin':
      default:
        return <AdminView />;
    }
    } else {
      console.log("isMobile is true (hopefully)")
      switch (selectedView) {
        case 'Student':
          return <MobileStudentView />;
        case 'Monitor':
          return <MobileMonitorView />;
        case 'Tutor':
          return <MobileTutorView />;
        case 'Tutor/Monitor':
          return <MobileTutorMonitorView />;
        case 'Department Head':
          return <MobileDepartmentHeadView />;
        case 'Admin':
        default:
          return <MobileAdminView />;
      }
    }
    
  };

  const responsiveMargins = {
    marginLeft: isMobile ? 10 : 80,
  }

  return (
    <View style={[styles.container, responsiveMargins]}>
      {isProfileSidebarVisible && !isMobile && (
        <ProfileSidebar visible={isProfileSidebarVisible} onClose={toggleProfileSidebar} />
      )}
      <View style={styles.mainContent}>
        <Picker
          selectedValue={selectedView}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedView(itemValue)}
        >
          <Picker.Item label="Student" value="Student" />
          <Picker.Item label="Monitor" value="Monitor" />
          <Picker.Item label="Tutor" value="Tutor" />
          <Picker.Item label="Tutor/Monitor" value="Tutor/Monitor" />
          <Picker.Item label="Department Head" value="Department Head" />
          <Picker.Item label="Admin" value="Admin" />
        </Picker>
        {renderView()}
        <Image source={require('../assets/tiger-logo.png')} style={styles.tigerLogo} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
  },
  mainContent: {
    flex: 1,
    padding: 20,
    // marginLeft: 80, // Default margin when sidebar is not visible
  },
  picker: {
    height: 50,
    width: 200,
    marginBottom: 20,
  },
  tigerLogo: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    opacity: 0.1,
    width: 300,
    height: 300,
  },
});

export default MainPage;
