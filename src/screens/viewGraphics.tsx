import React, { useState, useEffect, useCallback } from 'react';
import { Text, ListItem, Button, Header, CheckBox } from 'react-native-elements';
import viewGraphicsService from '../services/viewGraphics.service';
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
import { Box } from 'native-base';
import { BarChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import { Usuario } from '../services/types';
import { colorDeAvatar, inicial } from '../lib/avatar';
import styles from '../styles/viewGraphics.styles';

type SearchWorkerProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

type VistaT = 'year' | 'week';

const MESES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DIAS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const etiquetaSemana = (semana: moment.Moment) => {
  const fin = semana.clone().endOf('isoWeek');
  const anioActual = moment().year();
  const inicio = `${semana.format('DD MMMM')}${semana.year() !== anioActual ? ` ${semana.year()}` : ''}`;
  const final = `${fin.format('DD MMMM')}${fin.year() !== anioActual ? ` ${fin.year()}` : ''}`;
  return `${inicio} - ${final}`;
};

const Grafico = ({ datos, etiquetas }: { datos: number[]; etiquetas: string[] }) => (
  <View style={styles.graphic}>
    <YAxis
      data={datos}
      style={styles.yaxis}
      contentInset={styles.insetY}
      svg={{ fontSize: 10, fill: 'grey' }}
      min={0}
    />
    <View style={styles.barchart}>
      <BarChart
        style={styles.barchartType}
        data={datos}
        contentInset={styles.insetY}
        svg={{ stroke: '#046b0b', fill: '#145c19' }}
      >
        <Grid />
      </BarChart>
      <XAxis
        style={styles.xaxis}
        data={datos}
        formatLabel={(_valor: number, indice: number) => etiquetas[indice]}
        contentInset={styles.insetX}
        svg={{ fontSize: 10, fill: 'grey' }}
      />
    </View>
  </View>
);

const ViewGraphics: React.FC<SearchWorkerProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Usuario[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [averageHours, setAverageHours] = useState<Record<number, number[]>>({});
  const [selectedYear, setSelectedYear] = useState<number>(moment().year());
  const [viewType, setViewType] = useState<VistaT>('year');
  const [currentWeek, setCurrentWeek] = useState(() => moment().startOf('isoWeek'));
  const [multiSelect, setMultiSelect] = useState(false);

  const cargarHoras = useCallback(
    async (userId: number) => {
      if (viewType === 'year') {
        const response = await viewGraphicsService.getMonthlyAverageHours(userId);
        if (!response.success) {
          setErrorMessage(response.message);
          return;
        }
        const promedios = Array(12).fill(0);
        response.data.forEach((item) => {
          const [mes, anio] = item.month.split('-').map(Number);
          if (anio === selectedYear) {
            promedios[mes - 1] = item.average_hours_worked;
          }
        });
        setAverageHours((previo) => ({ ...previo, [userId]: promedios }));
        return;
      }

      const response = await viewGraphicsService.getWeeklyAverageHours(userId);
      if (!response.success) {
        setErrorMessage(response.message);
        return;
      }
      const inicio = currentWeek.clone().startOf('isoWeek');
      const fin = currentWeek.clone().endOf('isoWeek');
      const horas = Array(7).fill(0);
      response.data.forEach((item) => {
        const dia = moment(item.day, 'DD-MM-YYYY');
        if (dia.isBetween(inicio, fin, 'day', '[]')) {
          horas[dia.isoWeekday() - 1] = item.dailyHoursWorked;
        }
      });
      setAverageHours((previo) => ({ ...previo, [userId]: horas }));
    },
    [viewType, selectedYear, currentWeek],
  );

  useEffect(() => {
    selectedUsers.forEach((user) => {
      cargarHoras(user.id);
    });
  }, [selectedUsers, cargarHoras]);

  const handleSearch = async () => {
    setLoading(true);
    setErrorMessage(null);
    const results = await viewGraphicsService.viewGraphicsService(searchTerm);
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

  const handleUserSelection = (user: Usuario) => {
    if (multiSelect) {
      setSelectedUsers((previo) =>
        previo.some((u) => u.id === user.id)
          ? previo.filter((u) => u.id !== user.id)
          : [...previo, user],
      );
    } else {
      setSelectedUsers([user]);
      setModalVisible(true);
    }
  };

  const handleLongPress = (user: Usuario) => {
    setMultiSelect(true);
    setSelectedUsers([user]);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    if (!multiSelect) {
      setSelectedUsers([]);
    }
  };

  return (
    <Box style={styles.container}>
      <Header
        centerComponent={{
          text: 'View Time Statistics',
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
            <TouchableOpacity
              onPress={() => handleUserSelection(item)}
              onLongPress={() => handleLongPress(item)}
            >
              <ListItem>
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
                  {multiSelect && (
                    <CheckBox
                      checked={selectedUsers.some((u) => u.id === item.id)}
                      onPress={() => handleUserSelection(item)}
                    />
                  )}
                </View>
              </ListItem>
            </TouchableOpacity>
          )}
        />
        {selectedUsers.length >= 2 && (
          <Button title="View Comparatives" onPress={() => setModalVisible(true)} />
        )}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={cerrarModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableHighlight
                style={styles.closeButton}
                onPress={cerrarModal}
                accessibilityLabel="Close"
              >
                <Text style={styles.closeButtonText}>x</Text>
              </TouchableHighlight>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  onPress={() =>
                    viewType === 'year'
                      ? setSelectedYear((anio) => anio - 1)
                      : setCurrentWeek((semana) => semana.clone().subtract(1, 'week'))
                  }
                  style={styles.navigate}
                >
                  {'<'}
                </Text>
                <Text style={styles.yearText}>
                  {viewType === 'year' ? selectedYear : etiquetaSemana(currentWeek)}
                </Text>
                <Text
                  onPress={() =>
                    viewType === 'year'
                      ? setSelectedYear((anio) => anio + 1)
                      : setCurrentWeek((semana) => semana.clone().add(1, 'week'))
                  }
                  style={styles.navigate}
                >
                  {'>'}
                </Text>
              </View>
              <ScrollView style={styles.scrollContainer}>
                {selectedUsers.map((user) => (
                  <View key={user.id}>
                    <Text style={styles.userName}>
                      {user.firstName} {user.lastName}
                    </Text>
                    {averageHours[user.id]?.some((horas) => horas !== 0) ? (
                      <Grafico
                        datos={averageHours[user.id]}
                        etiquetas={viewType === 'year' ? MESES : DIAS}
                      />
                    ) : (
                      <Text style={styles.noRegistrationsText}>
                        No data available for the selected {viewType}.
                      </Text>
                    )}
                  </View>
                ))}
                <View style={styles.viewButtons}>
                  <Button
                    buttonStyle={styles.button}
                    title="By Year"
                    type={viewType === 'year' ? 'solid' : 'outline'}
                    onPress={() => setViewType('year')}
                  />
                  <Button
                    buttonStyle={styles.button}
                    title="By Week"
                    type={viewType === 'week' ? 'solid' : 'outline'}
                    onPress={() => setViewType('week')}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Box>
  );
};

export default ViewGraphics;
