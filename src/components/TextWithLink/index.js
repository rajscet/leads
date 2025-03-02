/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import {View, StyleSheet} from 'react-native';
import { normalize } from 'helpers/styles/responsive';
import FontText from 'components/FontText';
import { Link } from '@react-navigation/native';
import colors from 'assets/colors';

const TextWithLink = ({firstText, secondText, onLinkPress, style}) => {
  return (
    <View style={[styles.lineContainer, style]}>
      <FontText size={normalize(15)} color={colors.gray_868686}>
        {firstText}{' '}
      </FontText>
      <Link onPress={onLinkPress}>
        <FontText size={normalize(15)} color={colors.blue_2C79FF}>
          {secondText}
        </FontText>
      </Link>
    </View>
  );
};



const styles = StyleSheet.create({
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TextWithLink;
