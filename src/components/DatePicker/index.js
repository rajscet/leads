
/* eslint-disable prettier/prettier */
import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import moment from 'moment';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {hp, normalize, wp} from 'helpers/styles/responsive';
import colors from 'assets/colors';
import Fonts from 'assets/fonts/fonts';
import SvgIcons from 'assets/svgs/svgIcons';
import FontText from 'components/FontText';

const DatePicker = forwardRef(
  (
    {
      isRequired = false,
      title = '',
      fontStyle = {},
      minimumDate = null,
      maximumDate = null,
      mode = 'date',
      onDateChange,
      defaultDate,
      fontSize = normalize(15),
    },
    ref
  ) => {
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [selectedDate, onChangeSelectedDate] = useState('');

    const showDatePicker = () => {
      setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
      setDatePickerVisibility(false);
    };

    React.useEffect(() => {
      if(defaultDate)
      {
        const formattedDate =
          mode === 'datetime'
            ? moment(defaultDate).format('YYYY-MM-DDTHH:mm') // Updated to 24-hour format
            : mode === 'date'
              ? moment(defaultDate).format('YYYY-MM-DD')
              : moment(defaultDate).format('HH:mm');

        onChangeSelectedDate(formattedDate);
      }
    }, []);
    // YYYY-MM-DD HH:mm:ss
    const handleConfirm = (date) => {
      const formattedDate =
        mode === 'datetime'
          ? moment(date).format('YYYY-MM-DDTHH:mm') // Updated to 24-hour format
          : mode === 'date'
            ? moment(date).format('YYYY-MM-DD')
            : moment(date).format('HH:mm');
      onChangeSelectedDate(formattedDate);
      hideDatePicker();

      // Call the onDateChange prop if it exists
      if (onDateChange) {
        onDateChange(date);
      }
    };

    useImperativeHandle(ref, () => ({
      getValue: () => selectedDate,
      setValue: (date) => {
        if (date) {
          const formattedDate =
            mode === 'datetime'
              ? moment(date).format('YYYY-MM-DDTHH:mm') // Updated to 24-hour format
              : mode === 'date'
                ? moment(date).format('YYYY-MM-DD')
                : moment(date).format('HH:mm');
          onChangeSelectedDate(formattedDate);
        } else {
          onChangeSelectedDate('');
        }
      },
    }));

    return (
      <View style={styles.inputItemBox}>
        <FontText
          size={normalize(12)}
          color={colors.gray}
          pTop={wp(4)}
          style={fontStyle}
          pBottom={hp(0.9)}>
          {title}
          {isRequired && (
            <FontText size={normalize(12)} color={colors.red} pBottom={hp(9)} style={fontStyle}>
              {'*'}
            </FontText>
          )}
        </FontText>
        <Pressable onPress={showDatePicker} style={styles.dobContainer}>
          <FontText style={{marginRight: wp(10)}} color={colors.black_231F20} fontFamily={Fonts.regular} size={fontSize}>
            {selectedDate ||
              (mode === 'datetime'
                ? 'YYYY-MM-DDTHH:mm'
                : mode === 'date'
                  ? 'YYYY-MM-DD'
                  : 'HH:mm')}
          </FontText>
          {mode === 'date' ? <SvgIcons.CalendarIcon /> : <SvgIcons.WatchIcon />}
        </Pressable>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode={mode}
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          minimumDate={mode === 'date' ? minimumDate : undefined}
          maximumDate={mode === 'date' ? maximumDate : undefined}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  inputItemBox: {
    marginTop: wp(6),
  },
  dobContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(12),
    borderRadius: wp(4),
    marginBottom: wp(10),
    height: wp(45),
    backgroundColor: colors.lightGray2,
  },
});

export default DatePicker;
