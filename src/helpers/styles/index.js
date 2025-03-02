import {StyleSheet} from 'react-native';

const globalStyle = StyleSheet.create({
  overlay: {
    zIndex: 9999,
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: '#00000090',
  },
  shadow: {
    shadowColor: '#111111',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  lightShadow: {
    shadowColor: '#00000020',
    shadowOffset: {width: 4, height: -5},
    shadowOpacity: 0.5,
    elevation: 20,
    shadowRadius: 10,
  },
  separator: {
    height: 1,
  },
});

export default globalStyle;
