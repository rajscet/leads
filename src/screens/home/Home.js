import colors from 'assets/colors';
import Fonts from 'assets/fonts/fonts';
import LocalImages from 'assets/images/localImages';
import SvgIcons from 'assets/svgs/svgIcons';
import FontText from 'components/FontText';
import {ENV, ROUTE_NAMES} from 'constants/index';
import {normalize, wp} from 'helpers/styles/responsive';
import {Utils} from 'helpers/utils';
import * as React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import DeviceInfo, {isTablet} from 'react-native-device-info';
import {Drawer} from 'react-native-drawer-layout';
import {DrawerItem} from 'screens/drawer/DrawerItem';
import EnterDynamicLead from './enterLead/EnterDynamicLead';
import LeadsListScreen from './LeadsList/LeadsListScreen';
import LogScreen from './logs/LogScreen';
import SearchCustomer from './searchCustomer/SearchCustomer';

function CustomDrawerContent({user, onClose, setScreen}) {
  const [selectedItem, setSelectedItem] = React.useState(
    ROUTE_NAMES.ENTER_LEAD_SCREEN,
  );

  return (
    <View style={[styles.drawerContent]}>
      <View
        style={{
          flexDirection: 'row',
          marginVertical: wp(30),
          width: isTablet() ? wp(200) : wp(250),
        }}>
        <SvgIcons.DrawerMenu style={{marginLeft: wp(8), marginRight: wp(14)}} />
        <View>
          <FontText
            color={colors.blue}
            style={{alignSelf: 'center'}}
            size={normalize(17)}
            fontFamily={Fonts.robotBold}>
            {`${user?.first_name} ${user?.last_name}`}
          </FontText>
          <FontText
            color={colors.gray_5D7285}
            style={{alignSelf: 'center'}}
            size={normalize(13)}
            fontFamily={Fonts.robotBold}>
            {`${user?.role.name}`}
          </FontText>
        </View>
      </View>

      <DrawerItem
        label={'Enter Lead'}
        icon={() => (
          <Image
            source={LocalImages.newLead}
            tintColor={
              selectedItem === ROUTE_NAMES.ENTER_LEAD_SCREEN
                ? colors.white
                : colors.gray_5D7285
            }
            style={styles.icon}
          />
        )}
        onPress={() => {
          onClose();
          setSelectedItem(ROUTE_NAMES.ENTER_LEAD_SCREEN);
          setScreen(ROUTE_NAMES.ENTER_LEAD_SCREEN);
        }}
        labelStyle={{
          color:
            selectedItem === ROUTE_NAMES.ENTER_LEAD_SCREEN
              ? colors.white
              : colors.gray_5D7285,
          fontSize: normalize(16),
          lineHeight: normalize(18),
          fontFamily: Fonts.regular,
        }}
        style={{
          backgroundColor:
            selectedItem === ROUTE_NAMES.ENTER_LEAD_SCREEN
              ? colors.primary
              : colors.transparent,
          marginBottom: wp(4),
        }}
      />
      <DrawerItem
        label={'Leads'}
        icon={() => (
          <Image
            source={LocalImages.leads}
            tintColor={
              selectedItem === ROUTE_NAMES.LEAD_LIST
                ? colors.white
                : colors.gray_5D7285
            }
            style={styles.icon}
          />
        )}
        onPress={() => {
          onClose();
          setSelectedItem(ROUTE_NAMES.LEAD_LIST);
          setScreen(ROUTE_NAMES.LEAD_LIST);
        }}
        labelStyle={{
          color:
            selectedItem === ROUTE_NAMES.LEAD_LIST
              ? colors.white
              : colors.gray_5D7285,
          fontSize: normalize(16),
          lineHeight: normalize(18),
          fontFamily: Fonts.regular,
        }}
        style={{
          backgroundColor:
            selectedItem === ROUTE_NAMES.LEAD_LIST
              ? colors.primary
              : colors.transparent,
          marginBottom: wp(4),
        }}
      />
      <DrawerItem
        label={'Search Customer'}
        icon={() => (
          <Image
            source={LocalImages.customer}
            tintColor={
              selectedItem === ROUTE_NAMES.SEARCH_CUSTOMER
                ? colors.white
                : colors.gray_5D7285
            }
            style={styles.icon}
          />
        )}
        onPress={() => {
          onClose();
          setSelectedItem(ROUTE_NAMES.SEARCH_CUSTOMER);
          setScreen(ROUTE_NAMES.SEARCH_CUSTOMER);
        }}
        labelStyle={{
          color:
            selectedItem === ROUTE_NAMES.SEARCH_CUSTOMER
              ? colors.white
              : colors.gray_5D7285,
          fontSize: isTablet() ? normalize(16) : normalize(15),
          fontFamily: Fonts.regular,
          lineHeight: normalize(18),
        }}
        style={{
          backgroundColor:
            selectedItem === ROUTE_NAMES.SEARCH_CUSTOMER
              ? colors.primary
              : colors.transparent,
          marginBottom: wp(4),
        }}
      />
      <DrawerItem
        label={'Logs'}
        icon={() => (
          <Image
            source={LocalImages.logs}
            tintColor={
              selectedItem === ROUTE_NAMES.LOG_SCREEN
                ? colors.white
                : colors.gray_5D7285
            }
            style={styles.icon}
          />
        )}
        onPress={() => {
          onClose();
          setSelectedItem(ROUTE_NAMES.LOG_SCREEN);
          setScreen(ROUTE_NAMES.LOG_SCREEN);
        }}
        labelStyle={{
          color:
            selectedItem === ROUTE_NAMES.LOG_SCREEN
              ? colors.white
              : colors.gray_5D7285,
          fontSize: normalize(16),
          lineHeight: normalize(18),
          fontFamily: Fonts.regular,
        }}
        style={{
          backgroundColor:
            selectedItem === ROUTE_NAMES.LOG_SCREEN
              ? colors.primary
              : colors.transparent,
          marginBottom: wp(4),
        }}
      />
      <View style={styles.superAdminSection}>
        <TouchableOpacity
          style={styles.superAdminButton}
          onPress={() => {
            onClose();
            setSelectedItem('Logout');
            Utils.userLogout();
          }}>
          <SvgIcons.Logout
            style={styles.icon}
            color={colors.white}
            width={wp(24)}
            height={wp(24)}
          />
          <Text style={styles.superAdminText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <FontText
        pTop={wp(20)}
        style={{textAlign: 'center'}}
        fontFamily={Fonts.robotRegular}
        size={normalize(16)}
        color={colors.black}>
        {`Version : ${DeviceInfo.getVersion()}\n Environment: ${ENV}`}
      </FontText>
    </View>
  );
}

// Main App Component with Drawer
export default function Home({route}) {
  const user = route.params.user;
  const [open, setOpen] = React.useState(false);
  const [currentScreen, setCurrentScreen] = React.useState(
    ROUTE_NAMES.ENTER_LEAD_SCREEN,
  );

  const openDrawer = React.useCallback(() => {
    setOpen(true);
  }, []);

  let screenComponent;
  if (currentScreen === ROUTE_NAMES.ENTER_LEAD_SCREEN) {
    screenComponent = <EnterDynamicLead openDrawer={openDrawer} />;
  } else if (currentScreen === ROUTE_NAMES.LEAD_LIST) {
    screenComponent = <LeadsListScreen user={user} openDrawer={openDrawer} />;
  } else if (currentScreen === ROUTE_NAMES.SEARCH_CUSTOMER) {
    screenComponent = <SearchCustomer openDrawer={openDrawer} />;
  } else if (currentScreen === ROUTE_NAMES.LOG_SCREEN) {
    screenComponent = <LogScreen openDrawer={openDrawer} />;
  }

  return (
    <View style={{flex: 1}}>
      <Drawer
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        renderDrawerContent={() => (
          <CustomDrawerContent
            user={user}
            onClose={() => setOpen(false)}
            setScreen={setCurrentScreen}
          />
        )}
        drawerStyle={{
          backgroundColor: 'white',
          width: isTablet() ? wp(250) : wp(300),
        }}>
        <View style={{flex: 1}}>{screenComponent}</View>
      </Drawer>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
  },
  screenText: {
    fontSize: 20,
  },
  drawerContainer: {
    flex: 1,
    padding: 20,
    width: '100%',
  },
  drawerItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  drawerText: {
    fontSize: 16,
  },

  drawerContent: {
    flex: 1,
    marginLeft: wp(16),
    marginBottom: wp(24),
  },
  superAdminSection: {
    marginTop: 'auto',
    marginBottom: wp(150),
    marginRight: wp(25),
  },
  superAdminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DB3545',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  superAdminText: {
    color: 'white',
    fontSize: normalize(16),
    marginLeft: 10,
  },
  appLogo: {
    width: wp(69),
    height: wp(69),
  },
  menu: {
    alignSelf: 'flex-end',
  },
  icon: {
    width: wp(24),
    height: wp(24),
    marginRight: wp(8),
  },
});
