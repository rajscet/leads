/* eslint-disable no-unused-vars */
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFetchBlob from 'react-native-blob-util';
import {PREFERENCE, ROUTE_NAMES} from 'constants/index';
import {resetNavigate} from 'navigation/navigationHelper';
import {Alert, PermissionsAndroid} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import AWS from 'aws-sdk';
import {Config} from './config';

const writeConsole = (message, key = 'CONSOLE') => {
  if (Config.DEBUG) {
    console.log(key, message);
  }
};

async function requestMediaPermissions() {
  const permissions = [
    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES, // For images
    PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO, // For videos
  ];

  const granted = await PermissionsAndroid.requestMultiple(permissions);
  return Object.values(granted).every(
    status => status === PermissionsAndroid.RESULTS.GRANTED,
  );
}

const formatPhoneNumber = phone => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length > 3 && cleaned.length <= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else if (cleaned.length > 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6,
      10,
    )}`;
  }
  return cleaned;
};

/* const configureMinIO = () => {
  AWS.config.update({
    accessKeyId: '1ipAlVRm31mDoCTdnnbG', // Replace with your MinIO access key
    secretAccessKey: 'CCTITYWMs1H71OjICR0oAwUR9y6Y9juaAn5BynTF', // Replace with your MinIO secret key
    region: 'us-east-1', // Dummy region
  });

  const s3 = new AWS.S3({
    endpoint: 'https://minio.staging.leads.empireeto.com', // Replace with your MinIO endpoint
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
  });

  return s3;
}; */


const configureMinIO = () => {
  AWS.config.update({
    accessKeyId: 'oHr099IcVfoHUo4bfIZn', // Replace with your MinIO access key
    secretAccessKey: 'UhbBvAeNKkWd4EDXCufIx3md2A8TwL1KqZJ2vrX0', // Replace with your MinIO secret key
    region: 'us-east-1', // Dummy region
  });

  const s3 = new AWS.S3({
    endpoint: 'https://minio.leads.empiresas.com',
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
  });

  return s3;
};


const removeNonDigits = str => {
  return str.replace(/\D/g, '');
};

const extractBusinessCardDetails = text => {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  const phoneRegex =
    /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{4}/g;
  const websiteRegex =
    /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const nameRegex = /^[A-Z][a-z]+\s[A-Z][a-z]+/;
  const pincodeRegex = /\b\d{5,6}\b/g;

  // US States List
  const statesList = new Set([
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
    "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA",
    "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC", "AS", "GU", "MP", "PR", "VI"
  ]);

  // Extract emails, phones, websites, and pincodes
  const emails = text.match(emailRegex) || [];
  const phones = text.match(phoneRegex) || [];
  const websites = text.match(websiteRegex) || [];
  const pincodes = text.match(pincodeRegex) || [];

  let remainingText = text
    .replace(emailRegex, '')
    .replace(phoneRegex, '')
    .replace(websiteRegex, '')
    .replace(pincodeRegex, '')
    .trim();

  // Extract Name
  const nameMatch = remainingText.match(nameRegex);
  const name = nameMatch ? nameMatch[0] : '';

  if (name) {
    remainingText = remainingText.replace(name, '').trim();
  }

  // Process remaining lines
  let lines = remainingText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line);

  let company = '';
  let addressLines = [];
  let city = '';
  let state = '';

  for (let line of lines) {
    if (!company && /^[A-Za-z\s&.,-]+$/.test(line) && !/\d+/.test(line)) {
      company = line;
    } else if (/\d+/.test(line) || /[A-Za-z]/.test(line)) {
      addressLines.push(line);
    }
  }

  // **Extract city and state**
  for (let i = 0; i < addressLines.length; i++) {
    let line = addressLines[i];
    let nextLine = addressLines[i + 1] || '';

    // Case 1: City and state separated by a comma (e.g., "HARPERSVILLE, AL")
    let cityStateMatch = line.match(/([\w\s]+?)\s*,\s*([A-Z]{2})\b/);
    if (cityStateMatch && statesList.has(cityStateMatch[2])) {
      city = cityStateMatch[1].trim();
      state = cityStateMatch[2].trim();
      break;
    }

    // Case 2: City and state separated by a space (e.g., "Houston TX")
    cityStateMatch = line.match(/([\w\s]+?)\s+([A-Z]{2})\b/);
    if (cityStateMatch && statesList.has(cityStateMatch[2])) {
      city = cityStateMatch[1].trim();
      state = cityStateMatch[2].trim();
      break;
    }

    // Case 3: City and state on separate lines (e.g., "Duluth,", "GA")
    cityStateMatch = line.match(/([\w\s]+?)\s*,\s*/);
    if (cityStateMatch && nextLine.match(/\b([A-Z]{2})\b/) && statesList.has(nextLine.match(/\b([A-Z]{2})\b/)[1])) {
      city = cityStateMatch[1].trim();
      state = nextLine.match(/\b([A-Z]{2})\b/)[1].trim();
      break;
    }
  }

  return {
    name,
    company,
    emails,
    phones,
    websites,
    address: addressLines,
    city,
    state,
    pincodes,
  };
};


const extractFieldsWithUriAndIsSync = obj =>
  Object.entries(obj)
    .filter(([_, value]) => Array.isArray(value)) // Keep only array fields
    .reduce((acc, [key, array]) => {
      const filteredItems = array.filter(
        ({uri, isSync}) => uri && isSync === 1,
      ); // Filter items with `uri` and `isSync: 1`
      if (filteredItems.length) acc[key] = filteredItems; // Add to result if not empty
      return acc;
    }, {});

const uploadToMinIO = async asset => {
  console.log('assets', asset);
  const s3 = configureMinIO();
  const fileName = asset.name || `photo-${Date.now()}.jpg`;

  try {
    // Fetch the file as a blob
    const response = await fetch(asset.uri);
    const blob = await response.blob();

    // Upload the file to MinIO
    const params = {
      Bucket: 'leads', // Replace with your bucket name
      Key: fileName,
      Body: blob,
      ContentType: asset.mime,
    };

    const data = await s3.upload(params).promise();
    // console.log('Location:', data.Location);
    return data;
  } catch (error) {
    throw error;
    //  Alert.alert('Error', 'An unexpected error occurred');
  }
};

const generateFormatted128BitId = () => {
  const hex = [...Array(4)]
    .map(() =>
      Math.floor(Math.random() * 0xffffffff)
        .toString(16)
        .padStart(8, '0'),
    )
    .join('');

  // Insert dashes in the UUID format: 8-4-4-4-12
  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(
    12,
    16,
  )}-${hex.substring(16, 20)}-${hex.substring(20)}`;
};

