import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import { addTimeRegistrationService, summaryService } from '../services/searchWorker.service';
import weeklySummaryService from '../services/weeklySummary.service';
import { Marcaje, Resumen, Usuario } from '../services/types';
import { agruparPorDia, diasSinSalida, formatearHoras } from '../lib/horarios';
import { validarFechaHora } from '../lib/validation';
import { useWorkers } from '../hooks/useWorkers';
import { WorkerList } from '../components/WorkerList';
import { Avatar, Badge, Button, EmptyState, Field, Notice, Screen, Sheet, StatTile } from '../components/ui';
import { colors, font, spacing } from '../theme';

type SearchWorkerProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const FORMATO = 'DD-MM-YYYY';

const SearchWorker: React.FC<SearchWorkerProps> = ({ navigation }) => {
  const workers = useWorkers();
  const [timeRegistrations, setTimeRegistrations] = useState<Marcaje[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [sheetInfo, setSheetInfo] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [sheetVisible, setSheetVisible] = useState(false);

  const loadDetail = async (user: Usuario) => {
    const semana = moment().startOf('isoWeek');
    const [registros, mes] = await Promise.all([
      weeklySummaryService(semana.format(FORMATO), semana.clone().endOf('isoWeek').format(FORMATO), user.id),
      summaryService(user.id),
    ]);
    if (registros.success) {
      setTimeRegistrations(registros.data);
    } else {
      setTimeRegistrations([]);
      setSheetError(registros.message);
    }
    setResumen(mes.success ? mes.data : null);
  };

  const openUser = async (user: Usuario) => {
    setSelectedUser(user);
    setSheetError(null);
    setSheetInfo(null);
    setNewDate('');
    setTimeRegistrations([]);
    setResumen(null);
    setSheetVisible(true);
    await loadDetail(user);
  };

  const handleAddTimeRegistration = async () => {
    if (!selectedUser) {
      return;
    }
    const error = validarFechaHora(newDate);
    if (error) {
      setSheetError(error);
      setSheetInfo(null);
      return;
    }
    const response = await addTimeRegistrationService(newDate, selectedUser.id);
    if (response.success) {
      setSheetError(null);
      setSheetInfo('Time registration added.');
      setNewDate('');
      await loadDetail(selectedUser);
      workers.reload();
    } else {
      setSheetInfo(null);
      setSheetError(response.message);
    }
  };

  const goEdit = (registration: Marcaje) => {
    setSheetVisible(false);
    navigation.navigate('EditTimeRegistration', {
      id: registration.id.toString(),
      date: registration.date,
      type: registration.type,
    });
  };

  const sinSalida = diasSinSalida(agruparPorDia(timeRegistrations));
  const ordenadas = [...timeRegistrations].sort(
    (a, b) => moment(b.date, 'DD-MM-YYYY HH:mm:ss').valueOf() - moment(a.date, 'DD-MM-YYYY HH:mm:ss').valueOf(),
  );

  return (
    <Screen style={styles.content}>
      <WorkerList workers={workers} onSelect={openUser} />

      <Sheet
        visible={sheetVisible}
        title={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ''}
        onClose={() => setSheetVisible(false)}
      >
        <View style={styles.sheetBody}>
          {selectedUser && (
            <View style={styles.profile}>
              <Avatar name={selectedUser.firstName} size={44} />
              <Text style={font.small}>{selectedUser.email}</Text>
            </View>
          )}

          {resumen && (
            <>
              <Text style={font.heading}>{moment().format('MMMM')}</Text>
              <View style={styles.tiles}>
                <StatTile label="Hours" value={formatearHoras(resumen.totalHours)} icon="time-outline" />
                <StatTile label="Days" value={String(resumen.daysWorked)} icon="calendar-outline" tone="success" />
                <StatTile
                  label="Avg / day"
                  value={formatearHoras(resumen.averageHoursPerDay)}
                  icon="speedometer-outline"
                  tone="warning"
                />
              </View>
            </>
          )}

          {sheetError && <Notice tone="danger">{sheetError}</Notice>}
          {sheetInfo && <Notice tone="success">{sheetInfo}</Notice>}
          {sinSalida.length > 0 && <Notice tone="warning">Missing check-out on: {sinSalida.join(', ')}.</Notice>}

          <Text style={font.heading}>This week</Text>
          {ordenadas.length === 0 && !sheetError && (
            <EmptyState icon="time-outline" title="No registrations this week" />
          )}
          {ordenadas.map((registration) => (
            <Pressable
              key={registration.id}
              onPress={() => goEdit(registration)}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${registration.type} ${registration.date}`}
              style={({ pressed }) => [styles.record, pressed && styles.pressed]}
            >
              <Ionicons
                name={registration.type === 'entry' ? 'log-in-outline' : 'log-out-outline'}
                size={24}
                color={registration.type === 'entry' ? colors.success : colors.danger}
              />
              <View style={styles.flex}>
                <Text style={font.heading}>{registration.date}</Text>
                <Text style={font.small}>
                  {registration.latCoordinate && registration.longCoordinate
                    ? `Location: ${registration.latCoordinate}, ${registration.longCoordinate}`
                    : 'Location not available'}
                </Text>
                {registration.adminFlag && <Badge label="Edited by admin" tone="warning" />}
              </View>
              <Ionicons name="create-outline" size={22} color={colors.primary} />
            </Pressable>
          ))}

          <Text style={font.heading}>Add a registration</Text>
          <Field
            label="Date and time"
            placeholder="DD-MM-YYYY HH:mm:ss"
            value={newDate}
            autoCapitalize="none"
            onChangeText={setNewDate}
          />
          <Button title="Add registration" icon="add" onPress={handleAddTimeRegistration} />
        </View>
      </Sheet>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { maxWidth: 640, width: '100%', alignSelf: 'center' },
  flex: { flex: 1, gap: 2 },
  sheetBody: { gap: spacing.md, paddingBottom: spacing.lg },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  record: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { backgroundColor: colors.primarySoft },
});

export default SearchWorker;
