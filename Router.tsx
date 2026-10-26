import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
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
import { colors } from './src/theme';

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

const tema = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.background, primary: colors.primary },
};

const opcionesBase: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.primary,
  headerTitleStyle: { color: colors.text, fontWeight: '700' },
  headerShadowVisible: false,
  headerBackTitleVisible: false,
  contentStyle: { backgroundColor: colors.background },
  animation: 'slide_from_right',
};

const RouterProvider = () => (
  <NavigationContainer ref={navigationRef} theme={tema}>
    <Stack.Navigator initialRouteName="Loading" screenOptions={opcionesBase}>
      <Stack.Screen name="Loading" component={Loading} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={Register} options={{ title: 'Create account' }} />
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ title: 'MarcApp', headerBackVisible: false, gestureEnabled: false }}
      />
      <Stack.Screen name="TimeRegistration" component={TimeRegistration} options={{ title: 'Time registration' }} />
      <Stack.Screen name="WeeklySummary" component={WeeklySummary} options={{ title: 'Weekly summary' }} />
      <Stack.Screen name="Profile" component={Profile} options={{ title: 'My profile' }} />
      <Stack.Screen name="EditProfile" component={EditProfile} options={{ title: 'Edit profile' }} />
      <Stack.Screen name="SearchWorker" component={SearchWorker} options={{ title: 'Workers' }} />
      <Stack.Screen name="ViewGraphics" component={ViewGraphics} options={{ title: 'Statistics' }} />
      <Stack.Screen
        name="EditTimeRegistration"
        component={EditTimeRegistration}
        options={{ title: 'Edit registration' }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

export default RouterProvider;
