import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Center, Input, Text, VStack, AlertDialog } from 'native-base';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import { Header } from 'react-native-elements';
import { View } from 'react-native';
import editTimeRegistrationService from "../services/editTimeRegistration.service";
import timeRegistrationStore from '../stores/timeRegistrationStore';
import styles from '../styles/editTimeRegistration.styles';
import moment from 'moment';

type FormDataT = {
  date: string;
  adminFlag: boolean;
};

const EditTimeRegistration = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { id, date, type } = route.params as { id: number; date: string; type: string };

  const [data, setData] = useState<FormDataT>({ date, adminFlag: true });
  const [alert, setAlert] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const cancelRef = useRef(null);

  const setValue = (key: keyof FormDataT, value: string | boolean) => {
    setData((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const onEdit = async () => {
    if (!data.date) {
      setMessage('Please, complete this field.');
      setAlert(true);
      return;
    }

    if (!moment(data.date, 'DD-MM-YYYY HH:mm:ss', true).isValid()) {
      setMessage(`Invalid date format: ${data.date}`);
      setAlert(true);
      return;
    }
    
    setLoading(true);
    try {
      const response = await editTimeRegistrationService(id, data);

      setLoading(false);
      
      if (response.success) {
        setMessage(response.message || 'Time Registration updated successfully!');
        setAlert(true);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setLoading(false);
      setMessage('Exit time cannot be before entry time. Please try again.');
      setAlert(true);
    }
  };

  return (
    <Box style={styles.container}>
      <Header
        centerComponent={{
          text: 'Edit time registration',
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
            Edit this {type} time registration date
          </Text>
        </Center>
        <Center>
          <Input
            style={styles.input}
            size="l"
            variant="outline"
            placeholder="Format: DD-MM-YYYY HH:mm:ss"
            value={data.date}
            onChange={(e) => setValue('date', e.nativeEvent.text)}
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