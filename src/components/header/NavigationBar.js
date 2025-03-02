import colors from 'assets/colors';
import {hp, wp} from 'helpers/styles/responsive';
import React from 'react';
import {Animated, StyleSheet, View} from 'react-native';

export const navbarXSpace = 0;
export const navbarHeight = hp(60);

function NavigationBar({
  style,
  leftStyle,
  centerStyle,
  rightStyle,
  height = navbarHeight,
  isFixed = false,
  bgColor = 'white',
  hasLeft = false,
  hasCenter = false,
  hasRight = false,
  left = null,
  center = null,
  right = null,
  sidesWidth = 88,
  animated = false,
  borderBottomWidth = 1,
}) {
  const _wrapperStyle = {
    height: height + navbarXSpace,
    borderBottomWidth,
  };
  const _sideStyle = {
    width: sidesWidth,
  };
  bgColor = typeof bgColor === 'string' ? {backgroundColor: bgColor} : bgColor;

  if (animated) {
    return (
      <Animated.View
        style={[
          styles.wrapper,
          isFixed ? styles.wrapperFixed : null,
          bgColor,
          styles.wrapper,
          _wrapperStyle,
          style,
        ]}>
        {hasLeft ? (
          <View style={[styles.left, _sideStyle, leftStyle]}>{left}</View>
        ) : null}
        {hasCenter ? (
          <View style={[styles.center, centerStyle]}>{center}</View>
        ) : null}
        {hasRight ? (
          <View style={[styles.right, _sideStyle, rightStyle]}>{right}</View>
        ) : null}
      </Animated.View>
    );
  }

  return (
    <View
      style={[
        styles.wrapper,
        isFixed ? styles.wrapperFixed : null,
        bgColor,
        _wrapperStyle,
        style,
      ]}>
      {hasLeft ? (
        <View style={[styles.left, _sideStyle, leftStyle]}>{left}</View>
      ) : null}
      {hasCenter ? (
        <View style={[styles.center, centerStyle]}>{center}</View>
      ) : null}
      {hasRight ? (
        <View style={[styles.right, _sideStyle, rightStyle]}>{right}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: NavigationBar.height,
    borderBottomColor: colors.textDark,
    // shadowColor: '#111111',
    // shadowOffset: {
    //   width: 0,
    //   height: 0,
    // },
    // shadowOpacity: 0.5,
    // shadowRadius: 10,
    // elevation: 5,


  },
  wrapperFixed: {
    top: 0,
    left: 0,
    width: '100%',
    position: 'absolute',
  },
  left: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: wp(16),
  },
  center: {
    width: 0,
    flexGrow: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  right: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: wp(10),
  },
});

export default NavigationBar;
