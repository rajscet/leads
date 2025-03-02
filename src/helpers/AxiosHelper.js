import AsyncStorage from '@react-native-async-storage/async-storage';
import Axios from 'axios';

import {PREFERENCE} from '../constants';
import {Utils} from './utils';

Axios.interceptors.request.use(async config => {
  const tabletToken = await AsyncStorage.getItem(PREFERENCE.TABLET_SESSION);
  // const userToken = await AsyncStorage.getItem(PREFERENCE.USER_SESSION);
  const newConfig = {
    ...config,
  };
  if (tabletToken) {
    newConfig.headers['tablet-auth-token'] = tabletToken;
  }
  // if (userToken) {
  //   newConfig.headers['user-auth-token'] = userToken;
  // }
  // if (config.headers['Content-Type'] !== 'application/json') {
  //   newConfig.headers['Content-Type'] = 'multipart/form-data';
  // }
  newConfig.headers.Accept = 'application/json';

  newConfig.timeout = 30000;

  return newConfig;
});

export const configureBaseURL = baseURL => {
  Axios.defaults.baseURL = baseURL;
};

export const postRequestApi = (url, data, headers) =>
  new Promise((resolve, reject) => {
    Axios.post(`${Axios.defaults.baseURL}${url}`, data, headers)
      .then(response => {
        resolve(response?.data);
      })
      .catch(async error => {
        reject(await getApiError(error));
      });
  });

export const postRequestWithFormDataApi = (url, data) =>
  new Promise((resolve, reject) => {
    Axios.post(`${Axios.defaults.baseURL}${url}`, data, {
      headers: {'Content-Type': 'multipart/form-data'},
    })
      .then(response => {
        resolve(response?.data);
      })
      .catch(error => {
        reject(getApiError(error));
      });
  });

export const putRequestWithFormDataApi = (url, data) =>
  new Promise((resolve, reject) => {
    Axios.put(`${Axios.defaults.baseURL}${url}`, data, {
      headers: {'Content-Type': 'multipart/form-data'},
    })
      .then(response => {
        resolve(response?.data);
      })
      .catch(error => {
        reject(getApiError(error));
      });
  });

export const deleteRequestApi = (url, data, headers) =>
  new Promise((resolve, reject) => {
    Axios.delete(`${Axios.defaults.baseURL}${url}`, {data, headers})
      .then(response => {
        resolve(response?.data);
      })
      .catch(async error => {
        reject(await getApiError(error));
      });
  });

export const putRequestApi = (url, data, headers) =>
  new Promise((resolve, reject) => {
    Axios.put(`${Axios.defaults.baseURL}${url}`, data, {
      headers,
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(async error => {
        reject(await getApiError(error));
      });
  });

export const patchRequestApi = (url, data, headers) =>
  new Promise((resolve, reject) => {
    Axios.patch(`${Axios.defaults.baseURL}${url}`, data, {
      headers,
    })
      .then(response => {
        resolve(response?.data);
      })
      .catch(async error => {
        reject(await getApiError(error));
      });
  });

export const getRequestApi = (url, params = undefined, headers) =>
  new Promise((resolve, reject) => {
    Axios.get(
      params
        ? `${Axios.defaults.baseURL}${url}?${new URLSearchParams(
            params,
          ).toString()}`
        : url,
      {headers},
    )
      .then(response => {
        resolve(response?.data);
      })
      .catch(async error => {
        reject(await getApiError(error));
      });
  });

export const getApiError = async error => {
  if (!error?.response || error?.response?.status === 502) {
    return {message: 'Unknown Error Code 502', status: null, error: true};
  }
  // if (error?.response?.status === 500) {
  //   return {message: 'Something Went Wrong.', status: 500, error: true};
  // }
  if (error?.response?.status === 401) {
    const errorMessage = Array.isArray(error?.response?.errors)
      ? error?.response?.errors[0].message
      : error?.response?.data?.message;

    if (errorMessage === 'TABLET_TOKEN_INVALID' || errorMessage === 'TABLET_DISABLED' || errorMessage === 'TABLET_LOCKED') {
      Utils.tabletLogout();
    }
    if (errorMessage === 'USER_TOKEN_INVALID' || errorMessage === 'USER_DISABLED') {
      Utils.userLogout();
    }
  }
  return {
    message: Array.isArray(error?.response?.errors)
    ? Utils.generateDynamicErrorMessage(error?.response?.errors)
    : error?.response?.data?.message,
    status: error?.response?.status,
    error: true,
    errorResponse: error?.response?.data,
    errorCode: error?.response?.data?.errorCode,
  };
};
