import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  description: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: '700',
    marginVertical: 32,
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
  buttonContainer: {
    margin: 4,
  },
  buttonTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  logout: {
    marginTop: 'auto',
    width: 200,
  },
});

export default styles;
