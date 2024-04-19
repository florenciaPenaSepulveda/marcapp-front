import { Box } from 'native-base';
import useStore from '../stores/useStore';

const Home = () => {
  const { email } = useStore();
  return (
    <Box
      style={{
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
        marginHorizontal: '7%',
        marginVertical: '10%',
      }}
    >
      Hello world! {email}
    </Box>
  );
};

export default Home;
