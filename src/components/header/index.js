import React from 'react';
import {Pressable, Text, StyleSheet} from 'react-native';
import colors from 'assets/colors';
import Fonts from 'assets/fonts/fonts';
import SvgIcons from 'assets/svgs/svgIcons';
import {wp, normalize} from 'helpers/styles/responsive';
import NavigationBar from './NavigationBar';

function Header({title, onBackPress, right, style, hasLeft}) {
  return (
    <NavigationBar
      hasCenter
      hasLeft
      hasRight
      sidesWidth={wp(108)}
      borderBottomWidth={0}
      bgColor={colors.primary}
      style={style}
      left={
        hasLeft ? (
          <Pressable hitSlop={{top: 10, bottom: 10, left: 10, right: 15}} onPress={onBackPress}>
            <SvgIcons.Left width={wp(7)} height={wp(11)}    fill={colors.white} />
          </Pressable>
        ) : null
      }
      center={
        <Text numberOfLines={1} style={styles.title}>
          {`${title}`}
        </Text>
      }
      right={right}
    />
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.white,
    fontSize: normalize(16),
    textAlign: 'center',
    fontFamily: Fonts.bold,
  },
});
export default Header;
