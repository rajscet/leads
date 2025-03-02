import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from 'assets/colors';
import SvgIcons from 'assets/svgs/svgIcons';
import {PREFERENCE, ROUTE_NAMES} from 'constants/index';
import {updateSyncFileStatusWithData} from 'helpers/dbHelpler';
import globalStyle from 'helpers/styles';
import {wp} from 'helpers/styles/responsive';
import {Utils} from 'helpers/utils';
import {navigateTo} from 'navigation/navigationHelper';
import {useLoader} from 'providers/LoaderProvider';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import leadService from 'services/leadService';

const LeadListItem = ({
  data,
  onSync,
  type,
  role,
  id,
  record,
  isFileSync,
  isSync,
  leadId,
  onRefresh,
}) => {
  const [leadData, setLeadData] = React.useState(undefined);
  const {startLoader, stopLoader} = useLoader();
  const [contacts, setContacts] = React.useState([]);

  React.useEffect(() => {
    setLeadData(Utils.extractNonArrayFields(data));
    const lead = JSON.parse(record);
    if (lead && Array.isArray(lead?.other_contacts)) {
      setContacts(lead.other_contacts);
    }
  }, []);

  const renderKeyValue = (key, value) => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return (
        <View key={key} style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>{key.replace(/-/g, ' ')}</Text>
          {Object.entries(value).map(([subKey, subValue]) => (
            <View key={subKey} style={styles.row}>
              <Text style={styles.text} numberOfLines={1}>
                {subKey}: {subValue.toString()}
              </Text>
            </View>
          ))}
        </View>
      );
    }

    return (
      <View key={key} style={styles.row}>
        <Text style={styles.label}>{key.replace(/-/g, ' ')}</Text>
        <Text style={styles.text}>{value.toString()}</Text>
      </View>
    );
  };

  const uploadAsset = async asset => {
    if (asset.isSync === 0) {
      const response = await Utils.uploadToMinIO(asset);
      if (response && response.Location) {
        asset.isSync = 1;
        asset.liveUrl = response.Location;
      }
    }
    return asset.liveUrl;
  };

  const uploadImagesAndUpdateLead = async lead => {
    try {
      startLoader();
      const filesArray = Utils.extractFieldsWithUri(lead);
      const uploadedUrls = {};

      // Function to upload an asset with a delay
      const uploadAssetWithDelay = async asset => {
        const liveUrl = await uploadAsset(asset);
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
        return liveUrl;
      };

      // Process all files using map and reduce
      await Promise.all(
        Object.keys(filesArray).map(async key => {
          if (Array.isArray(filesArray[key])) {
            uploadedUrls[key] = await filesArray[key].reduce(
              async (accPromise, item) => {
                const acc = await accPromise;
                const liveUrl = await uploadAssetWithDelay(item);
                return liveUrl ? [...acc, liveUrl] : acc;
              },
              Promise.resolve([]),
            );
          }
        }),
      );

      const user = JSON.parse(await AsyncStorage.getItem(PREFERENCE.USER));
      let leadResponse = {};

      if (isSync === 0) {
        leadResponse = await leadService.createLead({
          leads: [{...lead, ...uploadedUrls, table: id}],
          user_id: user.id,
        });
      } else {
        leadResponse = await leadService.updateLead({
          lead_id: leadId,
          data: uploadedUrls,
        });
      }

      if (leadResponse.status === true) {
        Object.keys(filesArray).forEach(key => {
          if (Array.isArray(filesArray[key])) {
            filesArray[key].forEach(item => {
              if (item.liveUrl) {
                item.isURLSync = 1;
              }
            });
          }
        });
        await updateSyncFileStatusWithData(id, {...lead, filesArray}, true);
        onRefresh();
      }
    } catch (e) {
      console.log('Error', JSON.stringify(e));
    } finally {
      stopLoader();
    }
  };

  return (
    <Pressable
      style={[styles.mainContainer, globalStyle.shadow]}
      onPress={() => {
        navigateTo(ROUTE_NAMES.LEAD_DETAIL, {
          data,
          type,
          role,
          id,
          record,
          isFileSync,
          isSync,
          leadId,
        });
      }}>
      <View style={{alignItems: 'flex-end'}}>
        {type === 'Saved' && isSync === 0 && (
          <Pressable style={styles.syncButtonContainer}>
            <TouchableOpacity
              onPress={() => {
                onSync();
              }}
              style={styles.syncButton}>
              <Text style={styles.syncButtonText}>Sync Text Fields</Text>
            </TouchableOpacity>
          </Pressable>
        )}
        {isFileSync === 0 && (
          <Pressable
            style={[
              styles.syncButtonContainer,
              {marginTop: isSync === 0 ? wp(8) : 0},
            ]}>
            <TouchableOpacity
              onPress={() => {
                uploadImagesAndUpdateLead(JSON.parse(record));
              }}
              style={styles.syncButton}>
              <Text style={styles.syncButtonText}>Sync Attachments</Text>
            </TouchableOpacity>
          </Pressable>
        )}
      </View>
      <View style={styles.container}>
        {leadData &&
          Object.entries(leadData)
            .filter(
              ([_, value]) =>
                value !== undefined && value !== null && value !== '',
            )
            .map(([key, value]) => renderKeyValue(key, value))}
      </View>
      {contacts.length > 0 && (
        <View style={[styles.contactContainer]}>
          <Text style={styles.sectionHeader}>Contacts</Text>
          {contacts.map((contact, index) => (
            <>
              <View key={index} style={[{backgroundColor: 'transparent'}]}>
                {Object.entries(contact).map(([key, value]) => (
                  <View key={key} style={styles.row}>
                    <Text style={styles.label}>
                      {Utils.convertToTitleCase(key)}
                    </Text>
                    <Text style={styles.text} numberOfLines={1}>
                      {value.toString()}
                    </Text>
                  </View>
                ))}
              </View>
              {index !== contacts.length - 1 ? (
                <View style={styles.divider} />
              ) : null}
            </>
          ))}
        </View>
      )}
      <SvgIcons.NextIcon
        style={[styles.next, {top: '45%'}]}
        width={wp(10)}
        color={colors.gray_B9B9B9}
        height={wp(10)}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingVertical: 16,
    paddingLeft: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: wp(5),
    position: 'relative',
  },
  divider: {
    width: '100%',
    backgroundColor: colors.gray_D4D4D4,
    height: wp(1),
    marginVertical: wp(8),
  },
  syncButtonContainer: {
    marginRight: wp(8),
  },
  syncButton: {
    backgroundColor: colors.primary,
    paddingVertical: wp(4),
    paddingHorizontal: wp(12),
    borderRadius: wp(4),
    width: 'auto',
  },
  syncButtonText: {
    color: '#fff',
    fontSize: wp(8),
  },
  container: {
    flex: 1,
    marginTop: wp(20),
  },
  sectionContainer: {
    padding: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    marginRight: wp(8),
  },

  contactContainer: {
    padding: 0,
    borderRadius: 8,
    marginRight: wp(8),
    backgroundColor: 'transparent',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.blue,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
    width: '40%',
  },
  text: {
    fontSize: 16,
    width: '60%',
  },
  next: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{translateY: -wp(5)}],
    fontSize: 16,
    color: colors.gray_B9B9B9,
  },
});

export default React.memo(LeadListItem);
