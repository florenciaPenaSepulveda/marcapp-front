import { StyleSheet, View } from 'react-native';
import moment from 'moment';
import { useSyncStatus } from '../hooks/useSync';
import { Button, Notice } from './ui';
import { spacing } from '../theme';

export const SyncBanner = () => {
  const { online, pending, rejected, syncing, syncNow, dismiss } = useSyncStatus();

  if (online && pending.length === 0 && rejected.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {!online && (
        <Notice tone="warning">
          You are offline. You can keep working: your registrations are saved on this device and sent automatically when the signal returns.
        </Notice>
      )}
      {pending.length > 0 && (
        <>
          <Notice tone="info">
            {pending.length} {pending.length === 1 ? 'registration is' : 'registrations are'} waiting to be sent.
          </Notice>
          {online && (
            <Button
              title="Send now"
              variant="secondary"
              icon="cloud-upload-outline"
              loading={syncing}
              onPress={syncNow}
            />
          )}
        </>
      )}
      {rejected.map((item) => (
        <Notice key={item.clientId} tone="danger">
          Your {item.type === 'entry' ? 'check-in' : 'check-out'} of {moment(item.recordedAt).format('D MMM HH:mm')} was not accepted: {item.message}
        </Notice>
      ))}
      {rejected.length > 0 && <Button title="Dismiss" variant="ghost" onPress={dismiss} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
});
