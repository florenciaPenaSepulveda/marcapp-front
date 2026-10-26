import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 20,
    justifyContent: 'flex-start',
    fontWeight: '600',
    marginVertical: '10%',
    paddingHorizontal: '0%',
    color: 'gray',
  },
  information: {
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
    top: '30%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    alignContent: 'space-around',
    justifyContent: 'flex-start',
    backgroundColor: 'white',
    paddingHorizontal: '0%',
    paddingVertical: '0%',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 70,
    textAlign: 'left',
  },
  button: {
    backgroundColor: '#0AA5F2',
    borderRadius: 5,
    marginVertical: 10,
    marginHorizontal: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  profilePicture: {
    width: 35,
    height: 35,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '10%',
    marginBottom: '10%',
  },
  initial: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    alignItems: 'baseline',
    marginVertical: -0,
    marginHorizontal: 0,
    height: 100,
    width: 200,
  },
  entryText: {
    color: 'green',
    fontWeight: 'bold',
  },
  exitText: {
    color: 'red',
    fontWeight: 'bold',
  },
  registrationInfo: {
    alignItems: 'flex-start',
    marginVertical: 10,
    marginHorizontal: 0,
    height: 100,
    width: 250,
  },
  noRegistrationsText: {
    fontSize: 18,
    textAlign: 'center',
    color: 'gray',
    marginTop: 20,
  },
  noLocation: {
    alignItems: 'flex-start',
    marginVertical: 10,
    marginHorizontal: 40,
    color: 'gray',
    fontStyle: 'italic',
  },
  scrollContainer: {
    maxHeight: 600,
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
  },
  warningMessage: {
    color: 'red',
    marginTop: 10,
  },
  formContainer: {
    marginTop: 20,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollContainerClose: {
    width: '100%',
  },
  yearText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    textAlign: 'center',
  },
});

export default styles;
