import React from 'react';
import {Pressable, Text, StyleSheet} from 'react-native';
import colors from 'assets/colors';
import Fonts from 'assets/fonts/fonts';
import SvgIcons from 'assets/svgs/svgIcons';
import {wp, normalize} from 'helpers/styles/responsive';
import {useNavigation} from '@react-navigation/native';
import {ROUTE_NAMES} from 'constants/index';
import NavigationBar from './NavigationBar';
import FontText from 'components/FontText';
import { isTablet } from 'react-native-device-info';

function DrawerHeader({title, style, hasLeft, right, openDrawer}) {
  const navigation = useNavigation();

  return (
    <NavigationBar
      hasCenter
      hasLeft
      hasRight
      sidesWidth={wp(108)}
      borderBottomWidth={0}
      bgColor={colors.gray_F2F2F2}
      style={style}
      right={right}
      left={
        hasLeft ? (
          <Pressable
            onPress={() => {
              openDrawer();
            }}>
            <SvgIcons.DrawerMenu stroke={colors.white} />
          </Pressable>
        ) : null
      }
      center={
        title ? (
          <FontText
            fontFamily={Fonts.robotMedium}
            size={isTablet() ? normalize(20) : normalize(16)}
            color={colors.black_231F20}>
            {title}
          </FontText>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.white,
    fontSize: isTablet() ? normalize(20) : normalize(16),
    textAlign: 'center',
    fontFamily: Fonts.bold,
  },
});
export default DrawerHeader;