const totalIsSyncZeroCount = data =>
  Object.keys(data).reduce((total, key) => {
    const value = data[key];

    // Check if the value is an array
    if (Array.isArray(value)) {
      // Add the count of items where isSync === 0
      total += value.filter(item => item.isSync === 0).length;
    }
    return total;
  }, 0);

const isAnyFileField = data =>
  Object.keys(data).reduce((total, key) => {
    const value = data[key];
    // Check if the value is an array
    if (Array.isArray(value)) {
      // Add the count of items where isSync === 0
      total += value.filter(item => item.url).length;
    }
    return total;
  }, 0);

const transformObject = data => {
  // Create a deep copy of the object to avoid mutating the original data
  const transformedData = JSON.parse(JSON.stringify(data));

  // Iterate over each key in the object
  Object.keys(transformedData).forEach(key => {
    const value = transformedData[key];

    // Check if the value is an array
    if (Array.isArray(value)) {
      // Check if the array contains objects with the `liveUrl` property
      const containsLiveUrl = value.every(
        item => typeof item === 'object' && item !== null && 'liveUrl' in item,
      );

      // If all items have a `liveUrl` property, transform the array
      if (containsLiveUrl) {
        transformedData[key] = value
          .map(item => (item.liveUrl ? item.liveUrl : null))
          .filter(url => url !== null || url !== '');
      }
    }
  });

  return transformedData;
};

const showAlert = (title, message) => {
  Alert.alert(title, message);
};

const showAlertWithButtons = (
  title,
  message,
  negativeButtonText = '',
  positiveButtonText = '',
  onAction,
  onReject,
) => {
  const buttons = [
    {
      text: negativeButtonText,
      onPress: () => (onReject ? onReject() : null),
    },
    {
      text: positiveButtonText,
      onPress: () => onAction(),
    },
  ];
  Alert.alert(title, message, buttons);
};

const getFileNameFromURL = filePath => {
  const fileName = `${new Date().getTime()}${'.'}${filePath.split('.').pop()}`;
  return fileName;
};

