import React, { useState } from 'react';
import { Text, ListItem, Button, Header } from 'react-native-elements';
import { searchWorkerService, addTimeRegistrationService } from '../services/searchWorker.service';
import { View, StyleSheet, TextInput, FlatList, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import moment from 'moment';
import weeklySummaryService from '../services/weeklySummary.service';
import { Box } from 'native-base';

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
      setErrorMessage(`Formato de fecha inválida: ${newDate}`);
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
          text: 'Buscar trabajador',
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
      <Text style={styles.subtitle}>Escribe el nombre del trabajador que deseas buscar</Text>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Buscar empleado"
          onChangeText={(text) => setSearchTerm(text)}
          value={searchTerm}
        />
        
        <Button title="Buscar" onPress={handleSearch} />
        
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <ListItem onPress={() => obtainTimeRegistration(item.id)}>
              <View style={styles.userInfo}>
                {renderProfilePicture(item.firstName)}
                <ListItem.Content>
                  <ListItem.Title>{item.firstName} {item.lastName}</ListItem.Title>
                  <ListItem.Subtitle>Correo: {item.email}</ListItem.Subtitle>
                  <ListItem.Subtitle>Id usuario: {item.id}</ListItem.Subtitle>
                </ListItem.Content>
              </View>
            </ListItem>
          )}
        />
        {selectedUser && (
          <>
            <Text style={styles.sectionTitle}>Registros de tiempo del usuario N° {selectedUser} para esta semana:</Text>
            {timeRegistrations.length === 0 ? (
              <Text style={styles.noRegistrationsText}>No hay registros en este período</Text>
            ) : (
              <ScrollView style={styles.scrollContainer}>
                {timeRegistrations.map((registration, index) => (
                  <View key={index} style={styles.registrationInfo}>
                    <Text style={registration.type === 'entry' ? styles.entryText : styles.exitText}>
                      {registration.type.toUpperCase()}
                    </Text>
                    <Text>Registro {index + 1}: {registration.date}</Text>
                    <Text>ID Registro: {registration.id}</Text>
                    {registration.latCoordinate && registration.longCoordinate ? (
                      <Text>Ubicación del registro: {registration.latCoordinate}, {registration.longCoordinate}</Text>
                    ) : (
                      <Text style={styles.noLocation}>Ubicación no disponible</Text>
                    )}
                     <Text>Modificado por Admin: {registration.adminFlag ? 'Sí' : 'No'}</Text>
                    
                  </View>
                ))}
              </ScrollView>
            )}
          </>
        )}
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
      </View>
    </Box>
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  initial: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  subtitle: {
    fontSize: 16,
    marginVertical: 10,
  },
  scrollContainer: {
    marginTop: 10,
  },
  entryText: {
    color: 'green',
  },
  exitText: {
    color: 'red',
  },
  noRegistrationsText: {
    textAlign: 'center',
    marginVertical: 10,
    color: 'grey',
  },
  noLocation: {
    color: 'grey',
  },
});

export default SearchWorker;
