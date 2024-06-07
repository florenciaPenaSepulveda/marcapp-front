// Importar useState
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Box } from 'native-base';
import { Button, Text } from 'react-native-elements';
import 'text-encoding-polyfill';
import useUserStore from '../stores/useStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import timeRegistrationService from '../services/timeRegistration.service';
import searchWorkerService from '../services/searchWorker.service'

const Home = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const firstName = useUserStore.getState().firstName;

  const goProfile = () => {
    navigation.navigate("Profile");
  }

  const goTimeRegistration = () => {
    navigation.navigate("TimeRegistration");
  }

  const goSearchWorker = () => {
    navigation.navigate("SearchWorker");
  }

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Aquí puedes realizar cualquier operación de carga inicial si es necesario
  }, []);

  return (
    <Box
      style={{
        flex: 1,
        alignContent: 'center',
        justifyContent: 'flex-start',
        backgroundColor: 'white',
        paddingHorizontal: '10%',
        paddingVertical: '5%'
      }}
    >
      <Text
        style={{
          fontSize: 24,
          textAlign: 'center',
          fontWeight: '700',
          marginVertical: '10%',
        }}
      >
        Nice to see you again, {firstName}!
      </Text>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          gap: 16,
        }}
      >
        <Button title="View Profile" onPress={goProfile} loading={loading}/>
        <Button title="Add Time Registration" onPress={goTimeRegistration} loading={loading}/>
        <Button title="Search worker" onPress={goSearchWorker} loading={loading}/>
      </View>
    </Box>
  );
};

export default Home;
