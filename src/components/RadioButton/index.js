import SvgIcons from 'assets/svgs/svgIcons';
import React, {useImperativeHandle} from 'react';
import {View} from 'react-native';

const RadioButton = React.forwardRef(({style, isSelected, width, height}, ref) => {
  const [selected, setSelected] = React.useState(isSelected);

  const toggleView = () => {
    setSelected(!selected);
  };

  useImperativeHandle(ref, () => ({
    getSelectedValue() {
      return selected;
    },
    toggleView() {
      toggleView();
    },
    selectView() {
      setSelected(true);
    },
    unSelectView() {
      setSelected(false);
    },
  }));

  return (
    <View style={[style]}>
      {selected ? (
        <SvgIcons.ProfileIcon width={width} height={height} />
      ) : (
        <SvgIcons.Close width={width} height={height} />
      )}
    </View>
  );
});

export default RadioButton;
