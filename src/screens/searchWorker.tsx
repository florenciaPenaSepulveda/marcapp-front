import React, { useState } from 'react';
import { View, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, ListItem, Button } from 'react-native-elements';
import { searchWorkerService, addTimeRegistrationService } from '../services/searchWorker.service';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import moment from 'moment';
import weeklySummaryService from '../services/weeklySummary.service';

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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [timeRegistrations, setTimeRegistrations] = useState<TimeRegistration[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [newDate, setNewDate] = useState('');

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
          setErrorMessage('No se encontraron resultados.');
        }
      } else {
        setErrorMessage(results.message || 'Error en la búsqueda.');
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage('Error en la búsqueda.');
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
      setErrorMessage( `Formato de fecha inválida: ${newDate}`);
      return;
    }

    try {
      const response = await addTimeRegistrationService(newDate, selectedUser);
      if (response?.success) {
        setErrorMessage('Marcaje añadido exitosamente.');
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

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Buscar empleado"
        onChangeText={(text) => setSearchTerm(text)}
        value={searchTerm}
      />
      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Buscar</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
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
          {findMissingExits(timeRegistrations).length > 0 && (
            <Text style={styles.warningMessage}>
              Los siguientes días tienen entradas sin salidas registradas: {findMissingExits(timeRegistrations).join(', ')}
            </Text>
          )}
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Añadir Marcaje</Text>
            <TextInput
              style={styles.input}
              placeholder="Fecha (DD-MM-YYYY HH:mm:ss)"
              onChangeText={(text) => setNewDate(text)}
              value={newDate}
            />
            <Button title="Añadir Marcaje" onPress={handleAddTimeRegistration} />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: 'blue',
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
  formContainer: {
    marginTop: 20,
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
  },
  warningMessage: {
    color: 'red',
    marginTop: 10,
  },
});

export default SearchWorker;