import React, { useRef, useState } from 'react';
import { View, Text, Button, StyleSheet, Image, TouchableOpacity } from 'react-native';
import DrawerLayout from 'react-native-drawer-layout';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import colors from 'assets/colors';
import Fonts from 'assets/fonts/fonts';
import LocalImages from 'assets/images/localImages';
import SvgIcons from 'assets/svgs/svgIcons';
import FontText from 'components/FontText';
import { ENV, ROUTE_NAMES } from 'constants/index';
import { normalize, wp } from 'helpers/styles/responsive';
import { Utils } from 'helpers/utils';
import DeviceInfo from 'react-native-device-info';

// Screens
import EnterDynamicLead from './enterLead/EnterDynamicLead';
import LeadsListScreen from './LeadsList/LeadsListScreen';
import LogScreen from './logs/LogScreen';
import SearchCustomer from './searchCustomer/SearchCustomer';

const Stack = createStackNavigator();

const AppNavigator = ({ openDrawer }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={ROUTE_NAMES.ENTER_LEAD_SCREEN}>
      {props => <EnterDynamicLead {...props} openDrawer={openDrawer} />}
    </Stack.Screen>
    <Stack.Screen name={ROUTE_NAMES.LEAD_LIST}>
      {props => <LeadsListScreen {...props} openDrawer={openDrawer} />}
    </Stack.Screen>
    <Stack.Screen name={ROUTE_NAMES.SEARCH_CUSTOMER}>
      {props => <SearchCustomer {...props} openDrawer={openDrawer} />}
    </Stack.Screen>
    <Stack.Screen name={ROUTE_NAMES.LOG_SCREEN}>
      {props => <LogScreen {...props} openDrawer={openDrawer} />}
    </Stack.Screen>
  </Stack.Navigator>
);

// Custom Drawer Content
function CustomDrawerContent({ navigation, closeDrawer }) {
  const [selectedItem, setSelectedItem] = useState(ROUTE_NAMES.ENTER_LEAD_SCREEN);

  return (
    <View style={styles.drawerContainer}>
      {/* User Info */}
      <View style={{ flexDirection: 'row', marginVertical: wp(30) }}>
        <SvgIcons.DrawerMenu style={{ marginLeft: wp(8), marginRight: wp(14) }} />
        <View>
          <FontText color={colors.blue} style={{ alignSelf: 'center' }} size={normalize(17)} fontFamily={Fonts.robotBold}>
            John Doe
          </FontText>
          <FontText color={colors.gray_5D7285} style={{ alignSelf: 'center' }} size={normalize(13)} fontFamily={Fonts.robotBold}>
            Admin
          </FontText>
        </View>
      </View>

      {/* Drawer Items */}
      {[
        { label: 'Enter Lead', route: ROUTE_NAMES.ENTER_LEAD_SCREEN, icon: LocalImages.newLead },
        { label: 'Leads', route: ROUTE_NAMES.LEAD_LIST, icon: LocalImages.leads },
        { label: 'Search Customer', route: ROUTE_NAMES.SEARCH_CUSTOMER, icon: LocalImages.customer },
        { label: 'Logs', route: ROUTE_NAMES.LOG_SCREEN, icon: LocalImages.logs },
      ].map(item => (
        <TouchableOpacity
          key={item.route}
          style={[
            styles.drawerItem,
            selectedItem === item.route && { backgroundColor: colors.primary },
          ]}
          onPress={() => {
            setSelectedItem(item.route);
            navigation.navigate(item.route);
            closeDrawer();
          }}
        >
          <Image source={item.icon} tintColor={selectedItem === item.route ? colors.white : colors.gray_5D7285} style={styles.icon} />
          <Text style={[styles.drawerItemText, selectedItem === item.route && { color: colors.white }]}>{item.label}</Text>
        </TouchableOpacity>
      ))}

      {/* Logout Button */}
      <View style={styles.superAdminSection}>
        <TouchableOpacity style={styles.superAdminButton} onPress={() => Utils.userLogout()}>
          <SvgIcons.Logout style={styles.icon} color={colors.white} width={wp(24)} height={wp(24)} />
          <Text style={styles.superAdminText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Version Info */}
      <FontText pTop={wp(20)} style={{ textAlign: 'center' }} fontFamily={Fonts.robotRegular} size={normalize(16)} color={colors.black}>
        {`Version: ${DeviceInfo.getVersion()}\n Environment: ${ENV}`}
      </FontText>
    </View>
  );
}

// Main App Component with Drawer
const Home = () => {
  const drawerRef = useRef(null);

  const openDrawer = () => {
    if (drawerRef.current) drawerRef.current.openDrawer();
  };

  const closeDrawer = () => {
    if (drawerRef.current) drawerRef.current.closeDrawer();
  };

  return (
    <NavigationContainer>
      <DrawerLayout
        ref={drawerRef}
        drawerWidth={wp(270)}
        drawerPosition="left"
        renderNavigationView={() => <CustomDrawerContent navigation={navigation} closeDrawer={closeDrawer} />}
      >
        <AppNavigator openDrawer={openDrawer} />
      </DrawerLayout>
    </NavigationContainer>
  );
};

// Styles
const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 20,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: wp(4),
  },
  drawerItemText: {
    fontSize: normalize(16),
    fontFamily: Fonts.regular,
    marginLeft: 10,
    color: colors.gray_5D7285,
  },
  icon: {
    width: wp(24),
    height: wp(24),
  },
  superAdminSection: {
    marginTop: 'auto',
    marginBottom: wp(150),
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
});

export default Home;
