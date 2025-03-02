import {StyleSheet, View, Pressable} from 'react-native';
import React from 'react';

export default function FabButton({size, icon, style, onPress}) {
  return (
    <Pressable
      onPress={onPress}
      style={[{width: size, height: size, borderRadius: size / 2}, styles.container, style]}>
      <View>{icon}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'blue',
  },
});
