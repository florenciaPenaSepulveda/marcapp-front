import { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Box } from 'native-base';
import { Button, Text } from 'react-native-elements';
import 'text-encoding-polyfill';
import useUserStore from '../stores/useStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import marcajeService from '../services/marcaje.service';


const Home = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { firstName } = useUserStore();
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
      }
    } catch (error) {
      console.log("Ocurrió un problema")
      setLoading(false);
    }
  }

  const goProfile = () => {
    navigation.navigate("Profile");
  }

  useEffect(() => {
  }, []);

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
        <Button title="Add Time Registration" onPress={getMarcaje} loading={loading}/>
      </View>
      {(marcaje.id != 0 ) && (marcaje.date != '' ) && (marcaje.id_user != 0) && (
        <View style={{ marginTop: 20}}>
          <Text>Último Marcaje Creado</Text>
          <Text>ID Marcaje: {marcaje.id} </Text>
          <Text>Fecha: {marcaje.date} </Text>
        </View>
      ) }
    </Box>
  );
};

export default Home;
