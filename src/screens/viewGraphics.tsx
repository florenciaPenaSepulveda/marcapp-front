import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import viewGraphicsService from '../services/viewGraphics.service';
import { summaryService } from '../services/searchWorker.service';
import { Resumen, Usuario } from '../services/types';
import { formatearHoras } from '../lib/horarios';
import { useWorkers } from '../hooks/useWorkers';
import { WorkerList } from '../components/WorkerList';
import { Avatar, BarChart, Button, Card, EmptyState, Notice, Screen, Sheet, StatTile } from '../components/ui';
import { colors, font, radius, spacing } from '../theme';

type VistaT = 'year' | 'week';

const MESES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DIAS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const etiquetaSemana = (semana: moment.Moment) => {
  const fin = semana.clone().endOf('isoWeek');
  return `${semana.format('D MMM')} – ${fin.format('D MMM')}`;
};

const ViewGraphics = () => {
  const workers = useWorkers();
  const [comparar, setComparar] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Usuario[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [averageHours, setAverageHours] = useState<Record<number, number[]>>({});
  const [resumenes, setResumenes] = useState<Record<number, Resumen>>({});
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
    if (!sheetVisible) {
      return;
    }
    setErrorMessage(null);
    selectedUsers.forEach((user) => {
      cargarHoras(user.id);
    });
  }, [selectedUsers, sheetVisible, cargarHoras]);

  useEffect(() => {
    if (!sheetVisible) {
      return;
    }
    selectedUsers.forEach(async (user) => {
      const respuesta = await summaryService(user.id);
      if (respuesta.success) {
        setResumenes((previo) => ({ ...previo, [user.id]: respuesta.data }));
      }
    });
  }, [selectedUsers, sheetVisible]);

  const alElegir = (user: Usuario) => {
    if (comparar) {
      setSelectedUsers((previo) =>
        previo.some((u) => u.id === user.id) ? previo.filter((u) => u.id !== user.id) : [...previo, user],
      );
      return;
    }
    setSelectedUsers([user]);
    setSheetVisible(true);
  };

  const alCambiarModo = (activo: boolean) => {
    setComparar(activo);
    setSelectedUsers([]);
  };

  const moverPeriodo = (paso: number) =>
    viewType === 'year'
      ? setSelectedYear((anio) => anio + paso)
      : setCurrentWeek((semana) => semana.clone().add(paso, 'week'));

  return (
    <Screen style={styles.content}>
      <Card style={styles.mode}>
        <View style={styles.flex}>
          <Text style={font.heading}>Compare workers</Text>
          <Text style={font.small}>
            {comparar ? 'Select two or more workers.' : 'Tap a worker to see their hours.'}
          </Text>
        </View>
        <Switch
          value={comparar}
          onValueChange={alCambiarModo}
          trackColor={{ true: colors.primary, false: colors.border }}
          accessibilityLabel="Compare workers"
        />
      </Card>

      <WorkerList
        workers={workers}
        onSelect={alElegir}
        selectedIds={comparar ? selectedUsers.map((u) => u.id) : undefined}
      />

      {comparar && selectedUsers.length > 0 && (
        <Button
          title={`View statistics (${selectedUsers.length})`}
          icon="bar-chart"
          onPress={() => setSheetVisible(true)}
        />
      )}

      <Sheet
        visible={sheetVisible}
        title={selectedUsers.length === 1 ? `${selectedUsers[0].firstName} ${selectedUsers[0].lastName}` : 'Worked hours'}
        onClose={() => setSheetVisible(false)}
      >
        <View style={styles.sheetBody}>
          {errorMessage && <Notice tone="danger">{errorMessage}</Notice>}

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
            const resumen = resumenes[user.id];
            const conHoras = datos?.filter((horas) => horas > 0) ?? [];
            const promedio = conHoras.length ? conHoras.reduce((a, b) => a + b, 0) / conHoras.length : 0;
            return (
              <View key={user.id} style={styles.userChart}>
                {selectedUsers.length > 1 && (
                  <View style={styles.userHeader}>
                    <Avatar name={user.firstName} size={36} />
                    <Text style={font.heading}>
                      {user.firstName} {user.lastName}
                    </Text>
                  </View>
                )}
                {resumen && (
                  <View style={styles.tiles}>
                    <StatTile label={`${moment().format('MMM')} hours`} value={formatearHoras(resumen.totalHours)} icon="time-outline" />
                    <StatTile label="Days worked" value={String(resumen.daysWorked)} icon="calendar-outline" tone="success" />
                    <StatTile
                      label="Avg / day"
                      value={formatearHoras(resumen.averageHoursPerDay)}
                      icon="speedometer-outline"
                      tone="warning"
                    />
                  </View>
                )}
                {conHoras.length > 0 ? (
                  <>
                    <BarChart data={datos} labels={viewType === 'year' ? MESES : DIAS} />
                    <Text style={font.small}>Average on days with data: {formatearHoras(promedio)}</Text>
                  </>
                ) : (
                  <EmptyState icon="analytics-outline" title="No data for this period" message="Try another week or year." />
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
  flex: { flex: 1 },
  mode: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sheetBody: { gap: spacing.lg, paddingBottom: spacing.lg },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
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
