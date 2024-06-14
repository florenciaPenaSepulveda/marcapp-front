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
    description:{
      fontSize: 18,
      textAlign: 'center',
      fontWeight: '700',
      marginVertical: '10%',
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