import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: '10%',
    paddingVertical: 24,
  },
  marcapp: {
    fontSize: 30,
    textAlign: 'center',
    fontWeight: '700',
    marginVertical: 32,
  },
  error: {
    color: '#C92A2A',
    textAlign: 'center',
    marginBottom: 12,
  },
  login: {
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
  },
  signup: {
    textAlign: 'center',
    marginTop: 24,
    color: '#0AA5F2',
    fontWeight: '600',
  },
  copyright: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
    marginTop: 48,
  },
});

export default styles;
