import { Box, Button, Center, Input, Text, VStack } from 'native-base';
import { useRef, useState } from 'react';
import { AlertDialog } from 'native-base';
import { useNavigation } from '@react-navigation/core';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import 'text-encoding-polyfill';
import useUserStore from '../stores/useStore';
import { Header } from 'react-native-elements';
import { StyleSheet, View } from 'react-native';
import editService from '../services/editprofile.service';
import { useStore } from 'zustand';

type FormDataT = {
  first_name: string;
  last_name: string;
  email: string;
  birthday: string;
  role: string;
};

const EditProfile = () => {
  const userStore = useUserStore();
  const InitData = {
    first_name: userStore.firstName,
    last_name: userStore.lastName,
    email: userStore.email,
    birthday: userStore.birthday,
    role: userStore.role,
  };
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

  const onEdit = async () => {
    setLoading(true);
    const response = await editService(data);
    setLoading(false);
  
    setMessage(response?.message || '');
    setAlert(true);
  
    if (response?.success) {
      userStore.setFirstName(data.first_name);
      userStore.setLastName(data.last_name);
      userStore.setEmail(data.email);
      userStore.setBirthday(data.birthday);
      navigation.navigate('Profile');
    }
  };

  return (
    <Box style={styles.container}>
      <Header
        centerComponent={{
          text: 'Edit profile',
          style: {
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 20,
          },
        }}
        containerStyle={{
          backgroundColor: '#0AA5F2',
          justifyContent: 'space-around',
        }}
      />
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
            style={{
              fontSize: 18,
              textAlign: 'center',
              fontWeight: '700',
              marginVertical: '10%',
            }}
          >
          </Text>
        </Center>
        <Center>
          <Input
            style={styles.input}
            size="l"
            variant="outline"
            placeholder="First name"
            value={data?.first_name}
            onChange={(e) => setValue('first_name', e?.nativeEvent?.text as string)}
          />
        </Center>
        <Center>
          <Input
            style={styles.input}
            size="l"
            variant="outline"
            placeholder="Last name"
            value={data?.last_name}
            onChange={(e) =>
              setValue('last_name', e?.nativeEvent?.text as string)
            }
          />
        </Center>
        <Center>
          <Input
            style={styles.input}
            size="l"
            variant="outline"
            placeholder="Email"
            value={data?.email}
            onChange={(e) => setValue('email', e?.nativeEvent?.text as string)}
          />
        </Center>
        <Center>
          <Input
            style={styles.input}
            size="l"
            variant="outline"
            placeholder="Birthday (YYYY-MM-DD)"
            value={data?.birthday}
            onChange={(e) =>
              setValue('birthday', e?.nativeEvent?.text as string)
            }
          />
        </Center>
        <View
        style={{
          flex: 1,
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          flexDirection: 'row',
          gap: 16,
        }}
      >
        <Button isLoading={loading} onPress={onEdit}>
          Save changes
        </Button>
      </View>
        
      </VStack>
    </Box>
  );
};

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
});

export default EditProfile;
