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

const Profile = () => {
    const userStore = useUserStore.getState();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const birthday = new Date(userStore.birthday);

    const generateRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      };     
 
  const goEdit = () => {
    navigation.navigate("EditProfile");
  }

  const goHome = () => {
    navigation.navigate("Home");
  }
  
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
        <Button title = "Go Home" onPress={goHome} loading = {loading} />
            <View
                style={{
                flexDirection: 'column',
                alignContent: 'center',
                justifyContent: 'center',
                top: '30%',
                }}
            ></View>
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
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '10%',
    marginBottom: '10%',
  },
  initial: {
    color: 'white',
    fontSize: 50,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: '5%',
  },
  info: {
    fontSize: 18,
    textAlign: 'left',
    marginBottom: '5%',
  },
});

export default Profile;