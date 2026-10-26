import { View } from 'react-native';
import { Box } from 'native-base';
import { Button, Header, Text } from 'react-native-elements';
import moment from 'moment';
import useUserStore from '../stores/useStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import { colorDeAvatar, inicial } from '../lib/avatar';
import styles from '../styles/profile.styles';

const Profile = () => {
  const firstName = useUserStore((state) => state.firstName);
  const lastName = useUserStore((state) => state.lastName);
  const email = useUserStore((state) => state.email);
  const birthday = useUserStore((state) => state.birthday);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Box style={styles.container}>
      <Header
        centerComponent={{
          text: 'Profile info',
          style: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
        }}
        containerStyle={{
          backgroundColor: '#0AA5F2',
          justifyContent: 'space-around',
        }}
      />
      <View
        style={[
          styles.profilePicture,
          { backgroundColor: colorDeAvatar(firstName) },
        ]}
      >
        <Text style={styles.initial}>{inicial(firstName)}</Text>
      </View>
      <Text style={styles.name}>
        {firstName} {lastName}
      </Text>
      <Text style={styles.info}>Email: {email}</Text>
      <Text style={styles.info}>
        Birthday: {moment(birthday, 'YYYY-MM-DD').format('DD MMMM YYYY')}
      </Text>
      <Button
        title="Edit Profile"
        onPress={() => navigation.navigate('EditProfile')}
      />
    </Box>
  );
};

export default Profile;
