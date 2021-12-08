import React, { useState, useContext, useEffect, useRef } from 'react';
import { DefaultTheme, NavigationContainer, DarkTheme } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';

import { AuthStack } from './AuthStack';
import { AppStack, OnboardStack, PartyStack } from './AppStack';
import { AuthenticatedUserContext } from '../providers';
import { LoadingIndicator } from '../components';
import { auth } from '../config';
import { Alert, useColorScheme } from 'react-native';
import { useAtParty } from '../hooks';
import { useUserData } from '../hooks/useUserData';
import { requestPermissionsAsync, setTestDeviceIDAsync } from 'expo-ads-admob';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { updateUserData } from '../config/firebase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});


export const RootNavigator = () => {
  const { user, setUser } = useContext(AuthenticatedUserContext);
  const scheme = useColorScheme()
  const [isLoading, setIsLoading] = useState(true);
  const atParty = useAtParty()
  const [loaded, userData, filled] = useUserData()

  useEffect(() => {
    // onAuthStateChanged returns an unsubscriber
    const unsubscribeAuthStateChanged = onAuthStateChanged(
      auth,
      authenticatedUser => {
        authenticatedUser ? setUser(authenticatedUser) : setUser(null);
        if (authenticatedUser) requestPermissionsAsync()
        setIsLoading(false);
      }
    );

    // unsubscribe auth listener on unmount
    return unsubscribeAuthStateChanged;
  }, [user]);

  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    if (userData) {
      registerForPushNotificationsAsync().then(token => token ? updateUserData(userData, {pushToken: token}) : {});

      // This listener is fired whenever a notification is received while the app is foregrounded
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        Alert.alert(notification.request.content.title, notification.request.content.body)
      });

      // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response);
      });

      return () => {
        Notifications.removeNotificationSubscription(notificationListener.current);
        Notifications.removeNotificationSubscription(responseListener.current);
      };
    }
  }, [loaded]);

  useEffect(() => {
    if (atParty) {
      return <PartyStack />
    }
  }, [atParty])

  useEffect(() => {
    console.log(`loaded ${loaded} userData ${userData}`)
  }, [loaded, userData])


  if (isLoading || !loaded) {
    return <LoadingIndicator />;
  }

  const theme = {
    dark: true,
    colors: {
      ...DefaultTheme.colors,
      primary: "rgb(10, 132, 255)",
      primaryTransparent: "rgba(10, 132, 255, 0.8)",
      background: "rgb(28, 28, 30)",
      card: "rgb(28, 28, 30)",
      text: "#fff",
      border: "rgb(229, 229, 234)",
      warning: "rgb(255, 159, 20)",
      warningTransparent: "rgba(255, 159, 20, 0.8)",
      error: "rgb(255, 69, 58)",
      errorTransparent: "rgba(255, 69, 58, 0.8)",
      success: "rgb(48, 209, 88)",
      successTransparent: "rgba(48, 209, 88, 0.8)",
      info: "rgb(191, 90, 242)",
      infoTransparent: "rgba(191, 90, 242, 0.8)"
    }
  }

  //scheme === 'dark' ? DarkTheme : DefaultTheme
  console.log(`${user} ${loaded} ${filled}`)
  
  if (user && loaded && !filled) {
    return (<NavigationContainer theme={theme}>
      <OnboardStack />
    </NavigationContainer>)
  } else if (loaded) {
    return (
      <NavigationContainer theme={theme}>
        {user ? <AppStack /> : <AuthStack />}
      </NavigationContainer>
    );
  }
  
};

async function registerForPushNotificationsAsync() {
  let token;
  console.log("getting notifications")
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      //alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    //alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}
