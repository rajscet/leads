import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import textRecognition from '@react-native-ml-kit/text-recognition';
import Share from 'react-native-share';
import colors from 'assets/colors';
import Fonts from 'assets/fonts/fonts';
import LocalImages from 'assets/images/localImages';
import SvgIcons from 'assets/svgs/svgIcons';
import Button from 'components/Button';
import CheckboxButton from 'components/CheckboxButton';
import DatePicker from 'components/DatePicker'; // Import DatePicker Component
import Dropdown from 'components/Dropdown';
import FontText from 'components/FontText';
import useDidMountEffect from 'components/UseDidMountEffect';
import {PREFERENCE} from 'constants/index';
import {insertLog, insertRecord, updateSyncStatus} from 'helpers/dbHelpler';
import {isAndroid, isIOS, normalize, wp} from 'helpers/styles/responsive';
import {Utils} from 'helpers/utils';
import {isEmailValid, isPhoneValid} from 'helpers/validation';
import {useLoader} from 'providers/LoaderProvider';
import React, {useRef, useState} from 'react';
import {pick, types} from '@react-native-documents/picker';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import RadioGroup from 'react-native-radio-buttons-group';
import leadService from 'services/leadService';
import {isTablet} from 'react-native-device-info';

const DynamicForm = ({}) => {
  const {startLoader, stopLoader} = useLoader();
  const [isConnected, setIsConnected] = useState(undefined);
  const [fileInputs, setFileInputs] = useState({});
  const [formValues, setFormValues] = useState({other_contacts: []});
  const [imageUri, setImageUri] = useState(null);
  const [extractedText, setExtractedText] = useState('');

  const contactFields = [
    {name: 'first_name', label: 'First Name', type: 'text', required: true},
    {name: 'last_name', label: 'Last Name', type: 'text', required: true},
    {name: 'phone', label: 'Phone', type: 'phone', required: true},
    {name: 'email', label: 'Email', type: 'email', required: true},
    {name: 'company', label: 'Company Name', type: 'text', required: true},
  ];

  const [formLabels, setFormLabels] = useState({});
  const [isPasswordSet, setIsPasswordSet] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const inputRefs = useRef([]);
  const datePickersRef = useRef({}); // Ref for multiple DatePickers
  const [formData, setFormData] = useState([]);
  const MAX_FILE_SIZE = isAndroid ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
  const [maxContacts, setMaxContacts] = useState(0);
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const dropdownRefs = useRef({});
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const keyboardVerticalOffset = Platform.OS === 'ios' ? wp(80) : 0;

  const processImage = async uri => {
    try {
      const result = await textRecognition.recognize(uri);
      const detectedText = result.blocks.map(block => block.text).join('\n');
      setExtractedText(detectedText || 'No text detected');
    } catch (error) {
      console.error('OCR Error:', error);
    }
  };

  const getStateLabel = (input, formFields) => {
    // Find the item with name "state"
    const stateItem = formFields.find(field => field.name === 'state');
    if (!stateItem || !stateItem.values) return null;

    // Loop through the values array to find a match (case-insensitive)
    for (const option of stateItem.values) {
      if (
        option.label.toLowerCase() === input.toLowerCase() ||
        option.value.toLowerCase() === input.toLowerCase()
      ) {
        return option.label;
      }
    }
    return input; // No match found
  };

  useDidMountEffect(() => {
    if (extractedText) {
      const businessCard = Utils.extractBusinessCardDetails(extractedText);
      console.log('businessCard', businessCard);
      setFormValues(prev => {
        let updatedValues = {...prev};

        // Handle Name
        if (businessCard.name) {
          const nameParts = businessCard.name.split(' ');
          if (prev.first_name !== undefined && prev.last_name !== undefined) {
            updatedValues.first_name = nameParts[0] || '';
            updatedValues.last_name = nameParts[1] || '';
          } else if (prev.first_name !== undefined) {
            updatedValues.first_name = businessCard.name;
          }
        }

        // Handle Other Fields (Assigning First Element of Array)
        if (businessCard.company?.length) {
          updatedValues.company = businessCard.company;
        }
        if (businessCard.emails?.length) {
          updatedValues.email = businessCard.emails[0];
        }
        if (businessCard.phones?.length) {
          updatedValues.phone = Utils.formatPhoneNumber(
            Utils.removeNonDigits(businessCard.phones[0]),
          );
        }
        if (businessCard.websites?.length) {
          updatedValues.website = businessCard.websites[0];
        }
        if (businessCard.address?.length) {
          updatedValues.address = businessCard.address[0];
        }
        if (businessCard.address?.length) {
          updatedValues.address_1 = businessCard.address[0];
        }
        if (businessCard.address?.length > 1) {
          updatedValues.address_2 = businessCard.address[1];
        }
        if (businessCard.pincodes?.length) {
          updatedValues.postal_code = businessCard.pincodes[0];
        }
        if (businessCard.city) {
          updatedValues.city = businessCard.city;
        }
        if (businessCard.state) {
          dropdownRefs.current['state']?.setValueManually(
            getStateLabel(businessCard.state, formData),
          );
        }

        return updatedValues;
      });
    }
  }, [extractedText]);

  const getLocation = async () => {
    startLoader();
    try {
      setShowPassword(
        await AsyncStorage.getItem(PREFERENCE.LOCATION_SET_PASSWORD),
      );
      const contactsCount =
        (await AsyncStorage.getItem(PREFERENCE.MULTIPLE_CONTACT_COUNT)) || 0;
      setMaxContacts(parseInt(contactsCount, 10));
      const fields = await AsyncStorage.getItem(PREFERENCE.LEAD_FIELDS);
      if (fields) {
        const form = JSON.parse(fields);
        setFormData(form);
      }
    } catch (e) {
      Alert.alert(e.message);
    } finally {
      stopLoader();
    }
    stopLoader();
  };

  useDidMountEffect(() => {
    if (maxContacts > 0) {
      handleAddNewContact();
    }
  }, [maxContacts]);

  const handleAddNewContact = () => {
    if (formValues.other_contacts.length < maxContacts) {
      const newContact = {};
      contactFields.forEach(field => (newContact[field.name] = ''));
      setFormValues(prev => ({
        ...prev,
        other_contacts: [...prev.other_contacts, newContact],
      }));
      setCurrentFormIndex(formValues.other_contacts.length);
    } else {
      Alert.alert(
        'Limit Reached',
        `You can add up to ${maxContacts} contacts.`,
      );
    }
  };

  const handleRemoveContact = index => {
    if (formValues.other_contacts.length > 1) {
      const updatedContacts = [...formValues.other_contacts];
      updatedContacts.splice(index, 1);
      setFormValues(prev => ({...prev, other_contacts: updatedContacts}));
      setCurrentFormIndex(Math.max(0, index - 1));
    }
  };

  const handleContactInputChange = (index, field, value, type) => {
    const updatedContacts = [...formValues.other_contacts];
    updatedContacts[index][field] =
      type === 'phone' ? Utils.formatPhoneNumber(value) : value;
    setFormValues(prev => ({...prev, other_contacts: updatedContacts}));

    setErrors(prevErrors => {
      const newErrors = {...prevErrors};
      if (newErrors.other_contacts && newErrors.other_contacts[index]) {
        newErrors.other_contacts[index][field] = '';
      }
      return newErrors;
    });
  };

  const validateContacts = () => {
    if (maxContacts === 0) {
      return true;
    }
    const newErrors = formValues.other_contacts.map(contact => {
      let contactErrors = {};
      contactFields.forEach(field => {
        if (field.required && !contact[field.name]) {
          contactErrors[field.name] = `${field.label} is required`;
        }
        if (
          field.type === 'email' &&
          contact[field.name] &&
          !isEmailValid(contact[field.name])
        ) {
          contactErrors[field.name] = 'Valid Email is required';
        }
        if (
          field.type === 'phone' &&
          contact[field.name] &&
          !isPhoneValid(contact[field.name])
        ) {
          contactErrors[field.name] = 'Valid Phone is required';
        }
      });
      return contactErrors;
    });

    setErrors(prev => ({...prev, other_contacts: newErrors}));

    const firstErrorIndex = newErrors.findIndex(
      error => Object.keys(error).length > 0,
    );
    if (firstErrorIndex !== -1) {
      setCurrentFormIndex(firstErrorIndex);
      return false;
    }
    return true;
  };

  React.useEffect(() => {
    getLocation();
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const setInitialValues = async () => {
    if (formData && formData.length > 0) {
      const initialValues = {
        location_id: await AsyncStorage.getItem(PREFERENCE.LOCATION_ID),
      };
      const initialLables = {};
      formData.forEach(field => {
        if (field.type === 'checkbox-group') {
          initialValues[field.name] = [];
          initialLables[field.label] = '';
        } else if (field.type === 'radio-group') {
          const selectedRadio = field.values.find(v => v.selected);
          initialValues[field.name] = selectedRadio
            ? [selectedRadio.value]
            : [];
          initialLables[field.label] = selectedRadio ? selectedRadio.label : '';
        } else if (field.type === 'select') {
          const selectedOption = field.values.find(v => v.selected);
          initialValues[field.name] = selectedOption
            ? selectedOption.value
            : '';
          initialLables[field.label] = selectedOption
            ? selectedOption.label
            : '';
        } else if (field.type === 'datepicker') {
          initialValues[field.name] = field.defaultValue || '';
          initialLables[field.label] = field.defaultValue || '';
        }
        if (field.type === 'file' || field.type === 'image') {
          initialValues[field.name] = [];
          initialLables[field.label] = [];
        } else {
          initialValues[field.name] = '';
          initialLables[field.label] = '';
        }
      });
      initialValues.other_contacts = [];

      // initialValues.other_contacts = [
      //   maxContacts > 0
      //     ? {
      //         other_contacts: [
      //           {
      //             id: Date.now(),
      //             first_name: '',
      //             last_name: '',
      //             phone: '',
      //             email: '',
      //             company: '',
      //           },
      //         ],
      //       }
      //     : {},
      // ];
      Object.keys(dropdownRefs.current).forEach(key => {
        dropdownRefs.current[key]?.setValueManually('');
      });
      setFormValues(initialValues);
      setFormLabels(initialLables);
    }
  };

  React.useEffect(() => {
    setInitialValues();
  }, [formData]);

  const handlePasswordChange = value => {
    setPassword(value);
    if (!passwordRegex.test(value)) {
      setPasswordError(
        'Password must include 8+ characters, an uppercase letter, a lowercase letter, a number, and a special character.',
      );
    } else {
      setPasswordError('');
    }
  };

  const handleInputChange = (name, label, value, subLabel, type = 'text') => {
    if (type === 'radio-group') {
      setFormValues(prev => ({...prev, [name]: [value]}));
      setFormLabels(prev => ({...prev, [label]: subLabel}));
    } else {
      setFormValues(prev => ({
        ...prev,
        [name]: type === 'phone' ? Utils.formatPhoneNumber(value) : value,
      }));
      setFormLabels(prev => ({
        ...prev,
        [label]: type === 'phone' ? Utils.formatPhoneNumber(value) : value,
      }));
    }
    if (value) {
      setErrors(prev => ({...prev, [name]: null}));
    }
  };

  const handleCheckboxChange = (name, label, checkboxValue, checkBoxLabel) => {
    setFormValues(prev => {
      const selectedValues = prev[name] || [];
      if (selectedValues.includes(checkboxValue)) {
        // Remove the value if already selected
        return {
          ...prev,
          [name]: selectedValues.filter(value => value !== checkboxValue),
        };
      } else {
        // Add the value if not already selected
        return {
          ...prev,
          [name]: [...selectedValues, checkboxValue],
        };
      }
    });
    setFormLabels(prev => {
      const selectedLabels = prev[label] ? prev[label].split(',') : []; // Convert string to array
      if (selectedLabels.includes(checkBoxLabel)) {
        // Remove the value if already selected
        const updatedLabels = selectedLabels.filter(
          lbl => lbl !== checkBoxLabel,
        );
        return {
          ...prev,
          [label]: updatedLabels.join(','), // Convert array back to string
        };
      } else {
        // Add the value if not already selected
        const updatedLabels = [...selectedLabels, checkBoxLabel];
        return {
          ...prev,
          [label]: updatedLabels.join(','), // Convert array back to string
        };
      }
    });

    setErrors(prev => ({
      ...prev,
      [name]: null, // Clear the error when at least one checkbox is checked
    }));
  };

  const focusNextInput = index => {
    if (inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const validateConditions = () => {
    const newErrors = {};
    formData.forEach(field => {
      if (field.conditions && field.conditions.length > 0) {
        field.conditions.forEach(condition => {
          const relatedFieldValue = formValues[condition.field];
          if (condition.values.includes(relatedFieldValue)) {
            if (!formValues[field.name]) {
              newErrors[field.name] = `${
                field.label
              } is required when ${Utils.convertToTitleCase(
                condition.field,
              )} is ${relatedFieldValue}`;
            }
          }
        });
      }
    });
    return newErrors;
  };

  const uploadFile = async file => {
    try {
      startLoader();
      const response = await Utils.uploadToMinIO(file);
      return response;
    } catch {
      e => {
        console.log('error');
      };
    } finally {
      stopLoader();
    }
  };

  const checkIsConditionMatch = field => {
    if (field.conditions && field.conditions.length > 0) {
      return field.conditions.some(condition => {
        const relatedFieldValue = formValues[condition.field];
        return (
          condition.values.includes(relatedFieldValue) &&
          !formValues[field.name]
        );
      });
    }
    return false;
  };
  const handleSave = async () => {
    try {
      startLoader();
      Keyboard.dismiss();
      const newErrors = {};

      if (showPassword === '1' && isPasswordSet) {
        if (!passwordRegex.test(password)) {
          setPasswordError(
            'Password must include 8+ characters, an uppercase letter, a lowercase letter, a number, and a special character.',
          );
        } else {
          setErrors('');
        }
      }

      formData.forEach(field => {
        if (field.type === 'datepicker' && !formValues[field.name]) {
          newErrors[field.name] = `${field.label} is required`;
        }
        if (field.type === 'file' || field.type === 'image') {
          const selectedFiles = fileInputs[field.name];
          if (
            field.required &&
            (!selectedFiles || selectedFiles.length === 0)
          ) {
            newErrors[field.name] = `${field.label} is required`;
          }
        }
        if (
          field.type === 'phone' &&
          formValues[field.name].length > 0 &&
          !isPhoneValid(formValues[field.name])
        ) {
          newErrors[field.name] = `${field.label} is invalid`;
        }
        if (
          field.type === 'email' &&
          formValues[field.name].length > 0 &&
          !isEmailValid(formValues[field.name])
        ) {
          newErrors[field.name] = `${field.label} is invalid`;
        }
        if (field.type === 'checkbox-group') {
          const isAnyChecked = field.values.some(checkbox =>
            formValues[field.name]?.includes(checkbox.value),
          );
          if (field.required && !isAnyChecked) {
            newErrors[field.name] = `${field.label} is required`;
          }
        }

        if (field.conditions && field.conditions.length > 0) {
          field.conditions.forEach(condition => {
            const relatedFieldValue = formValues[condition.field];
            if (condition.values.includes(relatedFieldValue)) {
              if (!formValues[field.name]) {
                newErrors[field.name] = `${
                  field.label
                } is required when ${Utils.convertToTitleCase(
                  condition.field,
                )} is ${relatedFieldValue}`;
              }
            }
          });
        } else if (field.required && !formValues[field.name]) {
          newErrors[field.name] = `${field.label} is required`;
        }
      });

      const conditionErrors = validateConditions();
      Object.assign(newErrors, conditionErrors);
      setErrors(newErrors);

      const contactErrors = validateContacts();

      // console.log('formLabels', formLabels);
      // console.log('formValues', formValues);

      if (maxContacts === 0) {
        delete formValues.other_contacts;
      }

      if (Object.keys(newErrors).length === 0 && contactErrors === true) {
        if (showPassword === '1') {
          formValues.integration_provider_password = password;
        }
        const user = JSON.parse(await AsyncStorage.getItem(PREFERENCE.USER));
        const locationId = await AsyncStorage.getItem(PREFERENCE.LOCATION_ID);
        const locationName = await AsyncStorage.getItem(
          PREFERENCE.LOCATION_NAME,
        );

        const record = {
          userId: user.id,
          locationId: locationId,
          username: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
          location: locationName,
          label: formLabels,
          value: formValues,
        };
        // console.log('record', record);
        // Insert record into the database
        const id = await insertRecord(record);
        // console.log('id', id);
        setInitialValues();
        if (isConnected === true) {
          const response = await leadService.createLead({
            leads: [
              {...Utils.transformObject(formValues), tablet_local_id: id},
            ],
            user_id: user.id,
          });
          Utils.updateIsURLSync(formValues);
          if (response.status === true) {
            updateSyncStatus(response.data[0].id, id, true, formValues);
            Alert.alert('Lead inserted online successfully');
          } else {
            insertLog(
              'Create Lead from Lead Form',
              JSON.stringify({
                leads: [Utils.transformObject(formValues)],
                user_id: user.id,
              }),
              JSON.stringify(response),
              '',
            );
            Alert.alert(JSON.stringify(response));
          }
        } else {
          Alert.alert('Web server is down and so it saved it locally');
        }
        setFileInputs([]);
      } else {
        Alert.alert('Error', 'Please fill all required fields.');
      }
    } catch (e) {
      Alert.alert(`Error: ${e.message}`);
    } finally {
      stopLoader();
    }
  };

  const handleSingleFileSelection = async (
    fieldName,
    label,
    fileType,
    picker,
  ) => {
    try {
      let result = {};

      if (picker === 'camera') {
        const options = {
          mediaType: 'photo',
          quality: fieldName === isAndroid ? 1 : 0.5,
        };

        const response = await launchCamera(options);
        console.log('response', response);

        if (!response.didCancel && response.assets) {
          result = response.assets[0];
          const keyMapping = {
            uri: 'fileCopyUri',
            fileName: 'name',
            fileSize: 'size',
          };

          result = Object.fromEntries(
            Object.entries(result).map(([key, value]) => [
              keyMapping[key] || key,
              value,
            ]),
          );
        }
      } else {
        if (picker === 'gallery') {
          const options = {
            title: 'Select image',
            storageOptions: {
              skipBackup: true,
              path: 'images',
            },
          };
          const response = await launchImageLibrary(options);
          if (!response.didCancel && response.assets) {
            result = response.assets[0];
            const keyMapping = {
              uri: 'fileCopyUri',
              fileName: 'name',
              fileSize: 'size',
            };

            result = Object.fromEntries(
              Object.entries(result).map(([key, value]) => [
                keyMapping[key] || key,
                value,
              ]),
            );
          }
        } else {
          result = await pick({
            type: [types.allFiles],
            destination: 'cachesDirectory',
          });

          if (result && Array.isArray(result) && result.length > 0) {
            const keyMapping = {
              uri: 'fileCopyUri',
              fileName: 'name',
              fileSize: 'size',
            };

            result = Object.fromEntries(
              Object.entries(result[0]).map(([key, value]) => [
                keyMapping[key] || key,
                value,
              ]),
            );
          }
        }
      }

      if (result.fileCopyUri) {
        // Check file size
        if (result.size > MAX_FILE_SIZE) {
          Alert.alert(
            'File Too Large',
            `The file "${result.name}" exceeds the maximum size of 5 MB.`,
          );
          return; // Exit if file exceeds size limit
        }

        // Check if file already exists in the array
        const existingFiles = fileInputs[fieldName] || [];
        const isDuplicate = existingFiles.some(
          file => file.uri === result.uri || file.filename === result.name,
        );

        if (isDuplicate) {
          Alert.alert(
            'Duplicate File',
            `The file "${result.name}" is already selected.`,
          );
          return; // Exit if the file is a duplicate
        }

        let fileData = {
          uri: result.fileCopyUri,
          name: result.name || '',
          liveUrl: '',
          isSync: 0,
          mime: result.type,
          size: result.size, // Include size for reference
          isURLSync: 0,
        };

        if (fieldName === 'business_card') {
          await processImage(result.fileCopyUri);
        }

        if (isConnected === true) {
          const location = await uploadFile(fileData);
          if (location?.Location) {
            fileData.liveUrl = location.Location;
            fileData.isSync = 1;
          }
        }

        if (fieldName === 'business_card') {
          setFileInputs(prev => ({
            ...prev,
            [fieldName]: [fileData],
          }));
          setFormValues(prev => ({
            ...prev,
            [fieldName]: [fileData],
          }));
        } else {
          setFileInputs(prev => ({
            ...prev,
            [fieldName]: prev[fieldName]
              ? [...prev[fieldName], fileData]
              : [fileData],
          }));
          setFormValues(prev => ({
            ...prev,
            [fieldName]: prev[fieldName]
              ? [...prev[fieldName], fileData]
              : [fileData],
          }));
        }

        setErrors(prev => ({...prev, [fieldName]: null}));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenFile = async file => {
    try {
      const shareOptions = {
        title: 'View file',
        url: file.uri,
        type: file.type,
      };

      await Share.open(shareOptions);
    } catch (error) {
      console.error('Error opening file: ', error);
      // Alert.alert('Error', error.message);
    }
  };

  const renderFilePreview = (file, fieldName, index) => {
    const renderIcon = () => {
      if (file.mime.includes('image/')) {
        return (
          <Image
            source={{uri: file.uri}}
            style={styles.thumbnail}
            resizeMode="contain"
          />
        );
      } else if (file.mime === 'application/pdf') {
        return (
          <Image
            source={LocalImages.pdf}
            style={styles.thumbnail}
            resizeMode="contain"
          />
        );
      } else if (file.mime.includes('word')) {
        return (
          <Image
            source={LocalImages.word}
            style={styles.thumbnail}
            resizeMode="contain"
          />
        );
      } else if (file.mime.includes('excel')) {
        return (
          <Image
            source={LocalImages.excel}
            style={styles.thumbnail}
            resizeMode="contain"
          />
        );
      } else if (file.mime.includes('video')) {
        return (
          <Image
            source={LocalImages.video}
            style={styles.thumbnail}
            resizeMode="contain"
          />
        );
      } else {
        return (
          <Image
            source={LocalImages.doc}
            style={styles.thumbnail}
            resizeMode="contain"
          />
        );
      }
    };

    return (
      <View style={styles.filePreviewItem}>
        {renderIcon()}
        <Text style={styles.fileName}>{file.name || 'Unnamed File'}</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => removeFile(fieldName, index)}>
          <SvgIcons.Close />
        </TouchableOpacity>
      </View>
    );
  };

  const getKeyboardType = type => {
    switch (type) {
      case 'text':
        return 'default';
      case 'phone':
        return 'phone-pad';
      case 'email':
        return 'email-address';
      case 'number':
        return 'number-pad';
      case 'textarea':
        return 'default';
    }
  };

  if (!formData || formData.length === 0) {
    return (
      <View style={styles.noLeadsContainer}>
        <Text style={styles.noLeadsText}>No Leads Found</Text>
      </View>
    );
  }

  const removeFile = (fieldName, index) => {
    setFileInputs(prev => {
      const updatedFiles = [...(prev[fieldName] || [])];
      updatedFiles.splice(index, 1); // Remove the file at the specified index
      return {...prev, [fieldName]: updatedFiles};
    });

    setFormLabels(prev => {
      const updatedLabels = [...(prev[fieldName] || [])];
      updatedLabels.splice(index, 1); // Remove the corresponding label
      return {...prev, [fieldName]: updatedLabels};
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        {formData &&
          formData.map((field, index) => {
            switch (field.type) {
              case 'text':
              case 'phone':
              case 'email':
              case 'number':
              case 'textarea':
                return (
                  <View key={index} style={styles.fieldContainer}>
                    <Text style={styles.label}>
                      {field.label}
                      {field.required &&
                        (!field?.conditions ||
                          field.conditions.length === 0 ||
                          checkIsConditionMatch(field)) && (
                          <Text style={styles.required}>*</Text>
                        )}
                    </Text>
                    <TextInput
                      ref={ref => (inputRefs.current[index] = ref)}
                      style={[
                        styles.input,
                        {
                          height:
                            field.type === 'textarea'
                              ? isTablet()
                                ? wp(120)
                                : wp(150)
                              : isTablet()
                              ? wp(30)
                              : wp(48),
                        },
                        focusedField === field.name && {borderColor: '#754FFF'},
                      ]}
                      placeholder={field.label}
                      placeholderTextColor={colors.teal_757575}
                      value={formValues[field.name] || ''}
                      onChangeText={value => {
                        if (field.type === 'phone') {
                          handleInputChange(
                            field.name,
                            field.label,
                            value,
                            '',
                            'phone',
                          );
                        } else {
                          handleInputChange(field.name, field.label, value);
                        }
                      }}
                      onFocus={() => setFocusedField(field.name)}
                      onBlur={() => setFocusedField(null)}
                      returnKeyType="next"
                      onSubmitEditing={() => focusNextInput(index)}
                      multiline={field.type === 'textarea'}
                      autoCorrect={false}
                      autoCapitalize={
                        field.type === 'email' ? 'none' : 'sentences'
                      }
                      keyboardType={getKeyboardType(field.type)}
                    />
                    {(errors[field.name] || checkIsConditionMatch(field)) && (
                      <Text style={styles.errorText}>{errors[field.name]}</Text>
                    )}
                  </View>
                );

              case 'checkbox-group':
                return (
                  <View key={index} style={styles.fieldContainer}>
                    <Text style={styles.label}>
                      {field.label}
                      {field.required &&
                        (!field?.conditions ||
                          field.conditions.length === 0 ||
                          checkIsConditionMatch(field)) && (
                          <Text style={styles.required}>*</Text>
                        )}
                    </Text>
                    <View style={styles.gridContainer}>
                      {field.values.map((checkbox, i) => (
                        <TouchableOpacity
                          key={i}
                          style={styles.flexItem}
                          activeOpacity={0.8}
                          onPress={() =>
                            handleCheckboxChange(
                              field.name,
                              field.label,
                              checkbox.value,
                              checkbox.label,
                            )
                          }>
                          <CheckboxButton
                            onClick={() =>
                              handleCheckboxChange(
                                field.name,
                                checkbox.value,
                                !formValues[field.name]?.[checkbox.value],
                              )
                            }
                            style={styles.checkBox}
                            isChecked={formValues[field.name]?.includes(
                              checkbox.value,
                            )}
                          />
                          <Text style={styles.optionLabel}>
                            {checkbox.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {(errors[field.name] || checkIsConditionMatch(field)) && (
                      <Text style={styles.errorText}>{errors[field.name]}</Text>
                    )}
                  </View>
                );

              case 'radio-group':
                return (
                  <View key={index} style={styles.fieldContainer}>
                    <Text style={styles.label}>
                      {field.label}
                      {field.required &&
                        (!field?.conditions ||
                          field.conditions.length === 0 ||
                          checkIsConditionMatch(field)) && (
                          <Text style={styles.required}>*</Text>
                        )}
                    </Text>

                    <View style={styles.gridContainer}>
                      {field.values.map((radio, i) => (
                        <TouchableOpacity
                          key={i}
                          style={styles.flexItem}
                          activeOpacity={0.8}
                          onPress={() =>
                            handleInputChange(
                              field.name,
                              field.label,
                              radio.value,
                              radio.label,
                              field.type,
                            )
                          }>
                          <RadioGroup
                            onPress={() =>
                              handleInputChange(
                                field.name,
                                field.label,
                                radio.value,
                                radio.label,
                                field.type,
                              )
                            }
                            radioButtons={[
                              {id: radio.value, value: radio.value},
                            ]}
                            selectedId={
                              formValues[field.name]
                                ? formValues[field.name][0]
                                : null
                            }
                          />
                          <Text style={styles.optionLabel}>{radio.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {(errors[field.name] || checkIsConditionMatch(field)) && (
                      <Text style={styles.errorText}>{errors[field.name]}</Text>
                    )}
                  </View>
                );

              case 'date-picker':
                return (
                  <View key={index} style={styles.fieldContainer}>
                    <DatePicker
                      ref={ref => {
                        datePickersRef.current[field.name] = ref;
                      }}
                      title={field.label}
                      isRequired={
                        field.required &&
                        (!field?.conditions ||
                          field.conditions.length === 0 ||
                          checkIsConditionMatch(field))
                      }
                      minimumDate={field.minimumDate}
                      maximumDate={field.maximumDate}
                      defaultDate={field.defaultValue}
                      onDateChange={date =>
                        handleInputChange(field.name, field.label, date)
                      }
                    />
                    {(errors[field.name] || checkIsConditionMatch(field)) && (
                      <Text style={styles.errorText}>{errors[field.name]}</Text>
                    )}
                  </View>
                );

              case 'select':
                return (
                  <View key={index} style={styles.fieldContainer}>
                    <Dropdown
                      ref={ref => {
                        if (ref) {
                          dropdownRefs.current[field.name] = ref; // Assign ref dynamically
                        }
                      }}
                      title={field.label}
                      isRequired={
                        field.required &&
                        (!field?.conditions ||
                          field.conditions.length === 0 ||
                          checkIsConditionMatch(field))
                      }
                      placeHolder="Select"
                      onItemSelected={item =>
                        handleInputChange(
                          field.name,
                          field.label,
                          item.value,
                          item.label,
                          field.type,
                        )
                      }
                      data={field.values}
                      keyName="label"
                      val={formValues[field.name]}
                    />
                    {(errors[field.name] || checkIsConditionMatch(field)) && (
                      <Text style={styles.errorText}>{errors[field.name]}</Text>
                    )}
                  </View>
                );

              case 'file':
                return (
                  <View key={index} style={styles.fieldContainer}>
                    <Text style={styles.label}>
                      {field.label}
                      {field.required && <Text style={styles.required}>*</Text>}
                    </Text>

                    <View
                      style={[
                        styles.buttonContainer,
                        {flexDirection: 'row', justifyContent: 'space-between'},
                      ]}>
                      <TouchableOpacity
                        style={[styles.fileButton, {flex: 1, marginRight: 5}]}
                        onPress={() =>
                          handleSingleFileSelection(
                            field.name,
                            field.label,
                            'image',
                            'camera',
                          )
                        }>
                        <Text style={styles.fileButtonText} >From Camera</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.fileButton, {flex: 1, marginLeft: 5}]}
                        onPress={() =>
                          handleSingleFileSelection(
                            field.name,
                            field.label,
                            'image',
                            'gallery',
                          )
                        }>
                        <Text style={styles.fileButtonText} >From Gallery</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.fileButton, {flex: 1, marginLeft: 5}]}
                        onPress={() =>
                          handleSingleFileSelection(
                            field.name,
                            field.label,
                            field.type === 'file',
                          )
                        }>
                        <Text style={styles.fileButtonText} >Browse Files</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.filePreviewContainer}>
                      {fileInputs[field.name]?.map((file, i) => (
                        <Pressable
                          onPress={() => {
                            handleOpenFile(file);
                          }}
                          key={i}>
                          {renderFilePreview(file, field.name, i)}
                        </Pressable>
                      ))}
                    </View>
                    {(errors[field.name] || checkIsConditionMatch(field)) && (
                      <Text style={styles.errorText}>{errors[field.name]}</Text>
                    )}
                  </View>
                );
              case 'image':
                return (
                  <View key={index} style={styles.fieldContainer}>
                    <Text style={styles.label}>
                      {field.label}
                      {field.required && <Text style={styles.required}>*</Text>}
                    </Text>
                    <View
                      style={[
                        styles.buttonContainer,
                        {flexDirection: 'row', justifyContent: 'space-between'},
                      ]}>
                      <TouchableOpacity
                        style={[styles.fileButton, {flex: 1, marginRight: 5}]}
                        onPress={() =>
                          handleSingleFileSelection(
                            field.name,
                            field.label,
                            'image',
                            'camera',
                          )
                        }>
                        <Text style={styles.fileButtonText} >From Camera</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.fileButton, {flex: 1, marginLeft: 5}]}
                        onPress={() =>
                          handleSingleFileSelection(
                            field.name,
                            field.label,
                            'image',
                            'gallery',
                          )
                        }>
                        <Text style={styles.fileButtonText} >From Gallery</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.filePreviewContainer}>
                      {fileInputs[field.name]?.map((file, i) => (
                        <Pressable
                          onPress={() => {
                            handleOpenFile(file);
                          }}
                          key={i}>
                          {renderFilePreview(file, field.name, i)}
                        </Pressable>
                      ))}
                    </View>
                    {(errors[field.name] || checkIsConditionMatch(field)) && (
                      <Text style={styles.errorText}>{errors[field.name]}</Text>
                    )}
                  </View>
                );

              default:
                return null;
            }
          })}
        {showPassword === '1' && (
          <>
            <View style={[styles.fieldContainer, {flexDirection: 'row'}]}>
              <Text style={[styles.label, {marginRight: wp(8)}]}>
                Set Password
              </Text>
              <CheckboxButton
                onClick={() => setIsPasswordSet(!isPasswordSet)}
                isChecked={isPasswordSet}
              />
            </View>
            {isPasswordSet && (
              <View style={[styles.fieldContainer]}>
                <Text style={styles.label}>
                  Password
                  {passwordError && <Text style={styles.required}>*</Text>}
                </Text>
                <TextInput
                  style={[styles.input, {height: isTablet() ? wp(30) : wp(48)}]}
                  placeholder="Enter password"
                  value={password}
                  secureTextEntry
                  onChangeText={handlePasswordChange}
                />
                {passwordError && (
                  <Text style={styles.errorText}>{passwordError}</Text>
                )}
              </View>
            )}
          </>
        )}
        {maxContacts > 0 && Array.isArray(formValues?.other_contacts) ? (
          <View style={styles.multipleContactView}>
            <View style={styles.headerRow}>
              <FontText
                fontFamily={Fonts.robotMedium}
                size={normalize(18)}
                color={colors.black_222222}>
                Multiple Contact
              </FontText>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddNewContact}>
                <FontText
                  fontFamily={Fonts.robotBold}
                  size={normalize(14)}
                  color={colors.white}>
                  + Add New
                </FontText>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabScrollView}>
              <View style={styles.tabContainer}>
                {formValues.other_contacts.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.tab,
                      currentFormIndex === index
                        ? styles.activeTab
                        : styles.inactiveTab,
                    ]}
                    onPress={() => setCurrentFormIndex(index)}>
                    <FontText
                      pRight={wp(8)}
                      fontFamily={Fonts.robotRegular}
                      size={normalize(14)}
                      color={colors.black_222222}>
                      Contact {index + 1}
                    </FontText>
                    {index !== 0 && (
                      <TouchableOpacity
                        onPress={() => handleRemoveContact(index)}>
                        <FontText
                          fontFamily={Fonts.robotRegular}
                          size={normalize(14)}
                          color="red">
                          ✕
                        </FontText>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {formValues.other_contacts.map((contact, index) =>
              index === currentFormIndex ? (
                <View key={index}>
                  {contactFields.map(field => (
                    <View key={field.name} style={styles.fieldContainer}>
                      <FontText
                        fontFamily={Fonts.robotMedium}
                        size={normalize(14)}
                        color={colors.black_222222}>
                        {field.label}{' '}
                        {field.required && (
                          <Text style={styles.required}>*</Text>
                        )}
                      </FontText>
                      <TextInput
                        style={[
                          styles.input,
                          {height: isTablet() ? wp(30) : wp(48)},
                          focusedField === field.label && {
                            borderColor: '#754FFF',
                          },
                        ]}
                        placeholder={field.label}
                        value={contact[field.name]}
                        onFocus={() => setFocusedField(field.label)}
                        onBlur={() => setFocusedField(null)}
                        onChangeText={value =>
                          handleContactInputChange(
                            index,
                            field.name,
                            value,
                            field.type,
                          )
                        }
                        keyboardType={
                          field.type === 'phone'
                            ? 'phone-pad'
                            : field.type === 'email'
                            ? 'email-address'
                            : 'default'
                        }
                        autoCapitalize={
                          field.type === 'email' ? 'none' : 'sentences'
                        }
                      />
                      {errors.other_contacts?.[index]?.[field.name] && (
                        <Text style={styles.errorText}>
                          {errors.other_contacts[index][field.name]}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              ) : null,
            )}
          </View>
        ) : null}

        <Button
          onPress={handleSave}
          style={{
            marginTop: wp(20),
            marginBottom: wp(40),
          }}>
          <FontText
            fontFamily={Fonts.robotRegular}
            size={normalize(16)}
            color={colors.white}>
            {'Submit'}
          </FontText>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {padding: normalize(16), backgroundColor: colors.white},
  fieldContainer: {marginBottom: wp(16)},
  label: {
    fontSize: normalize(16),
    marginBottom: wp(5),
    fontWeight: 'bold',
    color: colors.black_222222,
  },
  input: {
    borderWidth: wp(1),
    borderColor: colors.teal_CCCBCB,
    borderRadius: wp(4),
    paddingLeft: wp(8),
    fontSize: normalize(16),
    textAlignVertical: 'top', // Align text to the top
    textAlign: 'left', // Align text to the left
    color: colors.black_222222,
    backgroundColor: colors.white,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  flexItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: wp(10),
    marginRight: wp(10),
    flexShrink: 1,
    minWidth: '45%',
  },
  optionLabel: {
    marginLeft: wp(8),
    fontSize: normalize(16),
    color: colors.textDark,
  },
  errorText: {color: 'red', fontSize: 12},
  saveButton: {
    backgroundColor: '#754FFF',
    marginBottom: wp(100),
    borderRadius: 5,
    alignItems: 'center',
    height: wp(40),
  },
  saveButtonText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  required: {color: 'red'},
  checkBox: {
    marginRight: wp(8), // Space between checkbox and text
  },
  noLeadFields: {
    fontSize: normalize(22),
    fontWeight: 'bold',
    color: '#666',
  },
  noLeadsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },

  filePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  filePreviewItem: {
    // flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 5,
    backgroundColor: '#f9f9f9',
    width: 150,
  },
  thumbnail: {
    width: wp(100),
    height: wp(100),
    marginRight: 10,
  },
  fileName: {
    flex: 1,
    fontSize: 12,
    color: '#555',
  },
  fileButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
    height: isTablet() ? wp(30) : wp(48),
    justifyContent: 'center', // added this
},

fileButtonText: {
    fontSize: normalize(14),
    color: colors.primary,
    textAlign: 'center',
},
  closeButton: {
    position: 'absolute',
    top: wp(0),
    right: wp(0),
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: wp(10),
  },
  headerTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: colors.black_222222,
  },
  tabScrollView: {marginBottom: wp(10)},
  tabContainer: {flexDirection: 'row'},
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(10),
    marginRight: wp(5),
    borderBottomWidth: 2,
  },
  activeTab: {
    borderBottomColor: colors.primary,
    backgroundColor: colors.lightBlue,
  },
  inactiveTab: {borderBottomColor: 'transparent', backgroundColor: colors.grey},
  tabText: {fontSize: normalize(14), color: colors.black_222222},
  removeText: {marginLeft: 8, color: 'red', fontSize: normalize(14)},
  // input: {
  //   borderWidth: 1,
  //   borderColor: colors.teal_CCCBCB,
  //   borderRadius: 4,
  //   paddingLeft: 8,
  //   fontSize: normalize(16),
  //   marginBottom: 10,
  //   height: 50,
  //   backgroundColor: colors.white,
  //   color: colors.black_222222,
  // },
  // errorText: { color: 'red', fontSize: 12 },
  submitButton: {marginTop: wp(20), marginBottom: wp(20)},
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  addButtonText: {
    color: colors.white,
    fontSize: normalize(14),
    fontWeight: 'bold',
  },

  multipleContactView: {
    borderRadius: 4,
    borderWidth: wp(1),
    borderColor: colors.lightGray,
    padding: wp(16),
  },
  businessCardButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  businessCardText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flexGrow: 1, //Important to allow scrollview to expand past its initial height.
    paddingVertical: wp(16),
  },
});

export default DynamicForm;
