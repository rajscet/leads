import LottieAnimations from 'assets/lottie/lottieAnimations';
import { wp } from 'helpers/styles/responsive';
import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import LottieView from 'lottie-react-native';

function Loader(props, ref) {
  const [loading, setLoading] = useState(0);

  useImperativeHandle(
    ref,
    () => ({
      start: () => {
        const loadingCount = loading + 1;
        setLoading(loadingCount);
      },
      stop: () => {
        const loadingCount = loading > 0 ? loading - 1 : 0;
        setLoading(loadingCount);
      },
      isLoading: () => loading >= 1,
    }),
    []
  );

  if (!loading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LottieView source={LottieAnimations.appLoader} style={styles.loader} autoPlay loop />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#11111150',
    zIndex: 999,
    elevation: 999,
  },
  loader: {
    width: wp(300),
    height: wp(300),
  },
});

export default forwardRef(Loader);
