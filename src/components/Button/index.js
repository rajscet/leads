/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import {TouchableOpacity, StyleSheet, Keyboard, Pressable} from 'react-native';

import { hp } from 'helpers/styles/responsive';
import colors from 'assets/colors';


const Button = (props) => {
  const {
    children,
    style,
    buttonStyle,
    activeOpacity = 0.5,
    bgColor = colors.primary,
    disabled = false,
    pointerEvents,
    shadowColor = colors.tintColor,
    buttonHeight = hp(48),
    position = 'center',
    dismissKeyboardOnPress = true,
    borderColor = bgColor,

  } = props;

  function onButtonPress(prop) {
    return (evt) => {
      const {onPress, dismissKeyboardOnPress} = prop;

      dismissKeyboardOnPress && Keyboard.dismiss();
      if (onPress) {
        onPress(evt);
      }
    };
  }

  return (
    <Pressable
      activeOpacity={activeOpacity}
      onPress={onButtonPress(props)}
      disabled={disabled}
      pointerEvents={pointerEvents}
      style={[
        styles.button,

        buttonStyle,
        shadowColor ? {shadowColor: shadowColor} : null,
        bgColor ? {backgroundColor: bgColor} : null,
        buttonHeight ? {height: buttonHeight} : null,
        borderColor ? { borderColor} : null,
        style,
        disabled ? styles.disabledButton : null,
      ]}>
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingLeft: 5,
    paddingRight: 5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 2,
  },
  shadow: {
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    elevation: 10,
    shadowRadius: 10,
  },
  disabledButton: {
    backgroundColor: colors.disableColor, // Define this color in your colors file
  },
});

export default Button;
