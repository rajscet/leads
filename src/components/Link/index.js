/* eslint-disable import/no-extraneous-dependencies */
import { hp } from 'helpers/styles/responsive';
import React from 'react';
import {StyleSheet, Pressable} from 'react-native';


const Link = ({style, children, onPress}) => {
  return (
    <Pressable onPress={onPress} style={[styles.container, style]}>
      {children}
    </Pressable>
  );
};


const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: hp(9),
  },
});

export default Link;
