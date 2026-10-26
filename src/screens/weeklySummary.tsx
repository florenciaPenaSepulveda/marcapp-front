import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Box } from 'native-base';
import { Header, Text } from 'react-native-elements';
import moment from 'moment';
import useUserStore from '../stores/useStore';
import weeklySummaryService from '../services/weeklySummary.service';
import { Marcaje } from '../services/types';
import styles from '../styles/weeklySummary.styles';

const FORMATO = 'DD-MM-YYYY';

const formatDate = (date: moment.Moment) =>
  date.year() !== moment().year()
    ? date.format('DD MMMM YYYY')
    : date.format('DD MMMM');

const WeeklySummary = () => {
  const userId = useUserStore((state) => state.id);
  const [timeRegistrations, setTimeRegistrations] = useState<Marcaje[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [currentWeek, setCurrentWeek] = useState(() =>
    moment().startOf('isoWeek'),
  );
  const finDeSemana = currentWeek.clone().endOf('isoWeek');

  const fetchWeeklyData = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    const response = await weeklySummaryService(
      currentWeek.format(FORMATO),
      currentWeek.clone().endOf('isoWeek').format(FORMATO),
      userId,
    );
    if (response.success) {
      setTimeRegistrations(response.data);
    } else {
      setTimeRegistrations([]);
      setErrorMessage(response.message);
    }
    setLoading(false);
  }, [currentWeek, userId]);

  useEffect(() => {
    fetchWeeklyData();
  }, [fetchWeeklyData]);

  const cambiarSemana = (semanas: number) =>
    setCurrentWeek((semana) => semana.clone().add(semanas, 'week'));

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
          onPress={() => cambiarSemana(-1)}
          style={styles.navigateLeft}
          accessibilityRole="button"
          accessibilityLabel="Previous week"
        >
          {'<'}
        </Text>
        <Text style={styles.weekText}>
          {formatDate(currentWeek)} - {formatDate(finDeSemana)}
        </Text>
        <Text
          onPress={() => cambiarSemana(1)}
          style={styles.navigateRight}
          accessibilityRole="button"
          accessibilityLabel="Next week"
        >
          {'>'}
        </Text>
      </View>
      {loading && <ActivityIndicator size="large" color="#0AA5F2" />}
      {errorMessage !== '' && (
        <Text style={styles.noRegistrationsText} accessibilityRole="alert">
          {errorMessage}
        </Text>
      )}
      <ScrollView style={styles.scrollView}>
        {!loading && !errorMessage && timeRegistrations.length === 0 ? (
          <Text style={styles.noRegistrationsText}>
            There are no registrations on this period
          </Text>
        ) : (
          timeRegistrations.map((registration, index) => (
            <View key={registration.id} style={styles.registrationInfo}>
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
              <Text>Registration ID: {registration.id}</Text>
              {registration.latCoordinate && registration.longCoordinate ? (
                <Text>
                  Registration Location: {registration.latCoordinate},{' '}
                  {registration.longCoordinate}
                </Text>
              ) : (
                <Text style={styles.noLocation}>Location not available</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </Box>
  );
};

export default WeeklySummary;
