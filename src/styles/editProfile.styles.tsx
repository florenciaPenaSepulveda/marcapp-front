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
    input: {
      maxWidth: 320,
    },
    description: {
      fontSize: 20,
      justifyContent: 'flex-start',
      fontWeight: '600',
      marginVertical: '10%',
      paddingHorizontal: '0%',
      color: 'gray',
    },
    testContainer:{
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flexDirection: 'row',
      gap: 16,
    }
  });
export default styles;