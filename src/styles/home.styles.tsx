import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    background: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundColor: 'white',
      paddingHorizontal: '0%',
      paddingVertical: '5%',
    },
    description: {
      fontSize: 24,
      textAlign: 'center',
      fontWeight: '700',
      marginVertical: '10%',
    },
    buttonsContainer: {
      position: 'absolute',
      width: '100%',
      height: '100%',
    },
    button: {
      height: 120, // Ajusta la altura del botón aquí
      width: 150, // Ajusta el ancho del botón aquí
    },
    buttonContainer: {
      position: 'absolute',
    },
    buttonTitle: {
      fontSize: 19, // Tamaño de la fuente del texto del botón
      fontWeight: 'bold', // Peso de la fuente del texto del botón
      color: 'white', // Color del texto del botón
    },
});

export default styles;