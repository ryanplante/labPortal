import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import MobileMonitorView from './Views/MonitorView';
import MobileStudentView from './Views/StudentView';
import MobileTutorView from './Views/TutorView';
import MobileTutorMonitorView from './Views/HybridView';
import MobileDepartmentHeadView from './Views/DepartmentHeadView';
import MobileAdminView from './Views/AdminView';
import { isMobile } from 'react-device-detect';
import ProfileSidebar from './ProfileSidebar';

const MobileMainPage = () => {
  const [isProfileSidebarVisible, setIsProfileSidebarVisible] = useState(false);
  const [selectedView, setSelectedView] = useState('Admin');

  const toggleProfileSidebar = () => {
    setIsProfileSidebarVisible(!isProfileSidebarVisible);
  };

  const renderView = () => {
    console.log(isMobile)
    console.log(selectedView)
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
    
  };

  return (
    <View style={styles.container}>
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
        <Image source={require('../../assets/tiger-logo.png')} style={styles.tigerLogo} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
  },
  mainContent: {
    flex: 1,
    padding: 20,
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

export default MobileMainPage;
