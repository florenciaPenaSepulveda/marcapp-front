import { StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundColor: 'white',
      paddingHorizontal: '0%',
      paddingVertical: '0%',
    },
    profilePicture: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: '#007AFF',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '10%',
      marginBottom: '10%',
    },
    initial: {
      color: 'white',
      fontSize: 50,
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
    button: {
      flexDirection: 'column',
      alignContent: 'center',
      justifyContent: 'center',
      top: '30%',
    }
});

export default styles;