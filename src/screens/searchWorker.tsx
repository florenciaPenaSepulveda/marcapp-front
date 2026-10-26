import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import {
  searchWorkerService,
  addTimeRegistrationService,
} from '../services/searchWorker.service';
import weeklySummaryService from '../services/weeklySummary.service';
import { Marcaje, Usuario } from '../services/types';
import { agruparPorDia, diasSinSalida } from '../lib/horarios';
import { validarFechaHora } from '../lib/validation';
import { Avatar, Badge, Button, Card, EmptyState, Field, Notice, Screen, Sheet } from '../components/ui';
import { colors, font, spacing } from '../theme';

type SearchWorkerProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const FORMATO = 'DD-MM-YYYY';

const SearchWorker: React.FC<SearchWorkerProps> = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Usuario[] | null>(null);
  const [timeRegistrations, setTimeRegistrations] = useState<Marcaje[]>([]);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [sheetInfo, setSheetInfo] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [sheetVisible, setSheetVisible] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setErrorMessage(null);
    const results = await searchWorkerService(searchTerm);
    setLoading(false);
    if (results.success) {
      setSearchResults(results.data);
    } else {
      setSearchResults(null);
      setErrorMessage(results.message);
    }
  };

  const loadWeek = async (user: Usuario) => {
    const semana = moment().startOf('isoWeek');
    const response = await weeklySummaryService(
      semana.format(FORMATO),
      semana.clone().endOf('isoWeek').format(FORMATO),
      user.id,
    );
    if (response.success) {
      setTimeRegistrations(response.data);
      return true;
    }
    setTimeRegistrations([]);
    setSheetError(response.message);
    return false;
  };

  const openUser = async (user: Usuario) => {
    setSelectedUser(user);
    setSheetError(null);
    setSheetInfo(null);
    setNewDate('');
    setTimeRegistrations([]);
    setSheetVisible(true);
    await loadWeek(user);
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
      await loadWeek(selectedUser);
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

      {searchResults?.map((user) => (
        <Card key={user.id} onPress={() => openUser(user)} accessibilityLabel={`${user.firstName} ${user.lastName}`} style={styles.user}>
          <Avatar name={user.firstName} />
          <View style={styles.flex}>
            <Text style={font.heading}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={font.small}>{user.email}</Text>
            <Text style={font.small}>ID {user.id}</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.muted} />
        </Card>
      ))}

      <Sheet
        visible={sheetVisible}
        title={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName} · this week` : ''}
        onClose={() => setSheetVisible(false)}
      >
        <View style={styles.sheetBody}>
          {sheetError && <Notice tone="danger">{sheetError}</Notice>}
          {sheetInfo && <Notice tone="success">{sheetInfo}</Notice>}
          {sinSalida.length > 0 && (
            <Notice tone="warning">Missing check-out on: {sinSalida.join(', ')}.</Notice>
          )}

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
  search: { gap: spacing.md },
  user: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sheetBody: { gap: spacing.md, paddingBottom: spacing.lg },
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
