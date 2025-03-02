// eslint-disable-next-line no-unused-vars
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getRequestApi, postRequestApi, putRequestApi} from '../helpers/AxiosHelper';
import {URLS} from '../helpers/urls';
import { PREFERENCE } from 'constants/index';

const getCustomer = async (params) => {
  try {
    const response = await getRequestApi(URLS.GET_CUSTOMER, params);
    return response;
  } catch (e) {
    return e;
  }
};




export default {
  getCustomer,
};
