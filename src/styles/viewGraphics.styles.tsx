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
      height: 40, // Ajusta la altura del botón aquí
      width: 80, // Ajusta el ancho del botón aquí
    },
    buttonContainer: {
      position: 'relative',
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    buttonWrapper: {
      margin: 10,
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
      marginHorizontal: 80,
      
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
      maxHeight: 600, // Ajusta esta altura según sea necesario
      width: '100%',
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
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
      navigate: {
        textAlign: 'left',
        marginTop: '0%',
        fontSize: 25,
      },
      graphic: {
        height: 200,
        padding: 20,
        flexDirection: 'row'
      },
      yaxis: {
        marginBottom: 30
      },
      insetY: {
        top: 10,
        bottom: 10
      },
      barchart: {
        flex: 1, 
        marginLeft: 10
      },
      barchartType: {
        flex: 1
      },
      xaxis: {
        marginHorizontal: -10,
        height: 30
      },
      insetX: {
        left: 10,
        right: 10
      },
});

export default styles;