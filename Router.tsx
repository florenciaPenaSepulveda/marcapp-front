import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Loading from './src/screens/loading';
import Login from './src/screens/login';
import Register from './src/screens/register';
import Home from './src/screens/home';
import TimeRegistration from './src/screens/timeRegistration';
import Profile from './src/screens/profile';
import EditProfile from './src/screens/editProfile';
import WeeklySummary from './src/screens/weeklySummary';
import SearchWorker from './src/screens/searchWorker';
import ViewGraphics from './src/screens/viewGraphics';
import EditTimeRegistration from './src/screens/editTimeRegistration';
import { navigationRef } from './src/navigation';

export type RootStackParamList = {
  Loading: undefined;
  Home: undefined;
  Register: undefined;
  Login: undefined;
  Profile: undefined;
  TimeRegistration: undefined;
  EditProfile: undefined;
  WeeklySummary: undefined;
  SearchWorker: undefined;
  ViewGraphics: undefined;
  EditTimeRegistration: { id: string; date: string; type: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const sinEncabezado = { headerShown: false };

const RouterProvider = () => (
  <NavigationContainer ref={navigationRef}>
    <Stack.Navigator initialRouteName="Loading">
      <Stack.Screen name="Loading" component={Loading} options={sinEncabezado} />
      <Stack.Screen name="Login" component={Login} options={sinEncabezado} />
      <Stack.Screen
        name="TimeRegistration"
        component={TimeRegistration}
        options={sinEncabezado}
      />
      <Stack.Screen name="Profile" component={Profile} options={sinEncabezado} />
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={sinEncabezado}
      />
      <Stack.Screen
        name="WeeklySummary"
        component={WeeklySummary}
        options={sinEncabezado}
      />
      <Stack.Screen
        name="SearchWorker"
        component={SearchWorker}
        options={sinEncabezado}
      />
      <Stack.Screen
        name="ViewGraphics"
        component={ViewGraphics}
        options={sinEncabezado}
      />
      <Stack.Screen
        name="EditTimeRegistration"
        component={EditTimeRegistration}
        options={sinEncabezado}
      />
      <Stack.Screen name="Home" component={Home} options={{ headerBackVisible: false, gestureEnabled: false }} />
      <Stack.Screen name="Register" component={Register} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default RouterProvider;
