import { NavigationContainer } from '@react-navigation/native';
import Loading from './src/screens/loading';
import Login from './src/screens/login';
import Register from './src/screens/register';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './src/screens/home';
import TimeRegistration from './src/screens/marcaje';
import Profile from './src/screens/profile';

const Stack = createNativeStackNavigator<RootStackParamList>();

export type RootStackParamList = {
  Loading: Record<string, string> | undefined;
  Home: Record<string, string> | undefined;
  Register: Record<string, string> | undefined;
  Login: Record<string, string> | undefined;
  Profile: Record<string, string> | undefined;
  Marcaje: { marcaje?: { date: string; id: number; id_user: number } } | undefined;

};

const RouterProvider = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Loading">
        <Stack.Screen
          options={{ headerShown: false }}
          name="Loading"
          component={Loading}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="Login"
          component={Login}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="Register"
          component={Register}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="Marcaje"
          component={TimeRegistration}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="Profile"
          component={Profile}
        />
        <Stack.Screen name="Home" component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RouterProvider;
