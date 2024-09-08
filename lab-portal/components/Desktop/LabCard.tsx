import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LabCardProps {
  labName: string;
  roomNumber: string;
  schedule: { day: string; hours: string }[];
  imageSrc: any;
}

const LabCard = ({ labName, roomNumber, schedule, imageSrc }: LabCardProps) => {
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
            <Text key={index}>{item.day}: {item.hours}</Text>
          ))}
        </View>
        <Image source={imageSrc} style={styles.image} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 420,
    height: 290,
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 42,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    padding: 15,
    margin: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  labHeader: {
    fontWeight: 'bold',
    fontSize: 24,
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
  image: {
    verticalAlign: 'middle',
    width: '50%',
  },
});

export default LabCard;
