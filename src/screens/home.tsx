import { View } from 'react-native';
import { Box } from 'native-base';
import { Button, Text } from 'react-native-elements';
import useUserStore from '../stores/useStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import { cerrarSesion } from '../session';
import styles from '../styles/home.styles';

type Destino = 'Profile' | 'TimeRegistration' | 'SearchWorker' | 'ViewGraphics';

const Home = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const firstName = useUserStore((state) => state.firstName);
  const role = useUserStore((state) => state.role);

  const opcion = (titulo: string, destino: Destino) => (
    <Button
      key={destino}
      title={titulo}
      onPress={() => navigation.navigate(destino)}
      buttonStyle={styles.button}
      containerStyle={styles.buttonContainer}
      titleStyle={styles.buttonTitle}
    />
  );

  return (
    <Box style={styles.background}>
      <Text style={styles.description}>
        Nice to see you again on MarcApp, {firstName}!
      </Text>
      <View style={styles.buttonsContainer}>
        {opcion('View Profile', 'Profile')}
        {opcion('Add Time Registration', 'TimeRegistration')}
        {role === 'admin' && opcion('Search worker', 'SearchWorker')}
        {role === 'admin' && opcion('View Graphics', 'ViewGraphics')}
      </View>
      <Button
        title="Log out"
        type="outline"
        onPress={cerrarSesion}
        containerStyle={styles.logout}
      />
    </Box>
  );
};

export default Home;
