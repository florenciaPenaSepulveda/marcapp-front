import { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Box } from 'native-base';
import { Button, Text } from 'react-native-elements';
import 'text-encoding-polyfill';
import useStore from '../stores/useStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';

const Home = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { email } = useStore();
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
        Nice to see you again, {email}!
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
        <Button title="View Profile" loading={loading} />
        <Button title="Add Time Registration" loading={loading} />
      </View>
    </Box>
  );
};

export default Home;
