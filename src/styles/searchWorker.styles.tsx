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
      padding: 10,
      borderRadius: 5,
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
      alignItems: 'center',
      marginVertical: -5,
      marginHorizontal: 100,
    },
    entryText: {
      color: 'green', // Color del texto para 'entry'
      fontWeight: 'bold',
    },
    exitText: {
      color: 'red', // Color del texto para 'exit'
      fontWeight: 'bold',
    },
    registrationInfo: {
      alignItems: 'flex-start',
      marginVertical: 10,
      marginHorizontal: 70,
    },
    noRegistrationsText: {
      fontSize: 18,
      textAlign: 'center',
      color: 'gray',
      marginTop: 20,
    },
});

export default styles;