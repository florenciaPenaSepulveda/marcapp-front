import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    description: {
      fontSize: 20,
      justifyContent: 'flex-start',
      fontWeight: '600',
      marginVertical: '10%',
      paddingHorizontal: '0%',
      color: 'gray',
    },
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundColor: 'white',
      paddingHorizontal: '0%',
      paddingVertical: '0%',
    },
    buttonsContainer: {
      position: 'relative',
      width: '100%',
      height: '100%',
    },
    button: {
      height: 120, // Ajusta la altura del botón aquí
      width: 150, // Ajusta el ancho del botón aquí
    },
    checkInButton: {
      backgroundColor: 'green', // Color del botón de Check-in
    },
    checkOutButton: {
      backgroundColor: 'red', // Color del botón de Check-out
    },
    buttonContainer: {
      position: 'absolute',
    },
    buttonTitle: {
      fontSize: 19, // Tamaño de la fuente del texto del botón
      fontWeight: 'bold', // Peso de la fuente del texto del botón
      color: 'white', // Color del texto del botón
    },
    registrationInfo: {
      fontSize: 20,
      justifyContent: 'flex-start',
      fontWeight: '600',
      marginVertical: '100%',
      paddingHorizontal: '0%',
      color: 'gray',
    },
    checkInMessage: {
      color: 'green', // Color del mensaje de Check-in
      fontWeight: 'bold',
      marginTop: 1000,
    },
    checkOutMessage: {
      color: 'red', // Color del mensaje de Check-out
      fontWeight: 'bold',
      marginTop: 100,
    },
});

export default styles;