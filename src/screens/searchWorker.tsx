import React, { useState } from 'react';
import { Text, ListItem, Button, Header } from 'react-native-elements';
import {
  searchWorkerService,
  addTimeRegistrationService,
} from '../services/searchWorker.service';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TouchableHighlight,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import moment from 'moment';
import weeklySummaryService from '../services/weeklySummary.service';
import { Marcaje, Usuario } from '../services/types';
import { colorDeAvatar, inicial } from '../lib/avatar';
import { validarFechaHora } from '../lib/validation';
import { Box } from 'native-base';
import styles from '../styles/searchWorker.styles';

type SearchWorkerProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const FORMATO = 'DD-MM-YYYY';

const findMissingExits = (registrations: Marcaje[]): string[] => {
  const pendientes: Record<string, boolean> = {};
  registrations.forEach((reg) => {
    const dia = reg.date.split(' ')[0];
    pendientes[dia] = reg.type === 'entry' ? pendientes[dia] !== false : false;
  });
  return Object.keys(pendientes).filter((dia) => pendientes[dia]);
};

const SearchWorker: React.FC<SearchWorkerProps> = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Usuario[]>([]);
  const [timeRegistrations, setTimeRegistrations] = useState<Marcaje[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setErrorMessage(null);
    const results = await searchWorkerService(searchTerm);
    setLoading(false);
    if (results.success) {
      setSearchResults(results.data);
      if (results.data.length === 0) {
        setErrorMessage('There are no results.');
      }
    } else {
      setSearchResults([]);
      setErrorMessage(results.message);
    }
  };

  const obtainTimeRegistration = async (idUser: number) => {
    const semana = moment().startOf('isoWeek');
    const response = await weeklySummaryService(
      semana.format(FORMATO),
      semana.clone().endOf('isoWeek').format(FORMATO),
      idUser,
    );
    setSelectedUser(idUser);
    if (response.success) {
      setTimeRegistrations(response.data);
      setModalVisible(true);
    } else {
      setTimeRegistrations([]);
      setErrorMessage(response.message);
    }
  };

  const handleAddTimeRegistration = async () => {
    if (selectedUser === null) {
      setErrorMessage('Select a worker first.');
      return;
    }
    const error = validarFechaHora(newDate);
    if (error) {
      setErrorMessage(error);
      return;
    }
    const response = await addTimeRegistrationService(newDate, selectedUser);
    if (response.success) {
      setErrorMessage('Time Registration successfully added');
      setNewDate('');
      obtainTimeRegistration(selectedUser);
    } else {
      setErrorMessage(response.message);
    }
  };

  const goEditTimeRegistration = (registration: Marcaje) => {
    setModalVisible(false);
    navigation.navigate('EditTimeRegistration', {
      id: registration.id.toString(),
      date: registration.date,
      type: registration.type,
    });
  };

  const sinSalida = findMissingExits(timeRegistrations);

  return (
    <Box style={styles.container}>
      <Header
        centerComponent={{
          text: 'Search worker',
          style: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
        }}
        containerStyle={{
          backgroundColor: '#0AA5F2',
          justifyContent: 'space-around',
        }}
      />
      <Text style={styles.subtitle}>
        Please type the worker's name you want to search
      </Text>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Search employee"
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearch}
          value={searchTerm}
          returnKeyType="search"
        />

        <Button title="Search" onPress={handleSearch} buttonStyle={styles.button} />

        {loading && <ActivityIndicator size="large" color="#4287f5" />}

        {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}

        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ListItem onPress={() => obtainTimeRegistration(item.id)}>
              <View
                style={[
                  styles.profilePicture,
                  { backgroundColor: colorDeAvatar(item.firstName) },
                ]}
              >
                <Text style={styles.initial}>{inicial(item.firstName)}</Text>
              </View>
              <View style={styles.userInfo}>
                <ListItem.Content>
                  <ListItem.Title>
                    {item.firstName} {item.lastName}
                  </ListItem.Title>
                  <ListItem.Subtitle>E-mail: {item.email}</ListItem.Subtitle>
                  <ListItem.Subtitle>User ID: {item.id}</ListItem.Subtitle>
                  <ListItem.Subtitle>
                    Birthday: {item.birthday.split('T')[0]}
                  </ListItem.Subtitle>
                </ListItem.Content>
              </View>
            </ListItem>
          )}
        />
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <TouchableHighlight
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
                accessibilityLabel="Close"
              >
                <Text style={styles.closeButtonText}>x</Text>
              </TouchableHighlight>
              <Text style={styles.sectionTitle}>
                Time registrations for User N° {selectedUser} in this week:
              </Text>
              {timeRegistrations.length === 0 ? (
                <Text style={styles.noRegistrationsText}>
                  There are no registrations in this period
                </Text>
              ) : (
                <ScrollView style={styles.scrollContainer}>
                  {timeRegistrations.map((registration, index) => (
                    <TouchableOpacity
                      key={registration.id}
                      style={styles.registrationInfo}
                      onPress={() => goEditTimeRegistration(registration)}
                    >
                      <Text
                        style={
                          registration.type === 'entry'
                            ? styles.entryText
                            : styles.exitText
                        }
                      >
                        {registration.type.toUpperCase()}
                      </Text>
                      <Text>
                        Registration {index + 1}: {registration.date}
                      </Text>
                      <Text>Register ID: {registration.id}</Text>
                      {registration.latCoordinate && registration.longCoordinate ? (
                        <Text>
                          Location: {registration.latCoordinate},{' '}
                          {registration.longCoordinate}
                        </Text>
                      ) : (
                        <Text style={styles.noLocation}>Location not available</Text>
                      )}
                      <Text>
                        Modified by administrator: {registration.adminFlag ? 'Yes' : 'No'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {sinSalida.length > 0 && (
          <Text style={styles.warningMessage}>
            The following days have entries with no registered exit:{' '}
            {sinSalida.join(', ')}
          </Text>
        )}
        {selectedUser !== null && (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>
              Add time registration for User N° {selectedUser}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Date (DD-MM-YYYY HH:mm:ss)"
              onChangeText={setNewDate}
              value={newDate}
              autoCapitalize="none"
            />
            <Button
              title="Add Time Registration"
              onPress={handleAddTimeRegistration}
              buttonStyle={styles.button}
            />
          </View>
        )}
      </View>
    </Box>
  );
};

export default SearchWorker;
