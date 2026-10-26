import React, { useRef, useState } from 'react';
import { Box, Button, Center, Input, Text, VStack, AlertDialog, Modal, HStack } from 'native-base';
import registerService from '../services/register.service';
import { useNavigation } from '@react-navigation/core';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import { Calendar } from 'react-native-calendars';
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
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const cancelRef = useRef(null);

  const setValue = (key: string, value: string) => {
    setData((prevState) => ({
      ...prevState,
      [key]: value,
    }));
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

  const onDayPress = (day: any) => {
    const selectedDate = new Date(day.dateString);
    selectedDate.setFullYear(selectedYear);
    setValue('birthday', selectedDate.toISOString().split('T')[0]);
    setShowCalendar(false);
  };

  const incrementYear = () => {
    const newYear = selectedYear + 1;
    setSelectedYear(newYear);
    setCurrentMonth(0);
  };

  const decrementYear = () => {
    const newYear = selectedYear - 1;
    setSelectedYear(newYear);
    setCurrentMonth(0);
  };

  const onMonthChange = (months: any) => {
    setCurrentMonth(months[0].month);
  };

  return (
    <Box style={styles.container}>
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
          <Text style={styles.description}>Please enter your information</Text>
        </Center>
        <Center>
          <Input
            style={styles.input}
            size="l"
            variant="outline"
            placeholder="First name"
            value={data?.firstName}
            onChange={(e) => setValue('firstName', e?.nativeEvent?.text as string)}
          />
        </Center>
        <Center>
          <Input
            style={styles.input}
            size="l"
            variant="outline"
            placeholder="Last name"
            value={data?.lastName}
            onChange={(e) => setValue('lastName', e?.nativeEvent?.text as string)}
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
            type="password"
            variant="outline"
            placeholder="Password"
            value={data?.pass}
            onChange={(e) => setValue('pass', e?.nativeEvent?.text as string)}
          />
        </Center>
        <Center>
          <Input
            style={styles.input}
            size="l"
            variant="outline"
            placeholder="Birthday (YYYY-MM-DD)"
            value={data?.birthday}
            onFocus={() => setShowCalendar(true)}
            onChange={(e) => setValue('birthday', e?.nativeEvent?.text as string)}
          />
        </Center>
        <Center>
          <Button isLoading={loading} onPress={onClickButton}>
            Create account
          </Button>
        </Center>
        <Center>
          <Text
            style={styles.login}
            onPress={() => navigation.navigate('Login')}
          >
            I already have an account
          </Text>
        </Center>
      </VStack>

      <Modal isOpen={showCalendar} onClose={() => setShowCalendar(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Select your birthday</Modal.Header>
          <Modal.Body>
            <HStack justifyContent="space-between" alignItems="center" mb={2}>
              <Button onPress={decrementYear}>-</Button>
              <Text fontSize="xl">{selectedYear}</Text>
              <Button onPress={incrementYear}>+</Button>
            </HStack>
            <Calendar
              firstDay={1}
              onDayPress={onDayPress}
              current={`${selectedYear}-${currentMonth < 10 ? `0${currentMonth}` : currentMonth}-01`}
              onVisibleMonthsChange={onMonthChange}
              monthFormat={'MMMM'}
            />
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </Box>
  );
};

export default Register;
