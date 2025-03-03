import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from 'assets/colors';
import Fonts from 'assets/fonts/fonts';
import Button from 'components/Button';
import FontText from 'components/FontText';
import Header from 'components/header';
import { PREFERENCE, ROUTE_NAMES } from 'constants/index';
import { hp, normalize, wp } from 'helpers/styles/responsive';
import moment from 'moment';
import { resetNavigateTo } from 'navigation/navigationHelper';
import { useLoader } from 'providers/LoaderProvider';
import React, { useState, useRef } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import authServices from 'services/authServices';

const VerifyPINScreen = ({ navigation, route }) => {
  const inputRefs = Array(6)
    .fill()
    .map(() => useRef(null)); // Create refs for OTP inputs
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const { startLoader, stopLoader } = useLoader();
  const { session } = route.params;

  const handleChangeText = (text, index) => {
    if (text.length === 1) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Move to next input if available
      if (index < 5) {
        inputRefs[index + 1].current.focus();
      }
    }
  };

  const handleKeyPress = (event, index) => {
    const { key } = event.nativeEvent;

    if (key === 'Backspace') {
      if (otp[index] === '') {
        if (index > 0) {
          inputRefs[index - 1].current.focus();
        }
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const verifyOTP = async () => {
    try {
      if (otp.join('').length === 6) {
        startLoader();
        Keyboard.dismiss();
        const params = {
          registeration_session_id: session,
          pin: otp.join(''),
          tablet_metadata: {
            os: 'Android',
            version: DeviceInfo.getSystemVersion(),
            model: DeviceInfo.getModel(),
          },
        };
        const response = await authServices.doTabletRegister(params);
        if (response.status === true) {
          await AsyncStorage.setItem(PREFERENCE.IS_TABLET_LOGGED_IN, 'true');
          await AsyncStorage.setItem(
            PREFERENCE.TABLET_SESSION,
            response.data.token,
          );
          resetNavigateTo(navigation, ROUTE_NAMES.USER_LOGIN);
        } else {
          Alert.alert(response.message);
        }
      } else {
        Alert.alert('Please enter a valid OTP');
      }
    } catch (e) {
      Alert.alert(e.message);
      console.log(e);
    } finally {
      stopLoader();
    }
  };

  return (
    <>
      <Header
        hasLeft
        title={'Verify PIN for your Tablet'}
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        
        {/* Wrap everything in TouchableWithoutFeedback to dismiss keyboard */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <FontText
              pTop={wp(20)}
              color={colors.black}
              size={normalize(20)}>{`Session ID : ${session}`}</FontText>

            {/* OTP Inputs */}
            <View style={styles.otpContainer}>
              <FontText
                size={normalize(15)}
                color={colors.black_222222}
                fontFamily={Fonts.robotBold}
                pTop={wp(4)}
                style={{ alignSelf: 'center' }}
                pRight={wp(8)}
                pBottom={hp(4)}>
                {'PIN'}
              </FontText>
              {otp.map((value, index) => (
                <TextInput
                  key={index}
                  ref={inputRefs[index]}
                  style={[
                    styles.otpInput,
                    {
                      borderColor:
                        focusedIndex === index
                          ? '#754FFF'
                          : otp[index] !== ''
                          ? colors.primary
                          : '#888',
                    },
                  ]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={value}
                  onChangeText={text => handleChangeText(text, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(null)}
                />
              ))}
            </View>

            <Button
              onPress={verifyOTP}
              style={{
                width: '92%',
                marginTop: 'auto',
                marginHorizontal: wp(20),
                marginBottom: wp(20),
              }}>
              <FontText
                fontFamily={Fonts.robotRegular}
                size={normalize(16)}
                color={colors.white}>
                {'Authenticate'}
              </FontText>
            </Button>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  otpInput: {
    width: normalize(48),
    height: normalize(48),
    borderWidth: 1,
    borderRadius: 5,
    textAlign: 'center',
    backgroundColor: colors.white,
    fontSize: 18,
    marginHorizontal: 5,
  },
});

export default VerifyPINScreen;
