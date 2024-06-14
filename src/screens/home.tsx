// Importar useState
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
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
import styles from '../styles/home.styles';

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
  }, []);

  return (
    <Box
      style={styles.background}
    >
      <Text
        style={styles.description}
      >
        Nice to see you again on MarcApp, {firstName}!
      </Text>
      <View style={styles.buttonsContainer}>
        <Button
        title="View Profile"
        onPress={goProfile}
        loading={loading}
        buttonStyle={styles.button}
        containerStyle={[styles.buttonContainer, { top: 150, left: 20 }]}
        titleStyle={styles.buttonTitle}/>

        <Button 
        title="Add Time Registration"
        onPress={goTimeRegistration}
        loading={loading}
        buttonStyle={styles.button}
        containerStyle={[styles.buttonContainer, { top: 150, left: 190 }]}
        titleStyle={styles.buttonTitle}/>

        <Button 
        title="Search worker" 
        onPress={goSearchWorker} 
        loading={loading}
        buttonStyle={styles.button}
        containerStyle={[styles.buttonContainer, { top: 300, left: 105 }]}
        titleStyle={styles.buttonTitle}
        />
      </View>
    </Box>
  );
};

export default Home;
