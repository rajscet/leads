
/* eslint-disable jsx-a11y/anchor-is-valid */

import React, {useState, forwardRef, useImperativeHandle} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  findNodeHandle,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import Link from 'components/Link';
import {hp, normalize, wp} from 'helpers/styles/responsive';
import Fonts from 'assets/fonts/fonts';
import colors from 'assets/colors';
import FontText from 'components/FontText';

const Input = forwardRef(
  (
    {
      value,
      editable = true,
      height = wp(46),
      fontSize = normalize(16),
      fontFamily = Fonts.robotRegular,
      color = colors.black,
      placeholder = 'Type something...',
      placeholderTextColor = colors.placeHolder,
      blurOnSubmit = false,
      returnKeyType = 'done',
      multiline = false,
      multilineHeight = wp(120),
      keyboardType = 'text',
      autoCapitalize = 'none',
      maxLength,
      secureTextEntry = false,
      inputStyle,
      children,
      style,
      onFocus,
      onBlur,
      autoFocus = false,
      textAlign,
      caretHidden = false,
      contextMenuHidden = false,
      selectTextOnFocus = false,
      pointerEvents,
      onSubmit,
      clearOnSubmit = false,
      willCheckPosition = true,
      checkPosition,
      onChangeText,
      onEndEditing,
      onKeyPress,
      autoCorrect,
      withTitle = false,
      title,
      titleSize = normalize(16),
      withLeftIcon = false,
      withRightIcon = false,
      leftIcon,
      rightIcon,
      fontStyle,
      onRightIconPress,
      isRequired = false,
      pTop,
      pBottom,
    },
    ref
  ) => {
    const [inputValue, setValue] = useState(value);
    const [inputEditable, setEditable] = useState(editable);
    const inputRef = React.useRef();

    React.useEffect(() => {
      setValue(value);
    }, [value]);

    const onChangeTextHandler = (text) => {
      setValue(text);
      if (typeof onChangeText === 'function') {
        onChangeText(text);
      }
    };

    const onSubmitEditingHandler = () => {
      if (typeof onSubmit === 'function') {
        onSubmit(inputValue);
      }
      if (clearOnSubmit) {
        setValue('');
      }
    };

    const onFocusHandler = () => {
      if (typeof onFocus === 'function') {
        onFocus();
      }
      if (willCheckPosition && typeof checkPosition === 'function') {
        checkPosition(findNodeHandle(inputRef.current));
      }
    };

    const _inputStyle = {
      height: multiline ? multilineHeight : height,
      fontSize,
      fontFamily: fontFamily || Fonts.regular,
      color: color || colors.black,
      borderColor:  colors.gray,
      placeholderTextSize: fontSize,
    };

    useImperativeHandle(ref, () => ({
      focus: () => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      },
      blur: () => {
        if (inputRef.current) {
          inputRef.current.blur();
        }
      },
      disable: () => setEditable(false),
      enable: () => setEditable(true),
    }));

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View>
          {withTitle && (
            <FontText
              size={normalize(12)}
              color={colors.gray}
              pTop={pTop}
              pBottom={pBottom}
              style={fontStyle}>
              {title}
              {isRequired && (
                <FontText size={normalize(12)} color={colors.red} pBottom={wp(9)} style={fontStyle}>
                  {'*'}
                </FontText>
              )}
            </FontText>
          )}
          <View style={[styles.wrapper, style, {backgroundColor: !inputEditable ? colors.lightGray : colors.white }]}>
            {withLeftIcon ? leftIcon : null}
            <TextInput
              ref={inputRef}
              textContentType="none"
              pointerEvents={pointerEvents}
              editable={inputEditable}
              value={inputValue}
              textAlign={textAlign}
              autoComplete="off"
              autoCorrect={!!(autoCorrect && autoCorrect === true)}
              allowFontScaling={false}
              placeholder={placeholder}
              placeholderTextColor={placeholderTextColor}
              onChangeText={onChangeTextHandler}
              onSubmitEditing={onSubmitEditingHandler}
              blurOnSubmit={multiline ? false : blurOnSubmit}
              returnKeyType={returnKeyType}
              multiline={multiline}
              underlineColorAndroid="transparent"
              keyboardType={keyboardType}
              maxLength={maxLength}
              autoCapitalize={autoCapitalize}
              secureTextEntry={secureTextEntry}
              onFocus={onFocusHandler}
              onBlur={onBlur}
              onEndEditing={onEndEditing}
              autoFocus={autoFocus}
              caretHidden={caretHidden}
              contextMenuHidden={contextMenuHidden}
              selectTextOnFocus={selectTextOnFocus}
              onKeyPress={onKeyPress}
              style={[
                multiline ? styles.inputMultiline : null,
                styles.input,
                _inputStyle,
                inputStyle,
              ]}
            />
            {children}
            <Link onPress={onRightIconPress}>{withRightIcon ? rightIcon : null}</Link>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
);

const styles = StyleSheet.create({
  input: {
    flex: 1,
    paddingRight: 5,
    paddingTop: 0,
    paddingBottom: 0,
    marginLeft: 0,
    marginRight: 0,

  },
  inputMultiline: {
    textAlignVertical: 'top',
    marginTop: hp(6),
  },
  wrapper: {
    alignItems: 'center',
    backgroundColor: colors.white,
    flexDirection: 'row',
    paddingHorizontal: wp(10),
    borderWidth: wp(2),
    borderRadius: wp(10),
    justifyContent: 'space-between',
    marginBottom: wp(20),
    borderColor: colors.green,


  },
});

export default Input;