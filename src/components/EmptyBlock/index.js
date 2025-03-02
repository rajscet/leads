/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import {View, StyleSheet} from 'react-native';
import FontText from 'components/FontText';
import { hp, normalize } from 'helpers/styles/responsive';
import colors from 'assets/colors';
import Fonts from 'assets/fonts/fonts';


const EmptyBlock = ({style, title, subTitle, icon}) => {
  return (
    <View style={[styles.container, style]}>
      {icon}
      <FontText
        fontFamily={Fonts.regular}
        size={normalize(20)}
        color={colors.black}
        textAlign="center"
        pTop={hp(15)}>
        {title}
      </FontText>
      <FontText
        size={normalize(14)}
        color={colors.gray_707173}
        textAlign="center"
        pTop={hp(81)}
        lineHeightFactor={1.5}>
        {subTitle}
      </FontText>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(99),
  },
});

export default EmptyBlock;
