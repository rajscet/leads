/* eslint-disable import/no-extraneous-dependencies */
import colors from 'assets/colors';
import Fonts from 'assets/fonts/fonts';
import { hp, normalize, wp } from 'helpers/styles/responsive';
import React, {useState, useEffect} from 'react';
import {Animated, Text, TouchableOpacity, View, StyleSheet} from 'react-native';

const TabBar = ({
  onTabChange,
  firstTab,
  secondTab,
  thirdTab,
  thirdIcon,
  secondIcon,
  style,
  selectedIndex,
}) => {
  // const [active, setActive] = useState(0);
  const [xTabOne, setXTabOne] = useState(0);
  const [xTabTwo, setXTabTwo] = useState(0);
  const [xTabThree, setXTabThree] = useState(0);
  const [translateX] = useState(new Animated.Value(0));

  const handleSlide = (type) => {
    Animated.spring(translateX, {
      toValue: type,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (selectedIndex === 0) {
      handleSlide(xTabOne);
      onTabChange(0);
    }
    if (selectedIndex === 1) {
      handleSlide(xTabTwo);
      onTabChange(1);
    }
    if (selectedIndex === 2) {
      handleSlide(xTabThree);
      onTabChange(2);
    }
  }, [selectedIndex]);

  return (
    <View style={[styles.tabConatiner, style]}>
      <View style={styles.tabRowContainer}>
        <Animated.View style={styles.slider(translateX)} />
        <TouchableOpacity
          style={styles.itemContainer}
          onLayout={(event) => setXTabOne(event.nativeEvent.layout.x)}
          onPress={() => onTabChange(0)}>
          <Text style={styles.tabText(selectedIndex === 0)}>{firstTab}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.itemContainer}
          onLayout={(event) => setXTabTwo(event.nativeEvent.layout.x)}
          onPress={() => onTabChange(1)}>
          <Text style={styles.tabText(selectedIndex === 1)}>{secondTab}</Text>
          {secondIcon || null}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.itemContainer}
          onLayout={(event) => setXTabThree(event.nativeEvent.layout.x)}
          onPress={() => onTabChange(2)}>
          <Text style={styles.tabText(selectedIndex === 2)}>{thirdTab}</Text>
          {thirdIcon || null}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slider: (translateX) => {
    return {
      position: 'absolute',
      width: '33%',
      height: '100%',
      top: 0,
      // left: 0,
      // right: 0,
      backgroundColor: colors.orange_FCB533,
      borderRadius: wp(2),
      alignItems: 'center',
      transform: [
        {
          translateX,
        },
      ],
    };
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: (isSelected) => {
    return {
      color: isSelected ? colors.white : colors.gray_707173,
      fontSize: normalize(14),
      fontFamily: isSelected ? Fonts.bold : Fonts.regular,
    };
  },

  tabRowContainer: {
    flexDirection: 'row',
    height: hp(3.9),
    position: 'relative',
  },
  tabConatiner: {
    paddingHorizontal: wp(5.2),
    borderRadius: wp(8),
    marginHorizontal: wp(6),
    height: wp(46),
    marginBottom: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TabBar;
