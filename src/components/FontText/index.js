import colors from 'assets/colors';
import Fonts from 'assets/fonts/fonts';
import {normalize} from 'helpers/styles/responsive';
import React from 'react';
import {Text} from 'react-native';

function FontText({
  children,
  style,
  pureColor,
  onLayout,
  fontFamily = Fonts.regular,
  size = normalize(14),
  color = colors.black,
  lineHeightFactor = 1.2,
  lines = 0,
  opacity = 1,
  textAlign = 'left',
  pTop = 0,
  pLeft = 0,
  pRight = 0,
  pBottom = 0,
  textDecoration = null,
}) {
  const fontSize = size;
  const textStyle = {
    fontSize,
    fontFamily: fontFamily || Fonts.regular,
    color: pureColor || color,
    lineHeight: fontSize * lineHeightFactor,
    opacity,
    paddingTop: pTop,
    paddingLeft: pLeft,
    paddingRight: pRight,
    paddingBottom: pBottom,
    textAlign,
    textDecorationLine: textDecoration,
    textDecorationColor: textDecoration ? pureColor || color : null,
    textDecorationStyle: textDecoration ? 'solid' : null,
  };
  return (
    <Text
      allowFontScaling={false}
      numberOfLines={lines}
      onLayout={onLayout}
      style={[textStyle, style]}>
      {children}
    </Text>
  );
}

export default FontText;
