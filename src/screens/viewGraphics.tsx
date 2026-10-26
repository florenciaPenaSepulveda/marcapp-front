import React, { useState, useEffect } from 'react';
import { Text, ListItem, Button, Header, CheckBox } from 'react-native-elements';
import viewGraphicsService from '../services/viewGraphics.service';
import { View, StyleSheet, TextInput, FlatList, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TouchableHighlight } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import moment from 'moment';
import { Box } from 'native-base';
import { BarChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import styles from '../styles/viewGraphics.styles';

type SearchWorkerProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const ViewGraphics: React.FC<SearchWorkerProps> = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [averageHours, setAverageHours] = useState<{ [key: number]: number[] }>({});
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [viewType, setViewType] = useState<'year' | 'week'>('year');
  const [currentWeek, setCurrentWeek] = useState(moment().startOf('isoWeek'));
  const [multiSelect, setMultiSelect] = useState(false);

  useEffect(() => {
    if (selectedUsers.length > 0) {
      selectedUsers.forEach(user => {
        if (viewType === 'year') {
          fetchMonthlyAverageHours(user.id, selectedYear);
        } else {
          fetchWeeklyAverageHours(user.id, currentWeek);
        }
      });
    }
  }, [selectedUsers, selectedYear, viewType, currentWeek]);

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
        setAverageHours(prev => ({ ...prev, [userId]: averages }));
      } else {
        setErrorMessage(response.message || "Error fetching monthly average hours.");
      }
    } catch (error) {
      console.error('Error fetching monthly average hours:', error);
      setErrorMessage('Error fetching monthly average hours.');
    }
  };

  const fetchWeeklyAverageHours = async (userId: number, week: moment.Moment) => {
    try {
      const response = await viewGraphicsService.getWeeklyAverageHours();
      if (response.success) {
        setLoading(true);
        const initWeek = week.clone().startOf('isoWeek');
        const endWeek = week.clone().endOf('isoWeek');
        const averages = Array(7).fill(0);

        response.data.forEach((item: any) => {
          const itemDate = moment(item.day, 'DD-MM-YYYY');
          if (item.idUser === userId && itemDate.isBetween(initWeek, endWeek, 'day', '[]')) {
            const dayOfWeek = itemDate.isoWeekday() - 1;
            averages[dayOfWeek] = item.dailyHoursWorked;
          }
        });

        setAverageHours(prev => ({ ...prev, [userId]: averages }));
      } else {
        setErrorMessage(response.message || "Error fetching weekly average hours.");
      }
    } catch (error) {
      console.error('Error fetching weekly average hours:', error);
      setErrorMessage('Error fetching weekly average hours.');
    }
  };

  const handleYearChange = (direction: 'prev' | 'next') => {
    setSelectedYear((prevYear) => direction === 'prev' ? prevYear - 1 : prevYear + 1);
  };

  const handleWeekChange = (direction: 'prev' | 'next') => {
    setCurrentWeek((prevWeek) =>
      direction === 'prev' ? prevWeek.clone().subtract(1, 'weeks') : prevWeek.clone().add(1, 'weeks')
    );
  };

  const handleUserSelection = (user: any) => {
    if (multiSelect) {
      setSelectedUsers(prev => {
        if (prev.some(u => u.id === user.id)) {
          return prev.filter(u => u.id !== user.id);
        } else {
          return [...prev, user];
        }
      });
    } else {
      setSelectedUsers([user]);
      setModalVisible(true);
    }
  };

  const handleLongPress = (user: any) => {
    setMultiSelect(true);
    setSelectedUsers([user]);
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
        
        <Button title="Search" onPress={handleSearch} buttonStyle={styles.button}/>
        
        {loading && <ActivityIndicator size="large" color="#4287f5" />}
        
        {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
        
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => handleUserSelection(item)} 
              onLongPress={() => handleLongPress(item)}
            >
              <ListItem>
                {renderProfilePicture(item.firstName)}
                <View style={styles.userInfo}>
                  <ListItem.Content>
                    <ListItem.Title>{item.firstName} {item.lastName}</ListItem.Title>
                    <ListItem.Subtitle>E-mail: {item.email}</ListItem.Subtitle>
                    <ListItem.Subtitle>User ID: {item.id}</ListItem.Subtitle>
                    <ListItem.Subtitle>Birthday: {item.birthday.split('T')[0]}</ListItem.Subtitle>
                  </ListItem.Content>
                  {multiSelect && (
                    <CheckBox
                      checked={selectedUsers.some(u => u.id === item.id)}
                      onPress={() => handleUserSelection(item)}
                    />
                  )}
                </View>
              </ListItem>
            </TouchableOpacity>
          )}
        />
        {selectedUsers.length >= 2 && (
          <Button 
            containerStyle={[styles.buttonContainer, { top: -5, left: 0 }]}
            title="View Comparatives" 
            onPress={() => setModalVisible(true)} 
          />
        )}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(!modalVisible)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableHighlight
                style={styles.closeButton}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={styles.closeButtonText}>x</Text>
              </TouchableHighlight>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {viewType === 'year' ? (
                  <>
                    <Text onPress={() => handleYearChange('prev')} style={styles.navigate}>
                      {"<"}
                    </Text>
                    <Text style={styles.yearText}>{selectedYear}</Text>
                    <Text onPress={() => handleYearChange('next')} style={styles.navigate}>
                      {">"}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text onPress={() => handleWeekChange('prev')} style={styles.navigate}>
                      {"<"}
                    </Text>
                    <Text style={styles.yearText}>
                      {currentWeek.format('DD MMMM')}{currentWeek.year() !== moment().year() && ` ${currentWeek.year()}`} - {currentWeek.clone().endOf('isoWeek').format('DD MMMM')}{currentWeek.clone().endOf('isoWeek').year() !== moment().year() && ` ${currentWeek.clone().endOf('isoWeek').year()}`}
                    </Text>
                    <Text onPress={() => handleWeekChange('next')} style={styles.navigate}>
                      {">"}
                    </Text>
                  </>
                )}
              </View>
              <ScrollView style={styles.scrollContainer}>
                {selectedUsers.map(user => (
                  <View key={user.id}>
                    <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
                    {averageHours[user.id]?.some(item => item !== 0) ? (
                      viewType === 'year' ? (
                        <View style={styles.graphic}>
                          <YAxis
                            data={averageHours[user.id]}
                            style={styles.yaxis}
                            contentInset={styles.insetY}
                            svg={{ fontSize: 10, fill: 'grey' }}
                            min={0}
                          />
                          <View style={styles.barchart}>
                            <BarChart
                              style={styles.barchartType}
                              data={averageHours[user.id]}
                              contentInset={styles.insetY}
                              svg={{ stroke: '#046b0b', fill: '#145c19' }}
                            >
                              <Grid />
                            </BarChart>
                            <XAxis
                              style={styles.xaxis}
                              data={averageHours[user.id]}
                              formatLabel={(value: any, index: number) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
                              contentInset={styles.insetX}
                              svg={{ fontSize: 10, fill: 'grey' }}
                            />
                          </View>
                        </View>
                      ) : (
                        <View style={styles.graphic}>
                          <YAxis
                            data={averageHours[user.id]}
                            style={styles.yaxis}
                            contentInset={styles.insetY}
                            svg={{ fontSize: 10, fill: 'grey' }}
                            min={0}
                          />
                          <View style={styles.barchart}>
                            <BarChart
                              style={styles.barchartType}
                              data={averageHours[user.id]}
                              contentInset={styles.insetY}
                              svg={{ stroke: '#046b0b', fill: '#145c19' }}
                            >
                              <Grid />
                            </BarChart>
                            <XAxis
                              style={styles.xaxis}
                              data={averageHours[user.id]}
                              formatLabel={(value: any, index: number) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                              contentInset={styles.insetX}
                              svg={{ fontSize: 10, fill: 'grey' }}
                            />
                          </View>
                        </View>
                      )
                    ) : (
                      <Text style={styles.noRegistrationsText}> No data available for the selected {viewType}.</Text>
                    )}
                  </View>
                ))}
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
