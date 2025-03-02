/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';

import {StyleSheet, View} from 'react-native';
import {hp} from '../../styles/responsive';

function MenuDivider({color = 'rgba(0,0,0,0.12)'}) {
  return <View style={[styles.divider, {borderBottomColor: color}]} />;
}

const styles = StyleSheet.create({
  divider: {
    flex: 1,
    borderBottomWidth: 1,
    marginHorizontal: hp(0.9),
  },
});

export default MenuDivider;
