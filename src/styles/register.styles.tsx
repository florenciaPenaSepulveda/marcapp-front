import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundColor: '#fff',
      paddingHorizontal: '0%',
      paddingVertical: '0%',
    },
    description: {
      fontSize: 20,
      justifyContent: 'flex-start',
      fontWeight: '600',
      marginVertical: '10%',
      paddingHorizontal: '0%',
      color: 'gray',
    },
    input: {
      maxWidth: 320,
    },
    login: {
      fontSize: 16,
      marginTop: '5%',
    }
});

export default styles;