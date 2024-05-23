import { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Box } from 'native-base';
import { Button, Text } from 'react-native-elements';
import 'text-encoding-polyfill';
import useUserStore from '../stores/useStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import profileService from '../services/profile.service';
import { useStore } from 'zustand';


const Profile = () => {
    const userStore = useUserStore();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    useEffect(() => {
        const getUser = async () => {
            try {
                const profile = await profileService();
                if(!profile?.success) {
                    console.log("Fallo");
                }
            } catch (error) {
                console.log(error);
            }
        };
        getUser();
    }, [])

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
            {userStore.firstName} {userStore.lastName}
            Correo: {userStore.email}
            Cumpleaños: {userStore.birthday}
            </Text>
        <View
            style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 16, // Ajusta este valor para cambiar el espacio entre los botones
            }}
        >
        </View>
        </Box>
    );
}

export default Profile;