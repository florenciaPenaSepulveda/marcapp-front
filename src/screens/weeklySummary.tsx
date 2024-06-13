import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Box } from 'native-base';
import { Button, Header, Text } from 'react-native-elements';
import 'text-encoding-polyfill';
import useUserStore from '../stores/useStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import moment from 'moment';
import weeklySummaryService from '../services/weeklySummary.service';

interface TimeRegistration {
  date: string;
  id: number;
  id_user: number;
  type: string;
}

const WeeklySummary = () => {
  const userStore = useUserStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [timeRegistrations, setTimeRegistrations] = useState<TimeRegistration[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentWeek, setCurrentWeek] = useState(moment().startOf('isoWeek'));

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      const initWeek = currentWeek.startOf('isoWeek').format("DD-MM-YYYY");
      console.log('Inicio Semana', initWeek);
      const endWeek = currentWeek.endOf('isoWeek').format("DD-MM-YYYY");
      console.log('Fin semana', endWeek);
      const response = await weeklySummaryService(initWeek, endWeek, userStore.id);
      if (response?.success && response.data) {
        setTimeRegistrations(response.data);
      } else {
        console.log(response?.message);
        setTimeRegistrations([]); // Establecer un arreglo vacío en caso de error
      }
    } catch (error) {
      console.log(error);
      setTimeRegistrations([]); // Establecer un arreglo vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyData();
  }, [currentWeek]);

  const goToPreviousWeek = () => {
    setCurrentWeek(currentWeek.clone().subtract(1, 'week').startOf('isoWeek'));
  };

  const goToNextWeek = () => {
    setCurrentWeek(currentWeek.clone().add(1, 'week').startOf('isoWeek'));
  };

  const formatDate = (date: moment.Moment) => {
    const currentYear = moment().year();
    const dateYear = date.year();
    return dateYear !== currentYear ? date.format('DD MMMM YYYY') : date.format('DD MMMM');
  };

  return (
    <Box style={styles.container}>
      <Header
        centerComponent={{
          text: 'My Weekly Summary',
          style: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
        }}
        containerStyle={{
          backgroundColor: '#0AA5F2',
          justifyContent: 'space-around',
        }}
      />
      <View style={styles.navigationContainer}>
        <Text
          onPress={goToPreviousWeek}
          style={{ textAlign: 'left', marginTop: '0%', fontSize: 25 }}
        >
          {"<"}
        </Text>
        <Text style={styles.weekText}>
          {formatDate(currentWeek.startOf('isoWeek'))} - {formatDate(currentWeek.endOf('isoWeek'))}
        </Text>
        <Text
          onPress={goToNextWeek}
          style={{ textAlign: 'right', marginTop: '0%', fontSize: 25 }}
        >
          {">"}
        </Text>
      </View>
      <ScrollView style={styles.scrollView}>
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
      </ScrollView>
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
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  navButton: {
    width: 150,
    height: 40,
  },
  weekText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: '5%',
  },
  info: {
    fontSize: 18,
    textAlign: 'left',
    marginBottom: '5%',
  },
  registrationInfo: {
    marginTop: 50,
    alignItems: 'center',
  },
  entryText: {
    color: 'green', // Color del texto para 'entry'
    fontWeight: 'bold',
  },
  exitText: {
    color: 'red', // Color del texto para 'exit'
    fontWeight: 'bold',
  },
  scrollView: {
    width: '100%',
  },
  noRegistrationsText: {
    fontSize: 18,
    textAlign: 'center',
    color: 'gray',
    marginTop: 20,
  },
});

export default WeeklySummary;
