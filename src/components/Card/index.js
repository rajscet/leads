import {StyleSheet, View} from 'react-native';
import React from 'react';
import colors from 'assets/colors';
import {wp} from 'helpers/styles/responsive';

export default function CardView({children, containerStyle = {}}) {
  return <View style={[styles.container, containerStyle]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    elevation: 10,
    shadowRadius: 10,
    backgroundColor: colors.white,
    // padding: wp(8),
    borderRadius: wp(4),
    overflow: 'hidden',
  },
});
