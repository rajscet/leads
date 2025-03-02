import NetInfo from '@react-native-community/netinfo';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import colors from 'assets/colors';
import Fonts from 'assets/fonts/fonts';
import Button from 'components/Button';
import FontText from 'components/FontText';
import Header from 'components/header';
import {
  deleteSingleLead,
  getRecordById,
  insertLog,
  updateSyncStatus,
} from 'helpers/dbHelpler';
import {normalize, wp} from 'helpers/styles/responsive';
import {Utils} from 'helpers/utils';
import {useLoader} from 'providers/LoaderProvider';
import React, {useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import Share from 'react-native-share';
import leadService from 'services/leadService';
import LeadAttachment from './LeadAttachment';
import LeadTextDetail from './LeadTextDetail';
import {PREFERENCE} from 'constants/index';
import AsyncStorage from '@react-native-async-storage/async-storage';


const LeadDetailScreen = ({route, navigation}) => {
  const {data, type, role, id, record, isFileSync, isSync, leadId} =
    route.params;
  const {startLoader, stopLoader} = useLoader();
  const [isConnected, setIsConnected] = useState(undefined);
  const [selectedType, setSelectedType] = React.useState(0);
  const leadText = React.useMemo(
    () => (
      <LeadTextDetail
        data={Utils.extractNonArrayFields(data)}
        record={record}
      />
    ),
    [],
  );
  const leadAttachment = React.useMemo(
    () => (
      <LeadAttachment
        data={Utils.extractFieldsWithUri(JSON.parse(record))}
        record={JSON.parse(record)}
        id={id}
        leadId={leadId}
      />
    ),
    [],
  );

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const writeAndShareCSV = async () => {
    try {
      const csvRecord = await getRecordById(id);
      // Parse and flatten the data
      const headers = ['Username', 'Location']; // Rename uname and location
      const rows = [];

      csvRecord.forEach(row => {
        const labelData = JSON.parse(row.label);
        const keys = Object.keys(labelData);
        // Add keys to headers if not already included
        keys.forEach(key => {
          if (!headers.includes(key)) {
            headers.push(key);
          }
        });

        // Create a flattened row
        const flattenedRow = {
          Username: row.uname,
          Location: row.location,
          ...labelData,
        };
        rows.push(flattenedRow);
      });

      // Create CSV string
      const csvString = [
        headers.join(','), // Header row
        ...rows.map(row => headers.map(header => row[header] || '').join(',')), // Data rows
      ].join('\n');

      // Write to file
      const pathToWrite = `${RNFetchBlob.fs.dirs.DocumentDir}/data.csv`;
      await RNFetchBlob.fs.writeFile(pathToWrite, csvString, 'utf8');

      // Share the file
      const shareOptions = {
        title: 'Share CSV File',
        url: `file://${pathToWrite}`,
        type: 'text/csv',
      };

      await Share.open(shareOptions);
    } catch (error) {
      // Alert.alert('Error', error.message);
      console.error(error);
    }
  };

  const deleteLead = async () => {
    Utils.showAlertWithButtons(
      'Delete this Leads!',
      'Are you sure, want to delete this leads?',
      'No',
      'Yes',
      async () => {
        try {
          startLoader();
          await deleteSingleLead(id);
          Alert.alert('Leads deleted successfully');
          navigation.goBack();
          stopLoader();
        } catch (error) {
          Alert.alert('Error while deleting leads:', error);
          stopLoader();
        }
      },
      () => {},
    );
  };

  const onSync = async item => {
    startLoader();
    try {
      if (isConnected) {
        const user = JSON.parse(await AsyncStorage.getItem(PREFERENCE.USER));
        const response = await leadService.createLead({
          leads: [{...JSON.parse(record), tablet_local_id: id}],
          user_id: user.id,
        });
        // console.log(response);
        Utils.updateIsURLSync(record);
        if (response.status === true) {
          updateSyncStatus(response.data[0].id, item.id, true, record);
          Alert.alert('Lead synced successfully');
        } else {
          insertLog(
            'Create Lead from Lead Detail',
            JSON.stringify({leads: [JSON.parse(record)], user_id: user.id}),
            JSON.stringify(response),
            '',
          );
          Alert.alert(JSON.stringify(response));
        }
      } else {
        Alert.alert('No Internet');
      }
    } catch (error) {
      console.error(error); // Handle error appropriately
    } finally {
      stopLoader();
    }
  };

  return (
    <>
      <Header
        hasLeft
        title={'Lead Detail'}
        onBackPress={() => {
          navigation.goBack();
        }}
      />
      <SegmentedControl
        tintColor={colors.gray_5D7285}
        backgroundColor={'#462201'}
        style={styles.segment}
        values={['Text Fields', 'Attachments']}
        fontStyle={{fontSize: normalize(14), fontFamily: Fonts.regular}}
        activeFontStyle={{fontSize: normalize(14), fontFamily: Fonts.regular}}
        selectedIndex={selectedType}
        onChange={event => {
          setSelectedType(event.nativeEvent.selectedSegmentIndex);
        }}
      />

      <View style={styles.buttonContainer}>
        {type === 'Saved' && selectedType === 0 && isSync === 0 && (
          <Button
            buttonHeight={wp(30)}
            onPress={() => {
              onSync();
            }}
            style={styles.button}>
            <FontText
              fontFamily={Fonts.robotRegular}
              size={normalize(15)}
              color={colors.white}>
              {'Sync'}
            </FontText>
          </Button>
        )}
        {role === 'Tablet Super Admin' && selectedType === 0 && (
          <Button
            buttonHeight={wp(30)}
            onPress={() => {
              deleteLead();
            }}
            style={styles.button}>
            <FontText
              fontFamily={Fonts.robotRegular}
              size={normalize(15)}
              color={colors.white}>
              {'Delete'}
            </FontText>
          </Button>
        )}

        {role === 'Tablet Super Admin' && selectedType === 0 && (
          <Button
            onPress={() => {
              writeAndShareCSV();
            }}
            buttonHeight={wp(30)}
            style={styles.button}>
            <FontText
              fontFamily={Fonts.robotRegular}
              size={normalize(15)}
              color={colors.white}>
              {'Export'}
            </FontText>
          </Button>
        )}
      </View>

      {selectedType === 0 ? leadText : leadAttachment}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  sectionContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    width: '100%',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%',
  },
  oddRow: {
    backgroundColor: '#f8f9fa',
  },
  evenRow: {
    backgroundColor: '#e9ecef',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 18,
    width: '45%',
    textAlign: 'left',
  },
  text: {
    fontSize: 18,
    width: '50%',
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-evenly',
    marginBottom: wp(16),
    justifyContent: 'flex-end',
    marginHorizontal: wp(16),
  },
  button: {
    flex: 0.3,
    marginLeft: '5%',
  },
  segment: {
    marginHorizontal: wp(16),
    borderWidth: 1,
    borderColor: colors.blue_2C79FF,
    height: wp(30),
    marginVertical: wp(8),
  },
});

export default LeadDetailScreen;
