import React, { useState } from 'react';
import { Box } from 'native-base';
import { View, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { Button, Header, Text, ListItem } from 'react-native-elements';
import searchWorkerService from '../services/searchWorker.service';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import moment from 'moment';
import weeklySummaryService from '../services/weeklySummary.service';
import loading from './loading';

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
  const [loading, setLoading] = useState<boolean>(false);

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
      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Buscar</Text>
      </TouchableOpacity>
      <FlatList
        data={searchResults}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <ListItem onPress={() => obtainTimeRegistration(item.id)}>
            <ListItem.Content>
              <ListItem.Title>{item.firstName} {item.lastName}</ListItem.Title>
              <ListItem.Subtitle>Correo: {item.email}</ListItem.Subtitle>
              <ListItem.Subtitle>Id usuario: {item.id}</ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
        )}
      />
      {selectedUser && (
        <>
          <Text style={styles.sectionTitle}>Registros de tiempo para el usuario {selectedUser}</Text>
          <FlatList
            data={timeRegistrations}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.registrationInfo}>
                <Text>Fecha: {item.date}</Text>
                <Text>ID Registro: {item.id}</Text>
                <Text>Tipo: {item.type}</Text>
              </View>
            )}
          />
        </>
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'white',
    paddingHorizontal: '0%',
    paddingVertical: '0%',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 100,
    borderRadius: 5,
    
  },
  button: {
    backgroundColor: '#0AA5F2',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  registrationInfo: {
    marginVertical: 10,
  },
});

export default SearchWorker;
