import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {ROUTE_NAMES} from 'constants/index';
import {setTopLevelNavigation} from 'navigation/navigationHelper';
import AuthStack from 'navigation/stacks/AuthStack';
import React from 'react';
import UserLogin from 'screens/auth/userLogin/UserLogin';
import Home from 'screens/home/Home';
import LeadDetailScreen from 'screens/home/leadDetail/LeadDetailScreen';
import SplashScreen from 'screens/splash/SplashScreen';





const Stack = createStackNavigator();

function Navigation() {
  return (
    <NavigationContainer independent ref={(ref) => setTopLevelNavigation(ref)}>
      <Stack.Navigator detachInactiveScreens={false} initialRouteName={ROUTE_NAMES.SPLASH} screenOptions={{headerShown: false}}>
        <Stack.Screen name={ROUTE_NAMES.SPLASH} component={SplashScreen} />
        <Stack.Screen name={ROUTE_NAMES.AUTH_STACK} component={AuthStack} />
        <Stack.Screen name={ROUTE_NAMES.HOME} component={Home} />
        <Stack.Screen name={ROUTE_NAMES.USER_LOGIN} component={UserLogin} />
        <Stack.Screen name={ROUTE_NAMES.LEAD_DETAIL} component={LeadDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigation;
