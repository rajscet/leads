import colors from 'assets/colors';
import Fonts from 'assets/fonts/fonts';
import Button from 'components/Button';
import FontText from 'components/FontText';
import Header from 'components/header';
import {ENV, ROUTE_NAMES} from 'constants/index';
import {hp, normalize, wp} from 'helpers/styles/responsive';
import React, {useState} from 'react';
import {PermissionsAndroid, Platform, StyleSheet, View} from 'react-native';
import {Camera, CameraType} from 'react-native-camera-kit';
import DeviceInfo from 'react-native-device-info';

const AppLoginScreen = ({navigation}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  const hasAndroidCameraPermission = async () => {
    const cameraPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    return (
      cameraPermission !== PermissionsAndroid.RESULTS.BLOCKED &&
      cameraPermission !== PermissionsAndroid.RESULTS.DENIED
    );
  };

  React.useEffect(() => {
    (async () => {
      setShouldLoad(
        Platform.OS !== 'android' || (await hasAndroidCameraPermission()),
      );
      // setTimeout(() => {
      //   navigation.navigate(ROUTE_NAMES.VERIFY_PIN_SCREEN, {
      //     session: '1dbaf62b-035b-416b-84c9-df087bb82719',
      //   });
      // });
    })();
  }, []);

  const onBarcodeScan = scanResult => {
    setIsScanning(false); // Stop scanning
    navigation.navigate(ROUTE_NAMES.VERIFY_PIN_SCREEN, {
      session: scanResult?.nativeEvent?.codeStringValue,
    });
  };

  if (!shouldLoad) {
    return <Header hasLeft={false} title={'Register Tablet'} />;
  }

  return (
    <>
      <Header hasLeft={false} title={'Register Tablet'} />
      <View style={styles.container}>
        {isScanning && (
          <Camera
            scanBarcode={true}
            cameraType={'back'}
            onReadCode={onBarcodeScan} // optional
            showFrame={true} // (default false) optional, show frame with transparent layer (qr code or barcode will be read on this area ONLY), start animation for scanner, that stops when a code has been found. Frame always at center of the screen
            laserColor="red" // (default red) optional, color of laser in scanner frame
            frameColor="white" // (default white) optional, color of border of scanner frame
            style={styles.scanner}
          />
        )}
        {!isScanning && (
          <Button
            onPress={() => {
              setIsScanning(true);
            }}
            style={{marginTop: hp(19)}}>
            <FontText
              fontFamily={Fonts.robotRegular}
              size={normalize(16)}
              color={colors.white}>
              {'SCAN QR Code'}
            </FontText>
          </Button>
        )}
        <FontText
          pBottom={wp(20)}
          pTop={wp(50)}
          style={{textAlign: 'center'}}
          fontFamily={Fonts.robotRegular}
          size={normalize(16)}
          color={colors.black}>
          {`Version : ${DeviceInfo.getVersion()}\n Environment: ${ENV}`}
        </FontText>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: wp(24),
    justifyContent: 'center',
  },
  resultText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: 'green',
  },
  scanner: {
    flex: 1, // Ensure the scanner fills the screen
  },
});

export default AppLoginScreen;
