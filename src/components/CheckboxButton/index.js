import React from 'react';
import {
    StyleSheet,
    View,
    Image,
    Text,
    TouchableHighlight,
    ViewPropTypes as RNViewPropTypes,
} from 'react-native';
import PropTypes from 'prop-types';
import SvgIcons from 'assets/svgs/svgIcons';
import { wp } from 'helpers/styles/responsive';

const ViewPropTypes = RNViewPropTypes || View.propTypes;

const CheckboxButton = ({
    leftText,
    leftTextView,
    rightText,
    leftTextStyle = {},
    rightTextView,
    rightTextStyle = {},
    checkedImage,
    unCheckedImage,
    onClick,
    isChecked = false,
    isIndeterminate = false,
    indeterminateImage,
    checkBoxColor,
    checkedCheckBoxColor,
    uncheckedCheckBoxColor,
    disabled,
    style
}) => {
    const renderLeft = () => {
        if (leftTextView) return leftTextView;
        if (!leftText) return null;
        return (
            <Text style={[styles.leftText, leftTextStyle]}>{leftText}</Text>
        );
    };

    const renderRight = () => {
        if (rightTextView) return rightTextView;
        if (!rightText) return null;
        return (
            <Text style={[styles.rightText, rightTextStyle]}>{rightText}</Text>
        );
    };

    const getCheckedCheckBoxColor = () => {
        return checkedCheckBoxColor || checkBoxColor;
    };

    const getUncheckedCheckBoxColor = () => {
        return uncheckedCheckBoxColor || checkBoxColor;
    };

    const getTintColor = () => {
        return isChecked ? getCheckedCheckBoxColor() : getUncheckedCheckBoxColor();
    };

    const genCheckedImage = () => {
        let source;
        if (isIndeterminate) {
            source = <SvgIcons.CheckBoxSelected width={wp(24)} height={wp(24)} />;
        } else {
            source = isChecked
                ? <SvgIcons.CheckBoxSelected width={wp(20)} height={wp(20)} />
                : <SvgIcons.CheckBox width={wp(20)} height={wp(20)} />;
        }
        return source;
    };

    const renderImage = () => {
        if (isIndeterminate) {
            return indeterminateImage || genCheckedImage();
        }
        return isChecked ? (checkedImage || genCheckedImage()) : (unCheckedImage || genCheckedImage());
    };

    return (
        <TouchableHighlight
            style={style}
            onPress={onClick}
            underlayColor='transparent'
            disabled={disabled}
        >
            <View style={styles.container}>
                {renderLeft()}
                {renderImage()}
                {renderRight()}
            </View>
        </TouchableHighlight>
    );
};

CheckboxButton.propTypes = {
    ...ViewPropTypes,
    leftText: PropTypes.string,
    leftTextView: PropTypes.element,
    rightText: PropTypes.string,
    leftTextStyle: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.object,
    ]),
    rightTextView: PropTypes.element,
    rightTextStyle: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.object,
    ]),
    checkedImage: PropTypes.element,
    unCheckedImage: PropTypes.element,
    onClick: PropTypes.func.isRequired,
    isChecked: PropTypes.bool,
    isIndeterminate: PropTypes.bool,
    indeterminateImage: PropTypes.element,
    checkBoxColor: PropTypes.string,
    checkedCheckBoxColor: PropTypes.string,
    uncheckedCheckBoxColor: PropTypes.string,
    disabled: PropTypes.bool,
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    leftText: {
        flex: 1,
    },
    rightText: {
        flex: 1,
        marginLeft: 10,
    },
});

export default CheckboxButton;
