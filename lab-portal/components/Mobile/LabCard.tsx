import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LabCardProps {
  labName: string;
  roomNumber: string;
  schedule: { day: string; hours: string }[];
  imageSrc: any;
}

const MobileLabCard = ({ labName, roomNumber, schedule, imageSrc }: LabCardProps) => {
  return (
    <LinearGradient
      colors={['rgba(30, 157, 249, 0)', '#0684F9']}
      style={styles.card}
    >
      <View style={styles.header}>
        <Text style={styles.labHeader}>{labName} Hours</Text>
        <Text style={styles.labHeader}>{roomNumber}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.schedule}>
          {schedule.map((item, index) => (
            <Text key={index} style={styles.scheduleText}>{item.day}: {item.hours}</Text>
          ))}
        </View>
        <Image source={imageSrc} style={styles.image} />
      </View>
    </LinearGradient>
  );
};

const { width } = Dimensions.get('window'); // Get device width

const styles = StyleSheet.create({
  card: {
    width: '100%', // Use 100% of the container's width to avoid overflowing
    maxWidth: 380, // Add a maxWidth to limit the size on larger screens
    alignSelf: 'center', // Center the card horizontally
    height: 250, // Adjusted height for mobile screens
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 20, // Reduced border radius
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    padding: 15,
    marginVertical: 10, // Adjust margin to be more mobile-friendly
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  labHeader: {
    fontWeight: 'bold',
    fontSize: 18, // Reduced font size for mobile
    color: 'black',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  schedule: {
    flex: 1,
    color: 'black',
  },
  scheduleText: {
    fontSize: 14, // Adjusted font size for better readability on mobile
  },
  image: {
    width: 80, // Adjusted image size for mobile
    height: 80,
    borderRadius: 10, // Optional, for rounded image
  },
});

export default MobileLabCard;
