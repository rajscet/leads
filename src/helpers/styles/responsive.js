import {Dimensions, Platform} from 'react-native';
import DeviceInfo, { isTablet } from 'react-native-device-info';

const {width: viewportWidth, height: viewportHeight} = Dimensions.get('window');
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isIphoneXOnwards = DeviceInfo.hasNotch() || DeviceInfo.hasDynamicIsland();

export const getWidthRatio = () => viewportWidth / 400;

export const getHeightRatio = () => viewportHeight / 900;

export function wp(percentage) {
  const value =
    (percentage * (viewportWidth < viewportHeight ? viewportWidth : viewportHeight)) / 100;
  return Math.round(value) / 4;
}
export function hp(percentage) {
  const value =
    (percentage * (viewportWidth > viewportHeight ? viewportWidth : viewportHeight)) / 100;
  return Math.round(value) / 9.1;
}

export const isIos = Platform.OS === 'ios';

export function normalize(size) {
  const scale = (viewportWidth < viewportHeight ? viewportWidth : viewportHeight) / 375;
  const newSize = size * scale;
  if ( isTablet()) {
    return Math.round(newSize) - wp(6);
  }
  return Math.round(newSize);
}

export {viewportWidth, viewportHeight};
