import { Box } from 'native-base';
import useStore from '../stores/useStore';

const Home = () => {
  const { user } = useStore();
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
      Hello world! {user}
    </Box>
  );
};

export default Home;
