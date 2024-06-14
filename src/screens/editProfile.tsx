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
import styles from '../styles/editProfile.styles';

type FormDataT = {
  firstName: string;
  lastName: string;
};

const EditProfile = () => {
  const userStore = useUserStore();
  const InitData = {
    firstName: userStore.firstName,
    lastName: userStore.lastName,
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

  const onEdit = async () => {
    setLoading(true);
    try {
      const response = await editService(data);
      setLoading(false);

      if (response.success) {
        setMessage(response.message || 'Profile updated successfully');  
        userStore.setFirstName(data.firstName);
        userStore.setLastName(data.lastName);
        setAlert(true);
        navigation.navigate('Profile');
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
          <Text
            style={styles.description}
          >
            Edit Your Profile
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
        <View
        style={styles.testContainer}
      >
        <Button isLoading={loading} onPress={onEdit}>
          Save changes
        </Button>
      </View>
        
      </VStack>
    </Box>
  );
};



export default EditProfile;
