import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './navigation/RootNavigator';
import { AuthenticatedUserProvider } from './providers';

const App = () => {
  return (
    <View style={[StyleSheet.absoluteFill, {backgroundColor: "rgb(28, 28, 30)"}]}>
      <StatusBar barStyle="light-content"/>
    <AuthenticatedUserProvider>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </AuthenticatedUserProvider>
    </View>
  );
};

export default App;