const downloadFile = url => {
  const {dirs} = ReactNativeBlobUtil.fs;
  ReactNativeBlobUtil.config({
    fileCache: true,
    appendExt: 'pdf',
    path: `${dirs.DocumentDir}/dummy.pdf`,
    addAndroidDownloads: {
      useDownloadManager: true,
      notification: true,
      title: 'receipt_pdf.pdf',
      description: 'File downloaded by download manager.',
      mime: 'application/pdf',
    },
  })
    .fetch('GET', url)
    .then(res => {
      // in iOS, we want to save our files by opening up the saveToFiles bottom sheet action.
      // whereas in android, the download manager is handling the download for us.
      // const filePath = res.path();
      // const options = {
      //   type: 'application/pdf',
      //   url: filePath,
      //   saveToFiles: true,
      // };
      // Share.open(options)
      //   .then((resp) => console.log(resp))
      //   .catch((err) => console.log(err));
    })
    .catch(err => console.log('BLOB ERROR -> ', err));
};

const setName = displayName => {
  if (displayName) {
    return displayName;
  }
  return 'Unnamed';
};

const getFileNameFromURI = filePath => {
  const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
  return fileName;
};

const generateDynamicErrorMessage = errors => {
  // Build the error messages dynamically
  const messages = errors.map(error => {
    // Extract the field name from the path
    const fieldPath = Array.isArray(error.path)
      ? error.path.join('.')
      : error.path;
    const fieldLabel = fieldPath.replace(/_/g, ' '); // Replace underscores with spaces for readability
    return `${fieldLabel.charAt(0).toUpperCase() + fieldLabel.slice(1)}: ${
      error.message
    }`;
  });

  // Combine messages into a single string (or return an array for further processing)
  return messages.join('\n');
};

const tabletLogout = async () => {
  await AsyncStorage.clear();
  resetNavigate(ROUTE_NAMES.AUTH_STACK);
};

const convertToTitleCase = snakeCaseString => {
  return snakeCaseString
    .split('_') // Split the string into words using underscore as the delimiter
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(' '); // Join the words with a space
};

const userLogout = async () => {
  // await AsyncStorage.removeItem(PREFERENCE.USER_SESSION);
  await AsyncStorage.removeItem(PREFERENCE.IS_USER_LOGGED_IN);
  resetNavigate(ROUTE_NAMES.USER_LOGIN);
};

const extractFieldsWithUri = obj =>
  Object.entries(obj)
    .filter(([_, value]) => Array.isArray(value)) // Keep only array fields
    .reduce((acc, [key, array]) => {
      const itemsWithUri = array.filter(({uri}) => uri); // Filter items with `uri`
      if (itemsWithUri.length) acc[key] = itemsWithUri; // Add to result if not empty
      return acc;
    }, {});

const extractNonArrayFields = obj =>
  Object.entries(obj)
    .filter(([_, value]) => !Array.isArray(value)) // Filter out array fields
    .reduce((acc, [key, value]) => {
      acc[key] = value; // Add non-array fields to the result
      return acc;
    }, {});

const updateIsURLSync = obj => {
  const traverseAndUpdate = item => {
    if (Array.isArray(item)) {
      // If it's an array, loop through its elements
      for (const element of item) {
        traverseAndUpdate(element);
      }
    } else if (item && typeof item === 'object') {
      // If it's an object, loop through its entries
      for (const [key, value] of Object.entries(item)) {
        // Check if `isSync` is 1 and `isURLSync` exists
        if (key === 'isSync' && value === 1 && 'isURLSync' in item) {
          item.isURLSync = 1;
        }
        // Recursively process the nested objects or arrays
        traverseAndUpdate(value);
      }
    }
  };
  traverseAndUpdate(obj);
};

const getLiveURLs = input =>
  Object.entries(input).reduce((acc, [key, value]) => {
    if (Array.isArray(value)) {
      const urls = value
        .filter(item => item.isSync === 1 && item.liveUrl)
        .map(item => item.liveUrl);

      if (urls.length > 0) {
        acc[key] = urls;
      }
    }
    return acc;
  }, {});

export const Utils = {
  writeConsole,
  getFileNameFromURL,
  getFileNameFromURI,
  showAlert,
  showAlertWithButtons,
  setName,
  downloadFile,
  tabletLogout,
  userLogout,
  convertToTitleCase,
  generateDynamicErrorMessage,
  uploadToMinIO,
  extractFieldsWithUriAndIsSync,
  extractFieldsWithUri,
  extractNonArrayFields,
  requestMediaPermissions,
  transformObject,
  formatPhoneNumber,
  totalIsSyncZeroCount,
  getLiveURLs,
  isAnyFileField,
  updateIsURLSync,
  extractBusinessCardDetails,
  generateFormatted128BitId,
  removeNonDigits,
};
