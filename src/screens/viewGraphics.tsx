import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import viewGraphicsService from '../services/viewGraphics.service';
import { Usuario } from '../services/types';
import { formatearHoras } from '../lib/horarios';
import {
  Avatar,
  BarChart,
  Button,
  Card,
  EmptyState,
  Field,
  Notice,
  Screen,
  Sheet,
} from '../components/ui';
import { colors, font, radius, spacing } from '../theme';

type VistaT = 'year' | 'week';

const MESES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DIAS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const etiquetaSemana = (semana: moment.Moment) => {
  const fin = semana.clone().endOf('isoWeek');
  return `${semana.format('D MMM')} – ${fin.format('D MMM')}`;
};

const ViewGraphics = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Usuario[] | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [averageHours, setAverageHours] = useState<Record<number, number[]>>({});
  const [selectedYear, setSelectedYear] = useState<number>(moment().year());
  const [viewType, setViewType] = useState<VistaT>('year');
  const [currentWeek, setCurrentWeek] = useState(() => moment().startOf('isoWeek'));

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
    if (sheetVisible) {
      selectedUsers.forEach((user) => {
        cargarHoras(user.id);
      });
    }
  }, [selectedUsers, sheetVisible, cargarHoras]);

  const handleSearch = async () => {
    setLoading(true);
    setErrorMessage(null);
    const results = await viewGraphicsService.viewGraphicsService(searchTerm);
    setLoading(false);
    if (results.success) {
      setSearchResults(results.data);
    } else {
      setSearchResults(null);
      setErrorMessage(results.message);
    }
  };

  const toggleUser = (user: Usuario) =>
    setSelectedUsers((previo) =>
      previo.some((u) => u.id === user.id) ? previo.filter((u) => u.id !== user.id) : [...previo, user],
    );

  const moverPeriodo = (paso: number) =>
    viewType === 'year'
      ? setSelectedYear((anio) => anio + paso)
      : setCurrentWeek((semana) => semana.clone().add(paso, 'week'));

  return (
    <Screen style={styles.content}>
      <Card style={styles.search}>
        <Field
          label="Search workers"
          placeholder="Name or email"
          value={searchTerm}
          autoCapitalize="none"
          returnKeyType="search"
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearch}
        />
        <Button title="Search" icon="search" onPress={handleSearch} loading={loading} />
      </Card>

      {errorMessage && <Notice tone="danger">{errorMessage}</Notice>}

      {searchResults !== null && searchResults.length === 0 && (
        <EmptyState icon="search-outline" title="No results" message="Try another name or email." />
      )}

      {searchResults && searchResults.length > 0 && (
        <Text style={font.small}>Select one or more workers to view or compare their hours.</Text>
      )}

      {searchResults?.map((user) => {
        const elegido = selectedUsers.some((u) => u.id === user.id);
        return (
          <Card
            key={user.id}
            onPress={() => toggleUser(user)}
            accessibilityLabel={`${elegido ? 'Deselect' : 'Select'} ${user.firstName} ${user.lastName}`}
            style={[styles.user, elegido && styles.userSelected]}
          >
            <Avatar name={user.firstName} />
            <View style={styles.flex}>
              <Text style={font.heading}>
                {user.firstName} {user.lastName}
              </Text>
              <Text style={font.small}>{user.email}</Text>
            </View>
            <Ionicons
              name={elegido ? 'checkbox' : 'square-outline'}
              size={26}
              color={elegido ? colors.primary : colors.muted}
            />
          </Card>
        );
      })}

      {selectedUsers.length > 0 && (
        <Button
          title={`View statistics (${selectedUsers.length})`}
          icon="bar-chart"
          onPress={() => setSheetVisible(true)}
        />
      )}

      <Sheet visible={sheetVisible} title="Worked hours" onClose={() => setSheetVisible(false)}>
        <View style={styles.sheetBody}>
          <View style={styles.segment}>
            {(['year', 'week'] as VistaT[]).map((vista) => (
              <Pressable
                key={vista}
                onPress={() => setViewType(vista)}
                accessibilityRole="button"
                accessibilityState={{ selected: viewType === vista }}
                style={[styles.segmentItem, viewType === vista && styles.segmentActive]}
              >
                <Text style={[styles.segmentText, viewType === vista && styles.segmentTextActive]}>
                  {vista === 'year' ? 'By year' : 'By week'}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.period}>
            <Pressable onPress={() => moverPeriodo(-1)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Previous period">
              <Ionicons name="chevron-back" size={26} color={colors.primary} />
            </Pressable>
            <Text style={font.heading}>{viewType === 'year' ? selectedYear : etiquetaSemana(currentWeek)}</Text>
            <Pressable onPress={() => moverPeriodo(1)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Next period">
              <Ionicons name="chevron-forward" size={26} color={colors.primary} />
            </Pressable>
          </View>

          {selectedUsers.map((user) => {
            const datos = averageHours[user.id];
            const hayDatos = datos?.some((horas) => horas !== 0);
            const promedio = hayDatos ? datos.filter((h) => h > 0).reduce((a, b) => a + b, 0) / datos.filter((h) => h > 0).length : 0;
            return (
              <View key={user.id} style={styles.userChart}>
                <View style={styles.userHeader}>
                  <Avatar name={user.firstName} size={36} />
                  <Text style={font.heading}>
                    {user.firstName} {user.lastName}
                  </Text>
                </View>
                {hayDatos ? (
                  <>
                    <BarChart data={datos} labels={viewType === 'year' ? MESES : DIAS} />
                    <Text style={font.small}>
                      Average on days with data: {formatearHoras(promedio)}
                    </Text>
                  </>
                ) : (
                  <EmptyState
                    icon="analytics-outline"
                    title="No data for this period"
                    message="Try another week or year."
                  />
                )}
              </View>
            );
          })}
        </View>
      </Sheet>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { maxWidth: 640, width: '100%', alignSelf: 'center' },
  flex: { flex: 1, gap: 2 },
  search: { gap: spacing.md },
  user: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 2, borderColor: 'transparent' },
  userSelected: { borderColor: colors.primary },
  sheetBody: { gap: spacing.lg, paddingBottom: spacing.lg },
  segment: { flexDirection: 'row', backgroundColor: colors.background, borderRadius: radius.md, padding: 4 },
  segmentItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.sm },
  segmentActive: { backgroundColor: colors.primary },
  segmentText: { fontWeight: '700', color: colors.muted },
  segmentTextActive: { color: '#fff' },
  period: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  userChart: { gap: spacing.md },
  userHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});

export default ViewGraphics;
