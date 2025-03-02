import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import colors from 'assets/colors';
import Fonts from 'assets/fonts/fonts';
import Button from 'components/Button';
import FontText from 'components/FontText';
import {PREFERENCE} from 'constants/index';
import {
  deleteAllLeadsSyncFalse,
  deleteAllLeadsSyncTrue,
  getAllLeadsSyncFalse,
  getAllLeadsSyncTrue,
  getAllLeadsTextSyncFalse,
  insertLog,
  updateSyncStatus,
  updateSyncStatusBatch,
} from 'helpers/dbHelpler';
import {normalize, wp} from 'helpers/styles/responsive';
import {Utils} from 'helpers/utils';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import Share from 'react-native-share';
import LeadListItem from './LeadListItem';
import leadService from 'services/leadService';
import {useLoader} from 'providers/LoaderProvider';
import {useFocusEffect} from '@react-navigation/native';

const {width} = Dimensions.get('window');

const LeadsList = ({value}) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(undefined);
  const [isConnected, setIsConnected] = useState(undefined);
  const {startLoader, stopLoader} = useLoader();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch leads where isSync is false
  const fetchLeads = async () => {
    try {
      if (!user) {
        const userJSON = JSON.parse(
          await AsyncStorage.getItem(PREFERENCE.USER),
        );
        setUser(userJSON);
      } else {
        let data = [];
        if (value === 'Sent') {
          data = await getAllLeadsSyncTrue(
            user.role.name === 'Tablet Super Admin',
            user.id,
          );
          console.log('dataX', data);
          //  Alert.alert('Sent');
        } else if (value === 'Saved') {
          data = await getAllLeadsSyncFalse(
            user.role.name === 'Tablet Super Admin',
            user.id,
          );
        }
        console.log('data', data);
        setLeads(data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLoading(false);
    }
  };

  const onSyncMultiple = async () => {
    startLoader();
    try {
      if (isConnected) {
        const unsyncedLeads = await getAllLeadsTextSyncFalse(
          user.role.name === 'Tablet Super Admin',
          user.id,
        );

        if (unsyncedLeads.length === 0) {
          Alert.alert('All leads are already synced');
          return;
        }

        // Prepare the payload for the API
        const leadsPayload = unsyncedLeads.map(lead => {
          ({
            ...Utils.transformObject(JSON.parse(lead.value)),
            tablet_local_id: lead.id,
          });
        });

        // Sync leads via API
        const response = await leadService.createLead({
          leads: leadsPayload,
          user_id: user.id,
        });

        if (response.status === true) {
          // Update each lead's sync status in the database
          for (let i = 0; i < response.data.length; i++) {
            const syncedLead = response.data[i];
            const localLead = unsyncedLeads[i];
            Utils.updateIsURLSync(leadsPayload[i]);
            updateSyncStatus(
              syncedLead.id,
              localLead.id,
              true,
              leadsPayload[i],
            );
          }

          Alert.alert('All leads synced successfully');
        } else {
          insertLog(
            'Create Lead from Lead List',
            JSON.stringify({
              leads: leadsPayload,
              user_id: user.id,
            }),
            JSON.stringify(response),
            '',
          );
          Alert.alert('Failed to sync some leads');
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

  useEffect(() => {
    fetchLeads();
  }, [value, user]);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     fetchLeads();
  //   }, [value]),
  // );

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'BroadcastEvent',
      data => {
        if (data.message === '') {
          fetchLeads();
        }
      },
    );

    // Cleanup the subscription on unmount
    return () => subscription.remove();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate fetching new data after a delay
    setTimeout(async () => {
      await fetchLeads();
      setRefreshing(false);
    }, 2000); // 2 seconds delay
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const onSync = async item => {
    startLoader();
    try {
      if (isConnected) {
        const lead = JSON.parse(item.value);
        const response = await leadService.createLead({
          leads: [{...Utils.transformObject(lead), tablet_local_id: item.id}],
          user_id: user.id,
        });
        Utils.updateIsURLSync(lead);
        if (response.status === true) {
          updateSyncStatus(response.data[0].id, item.id, true, lead);
          fetchLeads();
          Alert.alert('Lead synced successfully');
        } else {
          insertLog(
            'Create Lead',
            JSON.stringify({
              leads: [Utils.transformObject(lead)],
              user_id: user.id,
            }),
            JSON.stringify(response),
            '',
          );
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

  const renderItem = ({item}) => (
    <View style={styles.itemContainer}>
      <LeadListItem
        data={JSON.parse(item.label)}
        id={item.id}
        type={value}
        isSync={item.isSync}
        isFileSync={item.isFileSync}
        role={user.role.name}
        onSync={() => onSync(item)}
        record={item.value}
        leadId={item.lead_id}
        onRefresh={onRefresh}
      />
    </View>
  );

  if (loading) {
    return (
      <ActivityIndicator style={styles.loading} size="large" color="#0000ff" />
    );
  }
  if (leads.length === 0) {
    return (
      <View style={styles.noLeadsContainer}>
        <Text style={styles.noLeadsText}>No Leads Found</Text>
      </View>
    );
  }

  const writeAndShareCSV = async () => {
    try {
      // const hasPermission = await requestWritePermission();
      // if (!hasPermission) {
      //   Alert.alert(
      //     'Permission Denied',
      //     'Cannot save file without storage permission.',
      //   );
      //   return;
      // }
      let data = [];
      if (value === 'Sent') {
        data = await getAllLeadsSyncTrue(
          user.role.name === 'Tablet Super Admin',
          user.id,
        );
        //  Alert.alert('Sent');
      } else if (value === 'Saved') {
        data = await getAllLeadsTextSyncFalse();
        // Alert.alert('Saved');
      }

      // Parse and flatten the data
      const headers = ['Username', 'Location']; // Rename uname and location
      const rows = [];

      data.forEach(row => {
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

  const doDeleteAllLeads = async () => {
    Utils.showAlertWithButtons(
      `Delete ${value} Leads!`,
      `Are you sure, want to delete All ${value} leads?`,
      'No',
      'Yes',
      async () => {
        try {
          setLoading(true);
          if (value === 'Sent') {
            await deleteAllLeadsSyncTrue();
          } else {
            await deleteAllLeadsSyncFalse();
          }
          setLeads([]);
          Alert.alert('All Leads deleted successfully');

          setLoading(false);
        } catch (error) {
          Alert.alert('Error deleting leads:', error);
          setLoading(false);
        }
      },
      () => {},
    );
  };

  return (
    <>
      <View style={styles.buttonContainer}>
        {value === 'Saved' && (
          <Button
            buttonHeight={wp(30)}
            onPress={() => {
              onSyncMultiple();
            }}
            style={styles.button}>
            <FontText
              fontFamily={Fonts.robotRegular}
              size={normalize(14)}
              color={colors.white}>
              {'Sync All Text Lead'}
            </FontText>
          </Button>
        )}
        {user.role.name === 'Tablet Super Admin' && (
          <Button
            buttonHeight={wp(30)}
            onPress={() => {
              doDeleteAllLeads();
            }}
            style={styles.button}>
            <FontText
              fontFamily={Fonts.robotRegular}
              size={normalize(14)}
              color={colors.white}>
              {'Delete All'}
            </FontText>
          </Button>
        )}

        {user.role.name === 'Tablet Super Admin' && (
          <Button
            onPress={() => {
              writeAndShareCSV();
            }}
            buttonHeight={wp(30)}
            style={styles.button}>
            <FontText
              fontFamily={Fonts.robotRegular}
              size={normalize(14)}
              color={colors.white}>
              {'Export'}
            </FontText>
          </Button>
        )}
      </View>
      <FlatList
        data={leads}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.container}
        numColumns={2}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: wp(16),
  },
  item: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minWidth: width / 2 - 24, // Adjusting width for tablet
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1,
  },
  value: {
    fontSize: 14,
    flex: 2,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noLeadsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  noLeadsText: {
    fontSize: normalize(22),
    fontWeight: 'bold',
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginHorizontal: wp(16),
    marginBottom: wp(8),
  },
  button: {
    marginLeft: wp(16),
    minWidth: wp(50),
  },
  columnWrapper: {
    justifyContent: 'space-between', // Ensures items are spaced evenly
    marginBottom: wp(8), // Adds vertical space between rows
  },
  itemContainer: {
    flex: 1,
    margin: wp(4), // Space around each item
  },
});

export default LeadsList;
