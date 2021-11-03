import React, { useState, useContext, useEffect } from 'react';
import { DefaultTheme, NavigationContainer, DarkTheme } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';

import { AuthStack } from './AuthStack';
import { AppStack, PartyStack } from './AppStack';
import { AuthenticatedUserContext } from '../providers';
import { LoadingIndicator } from '../components';
import { auth } from '../config';
import { useColorScheme } from 'react-native';
import { useAtParty } from '../hooks';


export const RootNavigator = () => {
  const { user, setUser } = useContext(AuthenticatedUserContext);
  const scheme = useColorScheme()
  const [isLoading, setIsLoading] = useState(true);
  const atParty = useAtParty()


  useEffect(() => {
    // onAuthStateChanged returns an unsubscriber
    const unsubscribeAuthStateChanged = onAuthStateChanged(
      auth,
      authenticatedUser => {
        authenticatedUser ? setUser(authenticatedUser) : setUser(null);
        setIsLoading(false);
      }
    );

    // unsubscribe auth listener on unmount
    return unsubscribeAuthStateChanged;
  }, [user]);

  useEffect(() => {
    if (atParty) {
      return <PartyStack />
    }
  }, [atParty])


  if (isLoading) {
    return <LoadingIndicator />;
  }

  const theme = {
    dark: true,
    colors: {
      ...DefaultTheme.colors,
      primary: "rgb(10, 132, 255)",
      background: "rgb(28, 28, 30)",
      card: "rgb(28, 28, 30)",
      text: "#fff",
      border: "rgb(229, 229, 234)",
      warning: "rgb(255, 159, 20)",
      error: "rgb(255, 69, 58)",
      success: "rgb(48, 209, 88)",
      info: "rgb(191, 90, 242)"
    }
  }

  //scheme === 'dark' ? DarkTheme : DefaultTheme

  return (
    <NavigationContainer theme={theme}>
      {user ? atParty ? <PartyStack /> : <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
