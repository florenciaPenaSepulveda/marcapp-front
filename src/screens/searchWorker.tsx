import React, { useState } from 'react';
import { Text, ListItem, Button, Header } from 'react-native-elements';
import { searchWorkerService, addTimeRegistrationService } from '../services/searchWorker.service';
import { View, StyleSheet, TextInput, FlatList, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TouchableHighlight } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import moment from 'moment';
import weeklySummaryService from '../services/weeklySummary.service';
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
  latCoordinate: string;
  longCoordinate: string;
  adminFlag: boolean;
}

const SearchWorker: React.FC<SearchWorkerProps> = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [timeRegistrations, setTimeRegistrations] = useState<TimeRegistration[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const results = await searchWorkerService(searchTerm);
      setLoading(false);
      if (results?.success) {
        const filteredResults = results.data.filter((user: any) =>
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(filteredResults);
        if (filteredResults.length === 0) {
          setErrorMessage('There are no results.');
        }
      } else {
        setErrorMessage(results.message || 'Search error.');
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage('Search error.');
      console.error('Error en la búsqueda:', error);
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
        setSelectedUser(idUser);
        setModalVisible(true);
      } else {
        console.log(response?.message);
        setTimeRegistrations([]);
      }
    } catch (error) {
      console.error('Error obteniendo registros de tiempo:', error);
      setTimeRegistrations([]);
    }
  };

  const handleAddTimeRegistration = async () => {
    if (!newDate) {
      setErrorMessage('Por favor, completa todos los campos.');
      return;
    }

    if (!moment(newDate, 'DD-MM-YYYY HH:mm:ss', true).isValid()) {
      setErrorMessage(`Invalid date format: ${newDate}`);
      return;
    }

    try {
      const response = await addTimeRegistrationService(newDate, selectedUser);
      if (response?.success) {
        setErrorMessage('Time Registration successfully added');
        setNewDate('');
        obtainTimeRegistration(selectedUser);
      } else {
        setErrorMessage(response.message || 'Error al agregar el marcaje.');
      }
    } catch (error) {
      console.error('Error al agregar el marcaje:', error);
      setErrorMessage('Error al agregar el marcaje.');
    }
  };

  const findMissingExits = (registrations: TimeRegistration[]) => {
    const entriesWithoutExits: { [key: string]: boolean } = {};

    registrations.forEach((reg) => {
      const date = reg.date.split(' ')[0];
      if (reg.type === 'entry') {
        if (!entriesWithoutExits[date]) {
          entriesWithoutExits[date] = true;
        }
      } else if (reg.type === 'exit') {
        entriesWithoutExits[date] = false;
      }
    });

    return Object.keys(entriesWithoutExits).filter((date) => entriesWithoutExits[date]);
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
      <Text style={styles.subtitle}>Please type the worker's name you want to search</Text>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Search employee"
          onChangeText={(text) => setSearchTerm(text)}
          value={searchTerm}
        />
        
        <Button title="Search" onPress={handleSearch} />
        
        {loading && <ActivityIndicator size="large" color="#4287f5" />}
        
        {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
        
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
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableHighlight
                style={styles.closeButton}
                onPress={() => {
                  setModalVisible(!modalVisible);
                }}
              >
                <Text style={styles.closeButtonText}>x</Text>
              </TouchableHighlight>
              <Text style={styles.sectionTitle}>Time registrations for User N° {selectedUser} in this week:</Text>
              {timeRegistrations.length === 0 ? (
                <Text style={styles.noRegistrationsText}>There are no registrations in this period</Text>
              ) : (
                <ScrollView style={styles.scrollContainer}>
                  {timeRegistrations.map((registration, index) => (
                    <View key={index} style={styles.registrationInfo}>
                      <Text style={registration.type === 'entry' ? styles.entryText : styles.exitText}>
                        {registration.type.toUpperCase()}
                      </Text>
                      <Text>Registration {index + 1}: {registration.date}</Text>
                      <Text>Register ID: {registration.id}</Text>
                      {registration.latCoordinate && registration.longCoordinate ? (
                        <Text>Location: {registration.latCoordinate}, {registration.longCoordinate}</Text>
                      ) : (
                        <Text style={styles.noLocation}>Location not available</Text>
                      )}
                      <Text>Modified by administrator: {registration.adminFlag ? 'Yes' : 'No'}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {findMissingExits(timeRegistrations).length > 0 && (
          <Text style={styles.warningMessage}>
            The following days have entries with no registered exit: {findMissingExits(timeRegistrations).join(', ')}
          </Text>
        )}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Add registration</Text>
          <TextInput
            style={styles.input}
            placeholder="Date (DD-MM-YYYY HH:mm:ss)"
            onChangeText={(text) => setNewDate(text)}
            value={newDate}
          />
          <Button title="Add Time Registration" onPress={handleAddTimeRegistration} buttonStyle={styles.button}/>
        </View>
      </View>
    </Box>
  );
};

export default SearchWorker;
