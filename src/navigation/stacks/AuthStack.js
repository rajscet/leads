import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {ROUTE_NAMES} from 'constants/index';
import VerifyPINScreen from 'screens/auth/verifyPIN/VerifyPINScreen';
import AppLoginScreen from 'screens/auth/appLogin/AppLoginScreen';




const Stack = createStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator detachInactiveScreens={false} initialRouteName={ROUTE_NAMES.APP_LOGIN} screenOptions={{headerShown: false}}>
      <Stack.Screen name={ROUTE_NAMES.APP_LOGIN} component={AppLoginScreen} />
      <Stack.Screen name={ROUTE_NAMES.VERIFY_PIN_SCREEN} component={VerifyPINScreen} />
    </Stack.Navigator>
  );
}

export default AuthStack;
