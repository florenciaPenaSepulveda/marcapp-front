import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import useUserStore from '../stores/useStore';
import weeklySummaryService from '../services/weeklySummary.service';
import { Marcaje } from '../services/types';
import { agruparPorDia, diasSinSalida, formatearHoras, hora, totalDeHoras } from '../lib/horarios';
import { Badge, Button, Card, EmptyState, Notice, Screen } from '../components/ui';
import { colors, font, spacing } from '../theme';

const FORMATO = 'DD-MM-YYYY';

const formatDate = (date: moment.Moment) =>
  date.year() !== moment().year() ? date.format('D MMM YYYY') : date.format('D MMM');

const WeeklySummary = () => {
  const userId = useUserStore((state) => state.id);
  const [timeRegistrations, setTimeRegistrations] = useState<Marcaje[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [currentWeek, setCurrentWeek] = useState(() => moment().startOf('isoWeek'));
  const finDeSemana = currentWeek.clone().endOf('isoWeek');
  const esSemanaActual = currentWeek.isSame(moment().startOf('isoWeek'), 'day');

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

  const jornadas = useMemo(() => agruparPorDia(timeRegistrations), [timeRegistrations]);
  const pendientes = diasSinSalida(jornadas);

  const cambiarSemana = (semanas: number) =>
    setCurrentWeek((semana) => semana.clone().add(semanas, 'week'));

  return (
    <Screen style={styles.content}>
      <Card style={styles.weekBar}>
        <Pressable
          onPress={() => cambiarSemana(-1)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Previous week"
          style={styles.arrow}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </Pressable>
        <View style={styles.weekCenter}>
          <Text style={font.heading}>
            {formatDate(currentWeek)} – {formatDate(finDeSemana)}
          </Text>
          <Text style={font.small}>{esSemanaActual ? 'This week' : 'Week ' + currentWeek.isoWeek()}</Text>
        </View>
        <Pressable
          onPress={() => cambiarSemana(1)}
          disabled={esSemanaActual}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Next week"
          style={[styles.arrow, esSemanaActual && styles.arrowDisabled]}
        >
          <Ionicons name="chevron-forward" size={24} color={colors.primary} />
        </Pressable>
      </Card>

      {!esSemanaActual && (
        <Button
          title="Back to this week"
          variant="ghost"
          onPress={() => setCurrentWeek(moment().startOf('isoWeek'))}
        />
      )}

      {loading && <ActivityIndicator size="large" color={colors.primary} />}
      {errorMessage !== '' && (
        <>
          <Notice tone="danger">{errorMessage}</Notice>
          <Button title="Try again" icon="refresh" onPress={fetchWeeklyData} />
        </>
      )}

      {!loading && !errorMessage && jornadas.length > 0 && (
        <Card style={styles.total}>
          <Text style={font.small}>Total this week</Text>
          <Text style={styles.totalValue}>{formatearHoras(totalDeHoras(jornadas))}</Text>
        </Card>
      )}

      {pendientes.length > 0 && (
        <Notice tone="warning">
          Missing check-out on: {pendientes.join(', ')}.
        </Notice>
      )}

      {!loading && !errorMessage && jornadas.length === 0 && (
        <EmptyState
          icon="calendar-clear-outline"
          title="No registrations this week"
          message="When you check in and out, your days will appear here."
        />
      )}

      {jornadas.map((jornada) => (
        <Card key={jornada.dia} style={styles.day}>
          <View style={styles.dayHeader}>
            <Text style={font.heading}>{moment(jornada.dia, FORMATO).format('dddd, D MMM')}</Text>
            {jornada.horas !== null ? (
              <Badge label={formatearHoras(jornada.horas)} tone="success" />
            ) : (
              <Badge label="Incomplete" tone="warning" />
            )}
          </View>
          <View style={styles.times}>
            <View style={styles.time}>
              <Ionicons name="log-in-outline" size={20} color={colors.success} />
              <View>
                <Text style={font.small}>Check-in</Text>
                <Text style={font.heading}>{hora(jornada.entrada)}</Text>
              </View>
            </View>
            <View style={styles.time}>
              <Ionicons name="log-out-outline" size={20} color={colors.danger} />
              <View>
                <Text style={font.small}>Check-out</Text>
                <Text style={font.heading}>{hora(jornada.salida)}</Text>
              </View>
            </View>
          </View>
        </Card>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { maxWidth: 560, width: '100%', alignSelf: 'center' },
  weekBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  weekCenter: { alignItems: 'center', flex: 1 },
  arrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowDisabled: { opacity: 0.35 },
  total: { alignItems: 'center', gap: 2 },
  totalValue: { fontSize: 32, fontWeight: '800', color: colors.primary },
  day: { gap: spacing.md },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  times: { flexDirection: 'row', gap: spacing.xl },
  time: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});

export default WeeklySummary;
