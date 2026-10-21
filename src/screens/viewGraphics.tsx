import React, { useState, useEffect } from 'react';
import { Text, ListItem, Button, Header } from 'react-native-elements';
import viewGraphicsService from '../services/viewGraphics.service';
import { View, StyleSheet, TextInput, FlatList, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TouchableHighlight } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import moment from 'moment';
import { Box } from 'native-base';
import { BarChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import { Dimensions } from 'react-native';
import styles from '../styles/viewGraphics.styles';

type SearchWorkerProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const ViewGraphics: React.FC<SearchWorkerProps> = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [averageHours, setAverageHours] = useState<number[]>([]);
  const [weeklyHours, setWeeklyHours] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [viewType, setViewType] = useState<'year' | 'week'>('year');
  const [selectedWeek, setSelectedWeek] = useState<any>(null);

  useEffect(() => {
    if (selectedUser) {
      if (viewType === 'year') {
        fetchMonthlyAverageHours(selectedUser, selectedYear);
      } else if (viewType === 'week' && selectedWeek) {
        fetchWeeklyHours(selectedUser, selectedWeek);
      }
    }
  }, [selectedUser, selectedYear, viewType, selectedWeek]);

  const handleSearch = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const results = await viewGraphicsService.viewGraphicsService(searchTerm);
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

  const fetchMonthlyAverageHours = async (userId: number, year: number) => {
    try {
      const response = await viewGraphicsService.getMonthlyAverageHours();
      if (response.success) {
        const averages = Array(12).fill(0);
        response.data.forEach((item: any) => {
          const itemYear = Number(item.month.split("-")[1]);
          const itemMonth = Number(item.month.split("-")[0]) - 1;
          if (item.idUser === userId && itemYear === year) {
            averages[itemMonth] = item.average_hours_worked;
          }
        });
        setAverageHours(averages);
      } else {
        setErrorMessage(response.message || "Error fetching monthly average hours.");
      }
    } catch (error) {
      console.error('Error fetching monthly average hours:', error);
      setErrorMessage('Error fetching monthly average hours.');
    }
  };

  const fetchWeeklyHours = async (userId: number, week: string) => {
    try {
      const response = await viewGraphicsService.getWeeklyHours(userId, week);
      if (response.success) {
        const hours = Array(7).fill(0);
        response.data.forEach((item: any) => {
          const dayIndex = moment(item.date).day(); // Obtener el índice del día de la semana (0-6)
          hours[dayIndex] = item.hours_worked;
        });
        setWeeklyHours(hours);
      } else {
        setErrorMessage(response.message || "Error fetching weekly hours.");
      }
    } catch (error) {
      console.error('Error fetching weekly hours:', error);
      setErrorMessage('Error fetching weekly hours.');
    }
  };

  const handleYearChange = (direction: 'prev' | 'next') => {
    setSelectedYear((prevYear) => direction === 'prev' ? prevYear - 1 : prevYear + 1);
  };

  const handleWeekChange = (direction: 'prev' | 'next') => {
    setSelectedWeek((prevWeek: any) => {
      const newWeek = direction === 'prev' ? moment(prevWeek).subtract(1, 'weeks') : moment(prevWeek).add(1, 'weeks');
      return newWeek.format('YYYY-MM-DD');
    });
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

  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <Box style={styles.container}>
      <Header
        centerComponent={{
          text: 'View Time Statistics',
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
            <ListItem onPress={() => {
              setSelectedUser(item.id);
              setSelectedWeek(moment().startOf('isoWeek').format('YYYY-MM-DD'));
              setModalVisible(true);
            }}>
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
              {viewType === 'year' && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text onPress={() => handleYearChange('prev')} style={styles.navigate}>
                    {"<"}
                  </Text>
                  <Text style={styles.yearText}>{selectedYear}</Text>
                  <Text onPress={() => handleYearChange('next')} style={styles.navigate}>
                  {">"}
                    </Text>
                </View>
              )}
              {viewType === 'week' && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text onPress={() => handleWeekChange('prev')} style={styles.navigate}>
                    {"<"}
                  </Text>
                  <Text style={styles.weekText}>
                    {moment(selectedWeek).startOf('isoWeek').format('DD/MM')} - {moment(selectedWeek).endOf('isoWeek').format('DD/MM')}
                  </Text>
                  <Text onPress={() => handleWeekChange('next')} style={styles.navigate}>
                    {">"}
                  </Text>
                </View>
              )}
              <ScrollView style={styles.scrollContainer}>
                {viewType === 'year' && averageHours.some(item => item !== 0) ? (
                  <View style={styles.graphic}>
                    <YAxis
                      data={averageHours}
                      style={styles.yaxis}
                      contentInset={styles.insetY}
                      svg={{ fontSize: 10, fill: 'grey' }}
                    />
                    <View style={styles.barchart}>
                      <BarChart
                        style={styles.barchartType}
                        data={averageHours}
                        contentInset={styles.insetY}
                        svg={{ stroke: '#046b0b', fill: '#145c19' }}
                      >
                        <Grid />
                      </BarChart>
                      <XAxis
                        style={styles.xaxis}
                        data={averageHours}
                        formatLabel={(value: any, index: number) =>
                          ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]
                        }
                        contentInset={styles.insetX}
                        svg={{ fontSize: 10, fill: 'grey' }}
                      />
                    </View>
                  </View>
                ) : viewType === 'week' && weeklyHours.some(item => item !== 0) ? (
                  <View style={styles.graphic}>
                    <YAxis
                      data={weeklyHours}
                      style={styles.yaxis}
                      contentInset={styles.insetY}
                      svg={{ fontSize: 10, fill: 'grey' }}
                    />
                    <View style={styles.barchart}>
                      <BarChart
                        style={styles.barchartType}
                        data={weeklyHours}
                        contentInset={styles.insetY}
                        svg={{ stroke: '#046b0b', fill: '#145c19' }}
                      >
                        <Grid />
                      </BarChart>
                      <XAxis
                        style={styles.xaxis}
                        data={weeklyHours}
                        formatLabel={(value: any, index: number) =>
                          ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]
                        }
                        contentInset={styles.insetX}
                        svg={{ fontSize: 10, fill: 'grey' }}
                      />
                    </View>
                  </View>
                ) : (
                  <Text style={styles.noRegistrationsText}>
                    No data available for the selected {viewType === 'year' ? 'year' : 'week'}.
                  </Text>
                )}
                <View style={styles.buttonContainer}>
                  <Button
                    buttonStyle={styles.button}
                    containerStyle={[styles.buttonContainer, { top: 20, left: 25 }]}
                    title="By Year"
                    onPress={() => setViewType('year')}
                  />
                  <Button
                    buttonStyle={styles.button}
                    containerStyle={[styles.buttonContainer, { top: -20, left: 175 }]}
                    title="By Week"
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