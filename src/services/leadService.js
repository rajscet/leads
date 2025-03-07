// eslint-disable-next-line no-unused-vars
// import {Bugfender} from '@bugfender/rn-bugfender';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {PREFERENCE} from 'constants/index';
import {
  getAllLeadsTextSyncFalse,
  insertLog,
  updateSyncFileStatusWithData,
  updateSyncStatus,
} from 'helpers/dbHelpler';
import {Utils} from 'helpers/utils';
import {DeviceEventEmitter} from 'react-native';
import {
  getRequestApi,
  postRequestApi,
  putRequestApi,
} from '../helpers/AxiosHelper';
import {URLS} from '../helpers/urls';

const syncMultipleLeadInBackground = async () => {
  try {
    // Fetch all unsynced records
    const user = JSON.parse(await AsyncStorage.getItem(PREFERENCE.USER));
    if (!user || !user.id || !user.role.name) {
      return;
    }
    const role = user.role.name;
    const userId = user.id;

    const unsyncedLeads = await getAllLeadsTextSyncFalse(
      role === 'Tablet Super Admin',
      userId,
    );
    // Prepare the payload for the API
    const leadsPayload = unsyncedLeads.map(lead => ({
      ...JSON.parse(lead.value),
      tablet_local_id: lead.id,
    }));

    // Sync leads via API
    const response = await createLead({leads: leadsPayload, user_id: user.id});

    if (response && response?.status === true) {
      // Extract local IDs and synced API IDs
      for (let i = 0; i < response.data.length; i++) {
        const syncedLead = response.data[i];
        const localLead = unsyncedLeads[i];
        Utils.updateIsURLSync(leadsPayload[i]);
        await updateSyncStatus(
          syncedLead.id,
          localLead.id,
          true,
          leadsPayload[i],
        );
      }
      DeviceEventEmitter.emit('BroadcastEvent', {
        message: 'leadSyncedBackground',
      });
    } else {
      insertLog(
        'Create Lead',
        JSON.stringify({leads: leadsPayload, user_id: user.id}),
        JSON.stringify(response),
        '',
      );
    }
  } catch (error) {
    console.error(error); // Handle error appropriately
  }
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

const uploadAttachmentInBackground = async (lead, id, leadId, isSync) => {
  try {
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
      leadResponse = await createLead({
        leads: [{...lead, ...uploadedUrls, tablet_local_id: id}],
        user_id: user.id,
      });
    } else {
      leadResponse = await updateLead({
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
    }
  } catch (e) {
    console.log('Errorsdsd', JSON.stringify(e));
  }
};

const getAllLocations = async params => {
  try {
    const response = await postRequestApi(URLS.GET_LOCATIONS, params);
    return response;
  } catch (e) {
    return e;
  }
};

const createLead = async params => {
  try {
    if (params.leads && params.leads.length > 0) {
      const response = await postRequestApi(URLS.CREATE_LEAD, params);
      return response;
    }
  } catch (e) {
    return e;
  }
};

const updateLead = async params => {
  try {
    const response = await putRequestApi(URLS.UPDATE_LEAD, params);
    return response;
  } catch (e) {
    return e;
  }
};

const getAllLeads = async params => {
  try {
    const response = await postRequestApi(URLS.GET_ALL_LEADS, params);
    return response;
  } catch (e) {
    return e;
  }
};

const getLeadFields = async locationId => {
  try {
    const response = await getRequestApi(
      `${URLS.GET_LEAD_FIELDS}/${locationId}`,
    );
    return response;
  } catch (e) {
    return e;
  }
};

export default {
  getAllLocations,
  createLead,
  getAllLeads,
  updateLead,
  getLeadFields,
  syncMultipleLeadInBackground,
  uploadAttachmentInBackground,
};
