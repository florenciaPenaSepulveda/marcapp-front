import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  description: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 24,
    color: 'gray',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  button: {
    height: 120,
    width: 150,
  },
  checkInButton: {
    backgroundColor: 'green',
  },
  checkOutButton: {
    backgroundColor: 'red',
  },
  buttonTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  errorMessage: {
    color: '#C92A2A',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  registrationInfo: {
    marginTop: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  checkInMessage: {
    color: 'green',
    fontWeight: 'bold',
    marginTop: 8,
  },
  checkOutMessage: {
    color: 'red',
    fontWeight: 'bold',
    marginTop: 8,
  },
});

export default styles;
