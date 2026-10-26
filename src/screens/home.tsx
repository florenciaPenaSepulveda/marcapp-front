import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Box } from 'native-base';
import { Button, Text } from 'react-native-elements';
import 'text-encoding-polyfill';
import useUserStore from '../stores/useStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import styles from '../styles/home.styles';

const Home = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { firstName, role, setFirstName, setLastName } = useUserStore((state) => ({
    firstName: state.firstName,
    role: state.role,
    setFirstName: state.setFirstName,
    setLastName: state.setLastName,
  }));

  const goProfile = () => {
    navigation.navigate("Profile");
  }

  const goTimeRegistration = () => {
    console.log('Go Time Registration');
    navigation.navigate("TimeRegistration");
  }

  const goSearchWorker = () => {
    console.log('Go Search Worker');
    navigation.navigate("SearchWorker");
  }

  const goViewGraphics = () => {
    console.log('Go View Graphics');
    navigation.navigate("ViewGraphics");
  }

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Cualquier lógica que necesites para cuando se actualiza el estado
  }, [firstName, role]);

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
          containerStyle={[styles.buttonContainer, { top: 150, left: 50 }]}
          titleStyle={styles.buttonTitle}
        />

        <Button 
          title="Add Time Registration"
          onPress={goTimeRegistration}
          loading={loading}
          buttonStyle={styles.button}
          containerStyle={[styles.buttonContainer, { top: 150, right: 50 }]}
          titleStyle={styles.buttonTitle}
        />

        {role === 'admin' && (
          <>
            <Button 
              title="Search worker" 
              onPress={goSearchWorker} 
              loading={loading}
              buttonStyle={styles.button}
              containerStyle={[styles.buttonContainer, { top: 300, left: 50 }]}
              titleStyle={styles.buttonTitle}
            />
            <Button 
              title="View Graphics" 
              onPress={goViewGraphics} 
              loading={loading}
              buttonStyle={styles.button}
              containerStyle={[styles.buttonContainer, { top: 300, right: 50 }]}
              titleStyle={styles.buttonTitle}
            />
          </>
        )}
      </View>
    </Box>
  );
};

export default Home;
