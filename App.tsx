import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NativeBaseProvider } from 'native-base';
import { ThemeProvider } from 'react-native-elements';
import RouterProvider from './Router';

const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NativeBaseProvider>
          <RouterProvider />
        </NativeBaseProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
