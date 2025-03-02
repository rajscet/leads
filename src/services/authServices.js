// eslint-disable-next-line no-unused-vars
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getRequestApi, postRequestApi, putRequestApi} from '../helpers/AxiosHelper';
import {URLS} from '../helpers/urls';


const doTabletRegister = async (params) => {
  try {
    const response = await postRequestApi(URLS.TABLET_REGISTER, params);
    return response;
  } catch (e) {
    return e;
  }
};

const getUsers = async (params) => {
  try {
    const response = await postRequestApi(URLS.GET_USERS, params);
    return response;
  } catch (e) {
    return e;
  }
};

const userLogin = async (params) => {
  try {
    const response = await postRequestApi(URLS.USER_LOGIN, params);
    return response;
  } catch (e) {
    return e;
  }
};

export default {
  doTabletRegister,
  getUsers,
  userLogin,
};
