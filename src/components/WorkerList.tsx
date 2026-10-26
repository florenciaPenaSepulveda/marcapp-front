import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWorkers } from '../hooks/useWorkers';
import { EstadoDeHoy, Usuario } from '../services/types';
import { Avatar, Badge, Button, Card, EmptyState, Field, Notice } from './ui';
import { colors, font, spacing } from '../theme';

type Props = {
  workers: ReturnType<typeof useWorkers>;
  onSelect: (user: Usuario) => void;
  selectedIds?: number[];
};

const EstadoBadge = ({ estado }: { estado?: EstadoDeHoy }) => {
  if (!estado) {
    return <Text style={font.small}>No activity today</Text>;
  }
  return estado.state === 'working' ? (
    <Badge label="Working now" tone="success" />
  ) : (
    <Badge label="Done today" tone="info" />
  );
};

export const WorkerList = ({ workers, onSelect, selectedIds }: Props) => {
  const { search, setSearch, items, total, loading, loadingMore, error, status, hasMore, loadMore, reload } = workers;
  const seleccionable = selectedIds !== undefined;

  return (
    <View style={styles.container}>
      <Card>
        <Field
          label="Search workers"
          placeholder="Type a name or email"
          value={search}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onChangeText={setSearch}
        />
      </Card>

      {error && (
        <>
          <Notice tone="danger">{error}</Notice>
          <Button title="Try again" icon="refresh" onPress={reload} />
        </>
      )}

      {loading && <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Loading workers" />}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon="people-outline"
          title={search ? 'No results' : 'No workers yet'}
          message={search ? 'Try another name or email.' : 'Registered workers will appear here.'}
        />
      )}

      {!loading && items.length > 0 && (
        <Text style={font.small}>
          Showing {items.length} of {total} {total === 1 ? 'worker' : 'workers'}
        </Text>
      )}

      {items.map((user) => {
        const elegido = selectedIds?.includes(user.id) ?? false;
        return (
          <Card
            key={user.id}
            onPress={() => onSelect(user)}
            accessibilityLabel={`${user.firstName} ${user.lastName}`}
            style={[styles.user, elegido && styles.selected]}
          >
            <Avatar name={user.firstName} />
            <View style={styles.info}>
              <Text style={font.heading} numberOfLines={1}>
                {user.firstName} {user.lastName}
              </Text>
              <Text style={font.small} numberOfLines={1}>
                {user.email}
              </Text>
              <EstadoBadge estado={status[user.id]} />
            </View>
            {seleccionable ? (
              <Ionicons
                name={elegido ? 'checkbox' : 'square-outline'}
                size={26}
                color={elegido ? colors.primary : colors.muted}
              />
            ) : (
              <Ionicons name="chevron-forward" size={22} color={colors.muted} />
            )}
          </Card>
        );
      })}

      {hasMore && !loading && (
        <Button
          title="Load more"
          variant="secondary"
          icon="chevron-down"
          loading={loadingMore}
          onPress={loadMore}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: spacing.lg },
  user: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 2, borderColor: 'transparent' },
  selected: { borderColor: colors.primary },
  info: { flex: 1, gap: 3 },
});
