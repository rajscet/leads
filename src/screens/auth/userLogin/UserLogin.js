/* eslint-disable react-hooks/exhaustive-deps */
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import {useFocusEffect} from '@react-navigation/native';
import colors from 'assets/colors';
import Fonts from 'assets/fonts/fonts';
import Button from 'components/Button';
import Dropdown from 'components/Dropdown';
import FontText from 'components/FontText';
import Header from 'components/header';
import useDidMountEffect from 'components/UseDidMountEffect';
import {ENV, PREFERENCE, ROUTE_NAMES} from 'constants/index';
import {hp, normalize, wp} from 'helpers/styles/responsive';
import {resetNavigateTo} from 'navigation/navigationHelper';
import {useLoader} from 'providers/LoaderProvider';
import React, {useState} from 'react';
import {
  Alert,
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import DeviceInfo, { isTablet } from 'react-native-device-info';
import {compare} from 'react-native-simple-bcrypt';
import authServices from 'services/authServices';
import leadService from 'services/leadService';

export default function UserLogin({navigation}) {
  const locationRef = React.useRef();
  const userRef = React.useRef();
  const [selectedLocation, setSelectedLocation] = React.useState(undefined);
  const [selectedUser, setSelectedUser] = React.useState(undefined);
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedType, setSelectedType] = useState(0);
  const [isConnected, setIsConnected] = useState(undefined);

  const inputRefs = Array(6)
    .fill()
    .map(() => React.useRef(null)); // Create refs for all 6 OTP inputs
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // Initial OTP state
  const [focusedIndex, setFocusedIndex] = useState(null); // To track which input is focused

  const {startLoader, stopLoader} = useLoader();

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

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const setDefaultFocus = async () => {
    const rawData = await AsyncStorage.getItem(PREFERENCE.USER);
    const user = rawData ? JSON.parse(rawData) : null;
    if (user && user?.role) {
      if (user.role.name === 'Tablet Super Admin') {
        setSelectedType(1);
      } else {
        setSelectedType(0);
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setDefaultFocus();
    }, []),
  );

  const setDefaultUser = async () => {
    const rawData = await AsyncStorage.getItem(PREFERENCE.USER);
    const user = rawData ? JSON.parse(rawData) : null;
    if (user && user?.role) {
      if (isConnected === false) {
        // if (user.role.name === 'Tablet Super Admin') {
        //   setSelectedType(1);
        // } else {
        //   setSelectedType(0);
        // }
        setSelectedUser(user);
        userRef.current.setValueManually(user.full_name);
      } else {
        if (
          (user.role.name === 'Tablet Super Admin' && selectedType === 1) ||
          (user.role.name === 'Sales Person' && selectedType === 0)
        ) {
          setSelectedUser(user);
          userRef.current.setValueManually(user.full_name);
        } else {
          setSelectedUser(undefined);
          userRef.current.setValueManually('');
        }
      }
    }
  };

  const setDefaultLocation = async () => {
    const id = await AsyncStorage.getItem(PREFERENCE.LOCATION_ID);
    const location = locations.find(item => item.id === id);
    if (location && location?.name) {
      setSelectedLocation(location);
      locationRef.current.setValueManually(location.name);
    }
  };

  const setOffLineUsers = async () => {
    let dropdownUsers = [];
    if (selectedType === 0) {
      dropdownUsers = await AsyncStorage.getItem(PREFERENCE.USERS_SALES);
    } else {
      dropdownUsers = await AsyncStorage.getItem(PREFERENCE.USERS_ADMIN);
    }
    if (dropdownUsers) {
      setUsers(JSON.parse(dropdownUsers));
    }
  };

  const setOffLineLocations = async () => {
    const offlineLocation = await AsyncStorage.getItem(PREFERENCE.LOCATIONS);
    if (offlineLocation) {
      setLocations(JSON.parse(offlineLocation));
    }
  };

  useDidMountEffect(() => {
    setUsers([]);
    setSelectedUser(undefined);

    if (isConnected === true) {
      getUsers();
    } else {
      setOffLineUsers();
    }
  }, [selectedType]);

  useDidMountEffect(() => {
    getUsers();
    getLocations();
  }, [isConnected]);

  const getLocations = async () => {
    if (isConnected === true) {
      try {
        startLoader();
        Keyboard.dismiss();

        const locationParams = {
          pageNumber: 1,
          pageSize: 100,
          filters: {
            name: '',
            active: true,
          },
        };

        const locationResponse = await leadService.getAllLocations(
          locationParams,
        );
        if (locationResponse.status === true) {
          setLocations(locationResponse.data.locations);
          await AsyncStorage.setItem(
            PREFERENCE.LOCATIONS,
            JSON.stringify(locationResponse.data.locations),
          );
        } else {
          Alert.alert(locationResponse.message);
        }
      } catch (e) {
        stopLoader();
        Alert.alert(e.message);
        console.log(e);
      } finally {
        stopLoader();
      }
    } else {
      setOffLineLocations();
    }
  };

  const getUsers = async () => {
    if (isConnected === true) {
      try {
        startLoader();
        Keyboard.dismiss();
        const adminParams = {
          pageNumber: 1,
          pageSize: 100,
          filters: {
            status: 'active',
            role: 'Tablet Super Admin',
            // role: selectedType === 1 ? 'Tablet Super Admin' : 'Sales Person',
          },
        };
        const userParams = {
          pageNumber: 1,
          pageSize: 100,
          filters: {
            status: 'active',
            role: 'Sales Person',
            // role: selectedType === 1 ? 'Tablet Super Admin' : 'Sales Person',
          },
        };
        const admins = await authServices.getUsers(adminParams);
        const usersResponse = await authServices.getUsers(userParams);

        if (admins.status === true) {
          if (selectedType === 1) {
            setUsers(admins.data.users);
          }
          await AsyncStorage.setItem(
            PREFERENCE.USERS_ADMIN,
            JSON.stringify(admins.data.users),
          );
        } else {
          Alert.alert(admins.message);
        }

        if (usersResponse.status === true) {
          if (selectedType === 0) {
            setUsers(usersResponse.data.users);
          }
          await AsyncStorage.setItem(
            PREFERENCE.USERS_SALES,
            JSON.stringify(usersResponse.data.users),
          );
        } else {
          Alert.alert(usersResponse.message);
        }
      } catch (e) {
        stopLoader();
        Alert.alert(e.message);
        console.log(e);
      } finally {
        stopLoader();
      }
    } else {
      setOffLineUsers();
    }
  };

  const verifyOTP = async () => {
    try {
      if (!selectedUser) {
        Alert.alert('Please select the user');
        return;
      }
      if (!selectedLocation) {
        Alert.alert('Please select the location');
        return;
      }
      if (otp.join('').length === 6) {
        startLoader();
        Keyboard.dismiss();
        compare(otp.join(''), selectedUser.pin).then(async isMatched => {
          if (isMatched) {
            await AsyncStorage.setItem(PREFERENCE.IS_USER_LOGGED_IN, 'true');
            await AsyncStorage.setItem(
              PREFERENCE.USER,
              JSON.stringify(selectedUser),
            );
            await AsyncStorage.setItem(
              PREFERENCE.LOCATION_ID,
              `${selectedLocation.id}`,
            );
            await AsyncStorage.setItem(
              PREFERENCE.MULTIPLE_CONTACT_COUNT,
              `${selectedLocation.maximum_contacts_count}`,
            );
            await AsyncStorage.setItem(
              PREFERENCE.LOCATION_NAME,
              selectedLocation.name,
            );
            await AsyncStorage.setItem(
              PREFERENCE.LOCATION_SET_PASSWORD,
              selectedLocation?.set_password === true ? '1' : '0',
            );
            await AsyncStorage.setItem(
              PREFERENCE.LEAD_FIELDS,
              JSON.stringify(selectedLocation.tablet_lead_fields),
            );
            resetNavigateTo(navigation, ROUTE_NAMES.HOME, {user: selectedUser});
          } else {
            Alert.alert('Please enter a valid OTP');
          }
        });
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

  React.useEffect(() => {
    if (users && users.length > 0) {
      setDefaultUser();
    }
  }, [users]);

  React.useEffect(() => {
    if (locations && locations.length > 0) {
      setDefaultLocation();
    }
  }, [locations]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Header hasLeft={false} title={'Login'} />

        <>
          <SegmentedControl
            tintColor={colors.gray_5D7285}
            backgroundColor={'#462201'}
            style={styles.segment}
            values={['Sales Person', 'Super Admin']}
            fontStyle={{fontSize: normalize(16), fontFamily: Fonts.regular}}
            activeFontStyle={{
              fontSize: normalize(16),
              fontFamily: Fonts.regular,
            }}
            selectedIndex={selectedType}
            onChange={event => {
              setSelectedType(event.nativeEvent.selectedSegmentIndex);
            }}
          />
          <View style={styles.subContainer}>
            <Dropdown
              ref={userRef}
              title={'User'}
              isRequired
              placeHolder={'Select User'}
              onItemSelected={item => {
                console.log('selected USER', item);
                setSelectedUser(item);
              }}
              data={users.map(user => ({
                ...user,
                full_name: `${user.first_name} ${user.last_name}`,
              }))}
              keyName={'full_name'}
              val={selectedUser}
            />
            <FontText
              size={normalize(15)}
              color={colors.black_222222}
              fontFamily={Fonts.robotBold}
              pTop={wp(4)}
              pBottom={hp(4)}>
              {'PIN'}
            </FontText>

            {/* OTP Inputs */}
            <View style={styles.otpContainer}>
              {otp.map((value, index) => (
                <TextInput
                  key={index}
                  ref={inputRefs[index]} // Assign ref to each input
                  style={[
                    styles.otpInput,
                    // eslint-disable-next-line react-native/no-inline-styles
                    {
                      borderColor:
                        focusedIndex === index || otp[index] !== ''
                          ? '#754FFF' // Focus color
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

            <Dropdown
              ref={locationRef}
              title={'Location'}
              isRequired
              placeHolder={'Select Location'}
              onItemSelected={item => {
                setSelectedLocation(item);
              }}
              data={locations}
              keyName={'name'}
              val={selectedLocation?.name || ''}
            />
          </View>
          <Button onPress={verifyOTP} style={styles.verifyOTPButton}>
            <FontText
              fontFamily={Fonts.robotRegular}
              size={normalize(16)}
              color={colors.white}>
              {'Submit'}
            </FontText>
          </Button>
          <FontText
            pBottom={wp(20)}
            style={{textAlign: 'center'}}
            fontFamily={Fonts.robotRegular}
            size={normalize(16)}
            color={colors.black}>
            {`Version : ${DeviceInfo.getVersion()}\n Environment: ${ENV}`}
          </FontText>
        </>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F2F7',
  },
  offlineContainer: {
    flex: 1,
    backgroundColor: '#F4F2F7',
    // justifyContent: 'center',
    alignItems: 'center',
  },
  subContainer: {
    paddingHorizontal: wp(24),
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: wp(12),
  },
  otpInput: {
    width: normalize(48),
    height: normalize(48),
    borderWidth: 1,
    borderRadius: 5,
    textAlign: 'center',
    fontSize: normalize(19),
    marginHorizontal: 5,
    backgroundColor: colors.white,
  },
  verifyOTPButton: {
    marginTop: 'auto',
    marginHorizontal: wp(20),
    marginBottom: wp(20),
  },
  segment: {
    marginHorizontal: wp(24),
    borderWidth: 1,
    borderColor: colors.blue_2C79FF,
    height: isTablet() ? wp(30) : wp(48),
    marginVertical: wp(16),
  },
});
