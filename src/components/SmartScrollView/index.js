/* eslint-disable import/no-extraneous-dependencies */
import React, {forwardRef, useState, useEffect, useImperativeHandle, createRef} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
  Keyboard,
  TextInput,
  UIManager,
  findNodeHandle,
} from 'react-native';

const SmartScrollView = forwardRef(
  (
    {
      pDisabled = pDisabled || false,
      style,
      contentContainerStyle,
      children,
      header = null,
      footer = null,
      centerContent = false,
      alwaysBounceVertical = true,
      showsVerticalScrollIndicator = true,
      floatHeader = true,
      decelerationRate = null,
      applyKeyboardCheck = false,
      nestedScrollEnabled,
    },
    ref
  ) => {
    const [duration] = useState(300);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [disabled] = useState(pDisabled);
    const [scrollY, setScrollY] = useState(0);
    const [topOffset, setTopOffset] = useState(0);
    const [height, setHeight] = useState(0);

    let scrollView = createRef();

    useEffect(() => {
      _keyboardEventsInit();
      return () => {
        _removeKeyboardEvents();
      };
    }, []);

    useImperativeHandle(ref, () => ({
      scrollTo: () => scrollTo(),
      scrollToEnd: () => scrollToEnd(),
      hideKeyboard: () => hideKeyboard(),
      checkElement: () => checkElement(),
    }));

    const _keyboardEventsInit = () => {
      _removeKeyboardEvents();
      if (Platform.OS === 'ios' && applyKeyboardCheck) {
        window.keyboardAnimated = new Animated.Value(0);
        window.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', _onKeyboardUp);
        window.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', _onKeyboardDown);
      } else if (applyKeyboardCheck) {
        window.keyboardAnimated = new Animated.Value(0);
        window.keyboardWillShowListener = Keyboard.addListener('keyboardDidShow', _onKeyboardUp);
        window.keyboardWillHideListener = Keyboard.addListener('keyboardDidHide', _onKeyboardDown);
      }
    };

    const _removeKeyboardEvents = () => {
      if (window.keyboardWillShowListener) {
        window.keyboardWillShowListener.remove();
        window.keyboardWillShowListener = null;
      }
      if (window.keyboardWillHideListener) {
        window.keyboardWillHideListener.remove();
        window.keyboardWillHideListener = null;
      }
    };

    // eslint-disable-next-line no-shadow
    const _onKeyboardUp = ({endCoordinates: {height}}) => {
      if (window.keyboardAnimated) {
        Animated.timing(window.keyboardAnimated, {
          toValue: height,
          duration: duration * 0.92,
        }).start(() => {
          setKeyboardHeight(height);
          _checkScroll();
        });
      }
    };

    const _onKeyboardDown = () => {
      if (window.keyboardAnimated) {
        setKeyboardHeight(0);
        Animated.timing(window.keyboardAnimated, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? duration : 0,
        }).start();
      }
    };

    const _onScrollWrapperLayout = (evt) => {
      const {y, height: h} = evt.nativeEvent.layout;
      setTopOffset(y);
      if (h > height) {
        setHeight(h);
      }
    };

    const _onScrollHandler = (evt) => setScrollY(evt.nativeEvent.contentOffset.y);

    const _checkScroll = (element) => {
      // const {State: TextInputState} = TextInput;


      element =
        element || TextInput.State.currentlyFocusedInput
          ? findNodeHandle(TextInput.State.currentlyFocusedInput())
          : TextInput.State.currentlyFocusedField();

      if (!element || window._isMeasuring || !keyboardHeight) {
        return;
      }

      window._isMeasuring = true;

      // measure the element's position
      UIManager.measure(element, (x, y, w, h, pageX, pageY) => {
        window._isMeasuring = false;

        if (!keyboardHeight) {
          return;
        }

        // true element position to the wrapper
        const clientY = pageY - topOffset - y;
        const viewportHeight = height - keyboardHeight;
        let yPos = scrollY;

        yPos += clientY;

        yPos -= keyboardHeight * 0.5;

        // check for negative scroll position
        if (yPos <= 0) {
          yPos = 0;
        }

        // check if client it's not visible in viewport
        if (clientY + h > viewportHeight || clientY < scrollY) {
          _scrollTo(yPos);
        }
      });
    };

    const _scrollTo = (y = 0, animated = true) => {
      if (scrollView) {
        scrollView.scrollTo({y, x: 0, animated});
      }
    };

    const _scrollToEnd = (animated = true) => {
      if (scrollView) {
        scrollView.scrollToEnd({animated});
      }
    };

    const scrollTo = (...props) => _scrollTo(...props);

    const scrollToEnd = (...props) => _scrollToEnd(...props);

    const hideKeyboard = () => _onKeyboardDown();

    const checkElement = (element) => _checkScroll(element);

    const renderKeyboardView = () => {
      if (!window.keyboardAnimated) {
        return null;
      }
      const animatedStyle = {
        height: window.keyboardAnimated,
      };
      return <Animated.View style={animatedStyle} />;
    };

    return (
      <View style={styles.wrapper}>
        {floatHeader && header}
        <View style={styles.wrapper} onLayout={_onScrollWrapperLayout}>
          <ScrollView
            // bounces={false}
            ref={(el) => {
              scrollView = el;
            }}
            nestedScrollEnabled={nestedScrollEnabled}
            scrollEnabled={!disabled}
            centerContent={centerContent}
            alwaysBounceVertical={alwaysBounceVertical}
            keyboardShouldPersistTaps="handled"
            decelerationRate={decelerationRate}
            automaticallyAdjustContentInsets={false}
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
            contentContainerStyle={contentContainerStyle}
            scrollEventThrottle={1}
            onScroll={_onScrollHandler}
            style={style}>
            {!floatHeader && header}
            {children}
          </ScrollView>
        </View>
        {footer}
        {/* {renderKeyboardView()} */}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
});

export default SmartScrollView;
