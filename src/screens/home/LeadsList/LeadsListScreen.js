import SegmentedControl from '@react-native-segmented-control/segmented-control';
import colors from 'assets/colors';
import Fonts from 'assets/fonts/fonts';
import DrawerHeader from 'components/header/DrawerHeader';
import {normalize, wp} from 'helpers/styles/responsive';
import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import LeadsList from './LeadsList';
import { isTablet } from 'react-native-device-info';

export default function LeadsListScreen({openDrawer}) {
  const [selectedType, setSelectedType] = React.useState(0);
  // Memoize LeadsList components to avoid re-rendering
  const sentList = useMemo(() => <LeadsList value="Sent" />, []);
  const savedList = useMemo(() => <LeadsList value="Saved" />, []);

  return (
    <View key={selectedType.toString()} style={styles.screen}>
      <DrawerHeader openDrawer={openDrawer} hasLeft title={'Leads'} />

      <View style={styles.screen}>
        <View style={styles.segmentContainer} >
        <SegmentedControl
          tintColor={colors.gray_5D7285}
          backgroundColor={'#462201'}
          style={styles.segment}
          values={['Saved Leads', 'Sync Leads']}
          fontStyle={{fontSize: normalize(14), fontFamily: Fonts.regular}}
          activeFontStyle={{fontSize: normalize(14), fontFamily: Fonts.regular}}
          selectedIndex={selectedType}
          onChange={event => {
            setSelectedType(event.nativeEvent.selectedSegmentIndex);
          }}
        />
        </View>
        {selectedType === 1 ? sentList : savedList}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  segment: {
    marginHorizontal: wp(16),
    borderWidth: 1,
    borderColor: colors.blue_2C79FF,
    height: isTablet() ? wp(30) : wp(48),
    marginBottom: wp(8),
  },
  segmentContainer: {
    borderRadius: 20, // Increase border radius
    overflow: 'hidden', // Ensure rounded corners apply correctly
    height: isTablet() ? wp(30) : wp(48), // Increase height
  },
});
