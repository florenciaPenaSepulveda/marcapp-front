import React, { useState } from 'react';
import { View, StyleSheet, TextInput, FlatList, TouchableOpacity, Button } from 'react-native';
import { Text, ListItem, Header } from 'react-native-elements';
import searchWorkerService from '../services/searchWorker.service';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import moment from 'moment';
import weeklySummaryService from '../services/weeklySummary.service';
import loading from './loading';
import { Box } from 'native-base';
import styles from '../styles/searchWorker.styles';

type SearchWorkerProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

interface TimeRegistration {
  date: string;
  id: number;
  id_user: number;
  type: string;
}

const SearchWorker: React.FC<SearchWorkerProps> = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]); // Adjust type as needed
  const [timeRegistrations, setTimeRegistrations] = useState<TimeRegistration[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null); // Store selected user

  const handleSearch = async () => {
    try {
      const results = await searchWorkerService(searchTerm);
      if (results?.success) {
        const filteredResults = results.data.filter((user: any) => 
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(filteredResults);
      }
    } catch (error) {
      console.error('Error searching workers:', error);
      // Handle error as needed
    }
  };

  const obtainTimeRegistration = async (idUser: number) => {
    const currentWeek = moment().startOf('isoWeek');
    const initWeek = currentWeek.startOf('isoWeek').format("DD-MM-YYYY");
    const endWeek = currentWeek.endOf('isoWeek').format("DD-MM-YYYY");

    try {
      const response = await weeklySummaryService(initWeek, endWeek, idUser);
      if (response?.success && response.data) {
        setTimeRegistrations(response.data);
        setSelectedUser(idUser); // Set the selected user
      } else {
        console.log(response?.message);
        setTimeRegistrations([]); // Set empty array in case of error
      }
    } catch (error) {
      console.error('Error obtaining time registrations:', error);
      setTimeRegistrations([]); // Set empty array in case of error
    }
  };

  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}; 

  const renderProfilePicture = (name: string) => {
    const initial = name.charAt(0).toUpperCase();
    const backgroundColor = generateRandomColor();
    return (
      <View style={[styles.profilePicture, { backgroundColor }]}>
        <Text style={styles.initial}>{initial}</Text>
      </View>
    );
};

  return (
    <Box style={styles.container}>
      <Header
        centerComponent={{
          text: 'Search worker',
          style: {
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 20,
          },
        }}
        containerStyle={{
          backgroundColor: '#0AA5F2',
          justifyContent: 'space-around',
        }}
      />
      <Text
        style={styles.subtitle}
      >
        Type the worker's name you want to search
      </Text>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Search employee"
          onChangeText={(text) => setSearchTerm(text)}
          value={searchTerm}
        />
        
        <Button title = "Search" onPress={handleSearch} />
        

        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <ListItem onPress={() => obtainTimeRegistration(item.id)}>
              <View style={styles.userInfo}>
                {renderProfilePicture(item.firstName)}
                <ListItem.Content>
                  <ListItem.Title>{item.firstName} {item.lastName}</ListItem.Title>
                  <ListItem.Subtitle>E-mail: {item.email}</ListItem.Subtitle>
                  <ListItem.Subtitle>User ID: {item.id}</ListItem.Subtitle>
                </ListItem.Content>
                </View>
              
            </ListItem>
          )}
        />
        {selectedUser && (
          <>
            <Text style={styles.sectionTitle}>Time registrations of user N° {selectedUser} for this week:</Text>
            {timeRegistrations.length === 0 ? (
              <Text style={styles.noRegistrationsText}>There are no registrations on this period</Text>
            ) : (
              timeRegistrations.map((registration, index) => (
                <View key={index} style={styles.registrationInfo}>
                  <Text style={registration.type === 'entry' ? styles.entryText : styles.exitText}>
                    {registration.type.toUpperCase()}
                  </Text>
                  <Text>Registration {index + 1}: {registration.date}</Text>
                  <Text>Registration ID: {registration.id}</Text>
                </View>
              ))
              )}
          </>
        )}
      </View>
    </Box>
  );
};

export default SearchWorker;

function generateRandomColor() {
  throw new Error('Function not implemented.');
}
