/* eslint-disable no-shadow */
import React, {
  createRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Keyboard,
  FlatList,
  Pressable,
  Modal,
} from 'react-native';
import { hp, normalize, wp } from 'helpers/styles/responsive';
import colors from 'assets/colors';
import SvgIcons from 'assets/svgs/svgIcons';
import Fonts from 'assets/fonts/fonts';
import FontText from 'components/FontText';

const Dropdown = forwardRef(
  (
    {
      placeHolder,
      data,
      onItemSelected,
      keyName,
      val,
      isRequired = false,
      fontStyle,
      title,
      style,
      disabled = false,
    },
    ref,
  ) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [value, setValue] = useState(val || placeHolder);
    const textRef = createRef();

    useImperativeHandle(ref, () => ({
      getValue: () => value,
      setValueManually: value => {
        if (value) {
          setValue(value);
        } else {
          setValue(placeHolder);
        }
      },
      focusDropdown: () => {
        setIsModalVisible(true);
      },
    }));

    const handleItemPress = item => {
      Keyboard.dismiss();
      onItemSelected(item);
      setIsModalVisible(false);
      setValue(item[keyName]);
    };

    return (
      <View>
        <FontText
          size={normalize(16)}
          color={colors.black_222222}
          fontFamily={Fonts.robotBold}
          pTop={wp(4)}
          pBottom={hp(4)}
          style={fontStyle}>
          {title}
          {isRequired && (
            <FontText
              size={normalize(16)}
              color={colors.red}
              pBottom={hp(0.9)}
              style={fontStyle}>
              {'*'}
            </FontText>
          )}
        </FontText>

        <View
          style={[
            styles.inputContainer,
            style,
            { backgroundColor: disabled ? colors.gray_D4D4D4 : colors.white },
          ]}>
          <Text
            ref={textRef}
            numberOfLines={1}
            style={styles.input}
            onPress={() => {
              if (!disabled) {
                setIsModalVisible(true);
              }
            }}>
            {value}
          </Text>
          <SvgIcons.NextIcon
            width={wp(7)}
            height={wp(11)}
            color={colors.gray_868686}
            style={styles.downArrow}
          />
        </View>
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsModalVisible(false)}>
          <Pressable
            style={styles.modalContainer}
            onPress={() => setIsModalVisible(false)}>
            <View style={styles.modalView}>
              <FontText
                size={normalize(22)}
                color={colors.black_222222}
                fontFamily={Fonts.robotBold}
                textAlign="center"
                pTop={wp(4)}
                pBottom={hp(4)}
                style={fontStyle}>
                {`Select ${title}`}
                {isRequired && (
                  <FontText
                    size={normalize(22)}
                    color={colors.red}
                    pBottom={hp(0.9)}
                    style={fontStyle}>
                    {'*'}
                  </FontText>
                )}
              </FontText>
              <FlatList
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatList}
                data={data}
                renderItem={({ item }) => (
                  <>
                    <Pressable
                      style={styles.flatlistContainer}
                      onPress={() => handleItemPress(item)}>
                      <Text numberOfLines={1} style={styles.itemText}>
                        {item[keyName]}
                      </Text>
                      <SvgIcons.NextIcon
                        style={styles.next}
                        width={wp(10)}
                        color={colors.gray_B9B9B9}
                        height={wp(22)}
                      />
                    </Pressable>
                    <View style={styles.divider} />
                  </>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
          </Pressable>
        </Modal>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  divider: {
    width: '100%',
    height: wp(1),
    backgroundColor: colors.gray_B9B9B9,
  },
  inputContainer: {
    height: wp(35),
    flexDirection: 'row',
    borderRadius: wp(4),
    paddingHorizontal: wp(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: wp(16),
    borderWidth: wp(0.8),
    borderColor: colors.teal_CCCBCB,
  },
  downArrow: {
    transform: [{ rotate: '90deg' }],
  },
  flatList: {
    marginTop: 4,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    fontSize: normalize(16),
    color: colors.black_231F20,
    fontFamily: Fonts.regular,
  },
  itemText: {
    fontSize: wp(16),
    paddingLeft: wp(20),
    width: Dimensions.get('window').width * 0.83,
    fontFamily: Fonts.regular,
    height: wp(44),
    lineHeight: wp(44),
    color: colors.black_231F20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    paddingHorizontal: wp(10), // Horizontal spacing
    marginVertical: hp(40), // Vertical spacing
  },
  
  modalView: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingTop: 8,
    paddingBottom: wp(16),
    paddingHorizontal: 8,
    elevation: 5, // Adds shadow on Android
    shadowColor: '#000', // Shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  flatlistContainer: {
    justifyContent: 'space-between',
    width: '100%',
    flexDirection: 'row',
  },
  next: {
    marginRight: wp(8),
    alignSelf: 'center',
    color: colors.gray_B9B9B9,
  },
});

export default Dropdown;
