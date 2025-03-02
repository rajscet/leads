import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import colors from 'assets/colors';
import Fonts from 'assets/fonts/fonts';
import FontText from 'components/FontText';
import {PREFERENCE, ROUTE_NAMES} from 'constants/index';
import {normalize, wp} from 'helpers/styles/responsive';
import {resetNavigate} from 'navigation/navigationHelper';
import {useSafeArea} from 'providers/SafeAreaViewProvider';
import React from 'react';
import {StyleSheet, View} from 'react-native';

export default function SplashScreen() {
  const {setShowStatusBar} = useSafeArea();
  const [isConnected, setIsConnected] = React.useState(undefined);

  const gotToNext = async () => {
    const isUserLoggedIn = await AsyncStorage.getItem(
      PREFERENCE.IS_USER_LOGGED_IN,
    );

    const user = JSON.parse(await AsyncStorage.getItem(PREFERENCE.USER));
    const isTabletLoggedIn = await AsyncStorage.getItem(
      PREFERENCE.IS_TABLET_LOGGED_IN,
    );

    if (!isTabletLoggedIn || isTabletLoggedIn === 'false') {
      resetNavigate(ROUTE_NAMES.AUTH_STACK);
    } else if (!isUserLoggedIn || isUserLoggedIn === 'false') {
      if (isConnected === false && user && user?.role) {
        resetNavigate(ROUTE_NAMES.HOME, {user});
      } else {
        resetNavigate(ROUTE_NAMES.USER_LOGIN);
      }
    } else {
      resetNavigate(ROUTE_NAMES.HOME, {user});
    }
  };

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    setTimeout(() => {
      gotToNext();
    }, 2000);
    return () => {
      setShowStatusBar(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      {/* <Image source={LocalImages.appLogo} style={styles.logoStyle} /> */}
      <FontText
        fontFamily={Fonts.robotBold}
        size={normalize(92)}
        color={colors.primary}>
        {'Leads'}
      </FontText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoStyle: {
    width: wp(200),
    height: wp(200),
    resizeMode: 'contain',
  },
  marketingLogo: {
    width: '100%', // Adjust as per your image size
    height: wp(425),
  },
  textLogoStyle: {
    width: wp(200),
    height: wp(200),
    resizeMode: 'contain',
  },
});
