import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundColor: 'white',
      paddingHorizontal: '0%',
      paddingVertical: '0%',
    },
    navigationContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      paddingHorizontal: 20,
      marginVertical: 20,
    },
    navButton: {
      width: 150,
      height: 40,
    },
    navigateLeft: {
      textAlign: 'left',
      marginTop: '0%',
      fontSize: 25,
    },
    navigateRight: {
      textAlign: 'right',
      marginTop: '0%',
      fontSize: 25,
    },
    weekText: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    name: {
      fontSize: 24,
      textAlign: 'center',
      fontWeight: '700',
      marginBottom: '5%',
    },
    info: {
      fontSize: 18,
      textAlign: 'left',
      marginBottom: '5%',
    },
    registrationInfo: {
      marginTop: 50,
      alignItems: 'center',
    },
    entryText: {
      color: 'green', // Color del texto para 'entry'
      fontWeight: 'bold',
    },
    exitText: {
      color: 'red', // Color del texto para 'exit'
      fontWeight: 'bold',
    },
    scrollView: {
      width: '100%',
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
});

export default styles;