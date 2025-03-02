/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';

import {
  Platform,
  StyleSheet,
  TouchableHighlight,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import {hp} from '../../styles/responsive';
import FontText from '../FontText';

const Touchable =
  Platform.OS === 'android' && Platform.Version >= 21
    ? TouchableNativeFeedback
    : TouchableHighlight;

function MenuItem({
  children,
  disabled = false,
  disabledTextColor = '#bdbdbd',
  ellipsizeMode = Platform.OS === 'ios' ? 'clip' : 'tail',
  onPress,
  style,
  textStyle,
  ...props
}) {
  const touchableProps =
    Platform.OS === 'android' && Platform.Version >= 21
      ? {background: TouchableNativeFeedback.SelectableBackground()}
      : {};

  return (
    <Touchable disabled={disabled} onPress={onPress} {...touchableProps} {...props}>
      <View style={[styles.container, style]}>
        <FontText
          ellipsizeMode={ellipsizeMode}
          numberOfLines={1}
          style={[styles.title, disabled && {color: disabledTextColor}, textStyle]}>
          {children}
        </FontText>
      </View>
    </Touchable>
  );
}


const styles = StyleSheet.create({
  container: {
    height: hp(4.5),
    justifyContent: 'center',
    maxWidth: 248,
    minWidth: 124,
  },
  title: {
    marginHorizontal: hp(2.7),
  },
});

export default MenuItem;
