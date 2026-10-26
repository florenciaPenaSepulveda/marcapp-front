import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RouterProvider from './Router';
import { colors } from './src/theme';

const App = () => (
  <SafeAreaProvider>
    <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
    <RouterProvider />
  </SafeAreaProvider>
);

export default App;
