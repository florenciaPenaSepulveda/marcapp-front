import { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Box } from 'native-base';
import { Button, Header, Text } from 'react-native-elements';
import 'text-encoding-polyfill';
import useUserStore from '../stores/useStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import profileService from '../services/profile.service';
import { useStore } from 'zustand';
import moment from 'moment';
import { StyleSheet } from 'react-native';
import styles from '../styles/profile.styles';

const Profile = () => {
  const userStore = useUserStore.getState();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const birthday = new Date(userStore.birthday);
 
  const goEdit = () => {
    navigation.navigate("EditProfile");
  }

  const goHome = () => {
    navigation.navigate("Home");
  }

  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  
  /*
  useEffect(() => {
    const getUser = async () => {
      try {
        const profile = await profileService();
        if (!profile?.success) {
          console.log('Fallo obtención del usuario');
        }
      } catch (error) {
        console.log(error);
      }
    };
    getUser();
  }, []);
  */

const renderProfilePicture = (name: string) => {
    const initial = name.charAt(0).toUpperCase();
    const backgroundColor = generateRandomColor();
    return (
      <View style={[styles.profilePicture, { backgroundColor }]}>
        <Text style={styles.initial}>{initial}</Text>
      </View>
    );
};

const [loading, setLoading] = useState<boolean>(false);
return (
    <Box style = {styles.container}>
        <Header
            centerComponent={{ text: 'Profile info', style: { color: '#fff',
            fontWeight: 'bold', fontSize: 20
            } }}
            containerStyle={{
                backgroundColor: '#0AA5F2',
                justifyContent: 'space-around',
            }}
        />
        {renderProfilePicture(userStore.firstName)}
        <Text style={styles.name}>{useUserStore.getState().firstName} {useUserStore.getState().lastName}</Text>
        <Text style={styles.info}>Email: {userStore.email}</Text>
        <Text style={styles.info}>
            Birthday: {birthday.getUTCDate().toString()} {moment.months(birthday.getUTCMonth())} {birthday.getFullYear().toString()}
        </Text>

        <Button title = "Edit Profile" onPress={goEdit} loading = {loading} />
            <View
                style={styles.button}
            ></View>
    </Box>
    
    );
};

export default Profile;