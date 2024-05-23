import { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Box } from 'native-base';
import { Button, Text } from 'react-native-elements';
import 'text-encoding-polyfill';
import useUserStore from '../stores/useStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import marcajeService from '../services/marcaje.service';

const TimeRegistration = () => { 
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { email } = useUserStore();
    const [ marcaje, setmarcaje ] = useState({ date: '', id: 0, id_user: 0});

  const getMarcaje = async () => {
    try {
      setLoading(true);
      const marcaje = await marcajeService();
      console.log("Despues de marcaje Service en home")
      if(marcaje?.success) {
        console.log(marcaje.data)
        setmarcaje(marcaje.data);
        setLoading(false);
        navigation.navigate("Marcaje", {marcaje: marcaje.data});
      }
    } catch (error) {
      console.log("Ocurrió un problema")
      setLoading(false);
    }
  }
    const [loading, setLoading] = useState<boolean>(false);
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
            This is the time registration
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
            <Button title="View Profile" loading={loading} />
            <Button title="Add Time Registration" loading={loading} />
        </View>
        </Box>
    );
    }

export default TimeRegistration;