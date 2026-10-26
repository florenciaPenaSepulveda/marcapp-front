import React, { useRef, useState } from 'react';
import { AlertDialog, Box, Button, Center, Input, Text, VStack } from 'native-base';
import { useNavigation } from '@react-navigation/core';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import 'text-encoding-polyfill';
import useUserStore from '../stores/useStore';
import { Header } from 'react-native-elements';
import { StyleSheet, View } from 'react-native';
import editService from '../services/editprofile.service';
import styles from '../styles/editProfile.styles';
import moment from 'moment';

type FormDataT = {
  firstName: string;
  lastName: string;
  birthday: string;
  email: string;
};

const EditProfile = () => {
  const { firstName, lastName, birthday, email, setFirstName, setLastName, setBirthday, setEmail } = useUserStore((state) => ({
    firstName: state.firstName,
    lastName: state.lastName,
    birthday: state.birthday,
    email: state.email,
    setFirstName: state.setFirstName,
    setLastName: state.setLastName,
    setBirthday: state.setBirthday,
    setEmail: state.setEmail,
  }));
  const InitData = {
    firstName: firstName,
    lastName: lastName,
    birthday: birthday,
    email: email,
  };
  const [data, setData] = useState<FormDataT>(InitData);
  const [alert, setAlert] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const cancelRef = useRef(null);

  const setValue = (key: keyof FormDataT, value: string) => {
    setData((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const validateDate = (dateString: string) => {
    const format = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
    if (!moment(dateString, format, true).isValid()) {
      setMessage('Invalid date format. Please use YYYY-MM-DDThh:mm:ss.mmmZ');
      setAlert(true);
      return false;
    }
    return true;
  };

  const onEdit = async () => {
    if (!validateDate(data.birthday)) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await editService(data);
      setLoading(false);

      if (response.success) {
        setMessage(response.message || 'Profile updated successfully!');  
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setBirthday(data.birthday);
        setEmail(data.email);
        setAlert(true);
        navigation.navigate('EditProfile');
      }
    } catch (error) {
      setLoading(false);
      setMessage('Error updating profile. Please try again.');
      setAlert(true);
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
          <Text style={styles.description}>
            Edit your profile data
          </Text>
        </Center>
        <Center>
          <Input
            style={styles.input}
            size="l"
            variant="outline"
            placeholder="First name"
            value={data.firstName}
            onChange={(e) => setValue('firstName', e.nativeEvent.text)}
          />
        </Center>
        <Center>
          <Input
            style={styles.input}
            size="l"
            variant="outline"
            placeholder="Last name"
            value={data.lastName}
            onChange={(e) => setValue('lastName', e.nativeEvent.text)}
          />
        </Center>
        <Center>
          <Input
            style={styles.input}
            size="l"
            variant="outline"
            placeholder="Birthday (Format: YYYY-MM-DDThh:mm:ss.mmmZ)"
            value={data.birthday}
            onChange={(e) => setValue('birthday', e.nativeEvent.text)}
          />
        </Center>
        <Center>
          <Input
            style={styles.input}
            size="l"
            variant="outline"
            placeholder="E-mail address (format: user@mail.abc)"
            value={data.email}
            onChange={(e) => setValue('email', e.nativeEvent.text)}
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

export default EditProfile;