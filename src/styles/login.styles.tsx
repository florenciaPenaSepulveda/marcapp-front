import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'white',
      paddingHorizontal: '10%',
      paddingVertical: '5%',
    },
    marcapp: {
      fontSize: 30,
      textAlign: 'center',
      fontWeight: '700',
      marginVertical: '10%',    
    },
    login: {
      flexDirection: 'column',
      alignContent: 'center',
      justifyContent: 'center',    
    },
    signup: {
      textAlign: 'center',
      marginTop: '10%' ,
    },
    signuptext: {
      position: 'absolute',
      bottom: 16,
      alignSelf: 'center',
    },
    copyright: {
      fontSize: 12,
      color: 'gray',
    }
  });

export default styles;