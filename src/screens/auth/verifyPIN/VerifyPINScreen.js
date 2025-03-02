import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from 'assets/colors';
import Fonts from 'assets/fonts/fonts';
import Button from 'components/Button';
import DatePicker from 'components/DatePicker';
import FontText from 'components/FontText';
import Header from 'components/header';
import {PREFERENCE, ROUTE_NAMES} from 'constants/index';
import {hp, normalize, wp} from 'helpers/styles/responsive';
import moment from 'moment';
import {resetNavigateTo} from 'navigation/navigationHelper';
import {useLoader} from 'providers/LoaderProvider';
import React, {useState} from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import authServices from 'services/authServices';

const VerifyPINScreen = ({navigation, route}) => {
  const inputRefs = Array(6)
    .fill()
    .map(() => React.useRef(null)); // Create refs for all 6 OTP inputs
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // Initial OTP state
  const [focusedIndex, setFocusedIndex] = useState(null); // To track which input is focused
  const {startLoader, stopLoader} = useLoader();
  const {session} = route.params;
  const endDateRef = React.useRef();

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
    const {key} = event.nativeEvent;

    if (key === 'Backspace') {
      // If Backspace is pressed
      if (otp[index] === '') {
        // Move to the previous input if current is already empty
        if (index > 0) {
          inputRefs[index - 1].current.focus();
        }
      } else {
        // Clear the current input on Backspace
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
        console.log(response);
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
        onBackPress={() => {navigation.goBack()}}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FontText
          pTop={wp(20)}
          color={colors.black}
          size={normalize(20)}>{`Session ID : ${session}`}</FontText>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {/* OTP Inputs */}
          <>
            <View style={styles.otpContainer}>
              <FontText
                size={normalize(15)}
                color={colors.black_222222}
                fontFamily={Fonts.robotBold}
                pTop={wp(4)}
                style={{alignSelf: 'center'}}
                pRight={wp(8)}
                pBottom={hp(4)}>
                {'PIN'}
              </FontText>
              {otp.map((value, index) => (
                <TextInput
                  key={index}
                  ref={inputRefs[index]} // Assign ref to each input
                  style={[
                    styles.otpInput,
                    {
                      borderColor:
                        focusedIndex === index
                          ? '#754FFF' // Focus color
                          : otp[index] !== ''
                          ? colors.primary // Color when digit is present
                          : '#888', // Default grey
                    },
                  ]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={value}
                  onChangeText={text => handleChangeText(text, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  onFocus={() => setFocusedIndex(index)} // Set focused index
                  onBlur={() => setFocusedIndex(null)} // Clear focused index on blur
                />
              ))}
            </View>
          </>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
  title: {
    fontSize: normalize(25),
    fontFamily: Fonts.inter,
    marginBottom: wp(20),
    color: colors.black,
    fontWeight: 'bold',
    marginTop: wp(113),
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 10,
  },
  emailText: {
    color: colors.black,
    fontFamily: Fonts.inter,
  },
  timerText: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 20,
    marginTop: wp(48),
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
  resendText: {
    fontSize: normalize(14),
    color: '#888',
    fontFamily: Fonts.inter,
    marginBottom: 30,
  },
  resendLink: {
    fontWeight: 'bold',
  },
});

export default VerifyPINScreen;
