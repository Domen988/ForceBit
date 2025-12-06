import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import 'react-native-get-random-values';

import HomeScreen from './src/screens/HomeScreen';
import MaxTestScreen from './src/screens/MaxTestScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import TrainingScreen from './src/screens/TrainingScreen'; // NEW

LogBox.ignoreLogs(['Expo AV has been deprecated']);

export type RootStackParamList = {
  Home: undefined;
  MaxTestScreen: { setupId: string; contextName: string };
  HistoryScreen: { setupId: string; title: string };
  TrainingScreen: { setupId: string; contextName: string }; // NEW
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#111111',
    card: '#222222',
    text: '#ffffff',
    primary: '#00D1FF',
  },
};

const globalScreenOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: '#111' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
  headerBackTitle: "",
  headerBackVisible: true,
};

export default function App() {
  return (
    <NavigationContainer theme={AppTheme}>
      <StatusBar barStyle="light-content" backgroundColor="#111" />
      <Stack.Navigator initialRouteName="Home" screenOptions={globalScreenOptions}>
        
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'ForceBit Configurations' }} />
        
        <Stack.Screen name="TrainingScreen" component={TrainingScreen} options={{ title: 'Train' }} />

        <Stack.Screen name="MaxTestScreen" component={MaxTestScreen} options={{ headerShown: false }} />

        <Stack.Screen name="HistoryScreen" component={HistoryScreen} options={({ route }) => ({ title: route.params.title })} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}