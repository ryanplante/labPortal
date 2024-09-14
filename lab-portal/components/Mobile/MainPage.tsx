import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import ProfileSidebar from '../Modals/ProfileSidebar';
import StudentView from './Views/StudentView';
import MonitorView from './Views/MonitorView';
import TutorView from './Views/TutorView';
import TutorMonitorView from './Views/HybridView';
import DepartmentHeadView from './Views/DepartmentHeadView';
import AdminView from './Views/AdminView';
import { isMobile } from 'react-device-detect';
import { getUserByToken } from '../../services/loginService';
import { crossPlatformAlert } from '../../services/helpers';
import MobileStudentView from './Views/StudentView';

const MainPage = () => {
  const [isProfileSidebarVisible, setIsProfileSidebarVisible] = useState(false);
  const [selectedView, setSelectedView] = useState(null); // Initially null, indicating loading state
  const [privLvl, setPrivLvl] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getUserByToken();
        setPrivLvl(user.privLvl);
        setSelectedView(getViewByPrivLvl(user.privLvl));
      } catch (error) {
        await deleteToken();
        crossPlatformAlert('Error', error);
      }
    };

    fetchUserData();
  }, []);

  const toggleProfileSidebar = () => {
    setIsProfileSidebarVisible(!isProfileSidebarVisible);
  };

  const getViewByPrivLvl = (privLvl: number) => {
    switch (privLvl) {
      case 0: // Assuming 0 is for Student
        return 'Student';
      case 1: // Assuming 1 is for Monitor
        return 'Monitor';
      case 2: // Assuming 2 is for Tutor
        return 'Tutor';
      case 3: // Assuming 3 is for Tutor/Monitor
        return 'Tutor/Monitor';
      case 4: // Assuming 4 is for Department Head
        return 'Department Head';
      case 5: // Assuming 5 is for Admin
      default:
        return 'Admin';
    }
  };

  const renderView = () => {
    if (selectedView === null) {
      return <ActivityIndicator size="large" color="#0000ff" />;
    }

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
  };

  return (
    <View style={styles.container}>
      {isProfileSidebarVisible && !isMobile && (
        <ProfileSidebar visible={isProfileSidebarVisible} onClose={toggleProfileSidebar} />
      )}
      <View style={styles.mainContent}>
        {renderView()}
        <Image source={require('../../assets/tiger-logo.png')} style={styles.tigerLogo} />
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
    marginLeft: 80, // Default margin when sidebar is not visible
  },
  tigerLogo: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    opacity: 0.1,
    width: 300,
    height: 300,
    zIndex: -1, // Ensure the logo is beneath all other content
    pointerEvents: 'none', // Make sure the image is not clickable or interactable
  },
});

export default MainPage;
function deleteToken() {
  throw new Error('Function not implemented.');
}

