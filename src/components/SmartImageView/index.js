/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import FastImage from 'react-native-fast-image';
import LocalImages from 'assets/images/localImages';
import colors from 'assets/colors';

function SmartImageView({src, style, resizeMode, width, height, borderRadius, defaultImage}) {
  const [showDefault, setShowDefault] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const image = showDefault || error ? defaultImage || LocalImages.appLogo : src;

  return (
    <FastImage
      style={[
        {
          width: width || 0,
          height: height || 0,
          borderRadius: borderRadius || 0,
          overflow: 'hidden',
        },
        style || null,
      ]}
      source={image}
      onLoadEnd={() => {
        setIsLoading(false);
        setShowDefault(false);
      }}
      onError={() => {
        setIsLoading(false);
        setError(true);
      }}
      resizeMode={resizeMode || 'cover'}>
      {isLoading ? (
        <View style={styles.container}>
          <ActivityIndicator
            style={{alignSelf: 'center', alignItems: 'center'}}
            size="small"
            color={colors.gray_707173}
          />
        </View>
      ) : null}
    </FastImage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default SmartImageView;
