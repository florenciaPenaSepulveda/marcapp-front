import { Box, Button, Center, Input, Text, VStack } from 'native-base';
import { useRef, useState } from 'react';
import registerService from '../services/register.service';
import { AlertDialog } from 'native-base';
import { useNavigation } from '@react-navigation/core';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import { Calendar } from 'react-native-calendars'
import styles from '../styles/register.styles';


type FormDataT = {
  firstName: string;
  lastName: string;
  email: string;
  pass: string;
  birthday: string;
};

const InitData = {
  firstName: '',
  lastName: '',
  email: '',
  pass: '',
  birthday: '',
};

const Register = () => {
  const [data, setData] = useState<FormDataT>(InitData);
  const [alert, setAlert] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const cancelRef = useRef(null);

  const setValue = (key: string, value: string) => {
    setData((prevState) => {
      return {
        ...prevState,
        [key]: value,
      };
    });
  };

  const onClickButton = async () => {
    setLoading(true);
    const response = await registerService(data);
    setLoading(false);
  
    setMessage(response?.message || '');
    setAlert(true);
  
    if (response?.success) {
      setData(InitData);
      navigation.navigate('Login');
    }
  };

  return (
    <Box
      style={styles.container}
    >
      <AlertDialog
        leastDestructiveRef={cancelRef}
        isOpen={alert}
        onClose={() => setAlert(false)}
      >
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Body>{message}</AlertDialog.Body>
        </AlertDialog.Content>
      </AlertDialog>
      <VStack space={4} alignItems="center">
        <Center>
          <Text
          style={styles.marcapp}
        >
          MarcApp
        </Text>
        </Center>
        <Center>
          <Input
            size="l"
            variant="outline"
            placeholder="First name"
            value={data?.firstName}
            onChange={(e) => setValue('firstName', e?.nativeEvent?.text as string)}
          />
        </Center>
        <Center>
          <Input
            size="l"
            variant="outline"
            placeholder="Last name"
            value={data?.lastName}
            onChange={(e) =>
              setValue('lastName', e?.nativeEvent?.text as string)
            }
          />
        </Center>
        <Center>
          <Input
            size="l"
            variant="outline"
            placeholder="Email"
            value={data?.email}
            onChange={(e) => setValue('email', e?.nativeEvent?.text as string)}
          />
        </Center>
        <Center>
          <Input
            size="l"
            type="password"
            variant="outline"
            placeholder="Password"
            value={data?.pass}
            onChange={(e) =>
              setValue('pass', e?.nativeEvent?.text as string)
            }
          />
        </Center>
        <Center>
          <Input
            size="l"
            variant="outline"
            placeholder="Birthday (YYYY-MM-DD)"
            value={data?.birthday}
            onChange={(e) =>
              setValue('birthday', e?.nativeEvent?.text as string)
            }
          />
        </Center>
        <Center>
          {/* FORMATO COMENTARIOS EN TSX
            */
          } 
          <Button isLoading={loading} onPress={onClickButton}>
            Create account
          </Button>
        </Center>
        <Center>
        <Calendar
            onDayPress={day => {
                console.log('selected day', day);
            }}
            />
          <Text
            style={styles.login}
            onPress={() => navigation.navigate('Login')}
          >
            I already have an account
          </Text>
        </Center>
      </VStack>
    </Box>
  );
};

export default Register;
