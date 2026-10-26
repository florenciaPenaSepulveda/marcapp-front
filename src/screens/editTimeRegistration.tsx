import { useRef, useState } from 'react';
import { Box, Button, Center, Input, Text, VStack, AlertDialog } from 'native-base';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import { Header } from 'react-native-elements';
import { View } from 'react-native';
import editTimeRegistrationService from '../services/editTimeRegistration.service';
import { validarFechaHora } from '../lib/validation';
import styles from '../styles/editTimeRegistration.styles';

const EditTimeRegistration = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { id, date, type } = route.params as {
    id: string;
    date: string;
    type: string;
  };

  const [fecha, setFecha] = useState<string>(date);
  const [alert, setAlert] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [guardado, setGuardado] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const cancelRef = useRef(null);

  const mostrar = (texto: string, exito = false) => {
    setMessage(texto);
    setGuardado(exito);
    setAlert(true);
  };

  const onEdit = async () => {
    const error = validarFechaHora(fecha);
    if (error) {
      mostrar(error);
      return;
    }
    setLoading(true);
    const response = await editTimeRegistrationService(Number(id), fecha);
    setLoading(false);
    if (response.success) {
      mostrar('Time registration updated successfully!', true);
    } else {
      mostrar(response.message);
    }
  };

  const cerrar = () => {
    setAlert(false);
    if (guardado) {
      navigation.goBack();
    }
  };

  return (
    <Box style={styles.container}>
      <Header
        centerComponent={{
          text: 'Edit time registration',
          style: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
        }}
        containerStyle={{
          backgroundColor: '#0AA5F2',
          justifyContent: 'space-around',
        }}
      />
      <AlertDialog leastDestructiveRef={cancelRef} isOpen={alert} onClose={cerrar}>
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Body>{message}</AlertDialog.Body>
        </AlertDialog.Content>
      </AlertDialog>
      <VStack space={4} alignItems="center">
        <Center>
          <Text style={styles.description}>
            Edit this {type} time registration date
          </Text>
        </Center>
        <Center>
          <Input
            style={styles.input}
            size="l"
            variant="outline"
            placeholder="Format: DD-MM-YYYY HH:mm:ss"
            value={fecha}
            autoCapitalize="none"
            onChange={(e) => setFecha(e.nativeEvent.text)}
          />
        </Center>
        <View style={styles.testContainer}>
          <Button isLoading={loading} onPress={onEdit}>
            Save changes
          </Button>
        </View>
      </VStack>
    </Box>
  );
};

export default EditTimeRegistration;
