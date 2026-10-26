import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  description: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 24,
    color: 'gray',
  },
  input: {
    maxWidth: 320,
  },
  login: {
    fontSize: 16,
    marginTop: 16,
  },
});

export default styles;
