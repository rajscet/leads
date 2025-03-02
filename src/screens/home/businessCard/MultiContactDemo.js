import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import Button from 'components/Button';
import { normalize, wp } from 'helpers/styles/responsive';
import { isEmailValid, isPhoneValid } from 'helpers/validation';
import colors from 'assets/colors';
import Fonts from 'assets/fonts/fonts';
import FontText from 'components/FontText';
import reactron from 'helpers/ReactotronConfig';

const MAX_FORMS = 12; // Maximum allowed forms

const MultiContactDemo = (props) => {
  const [forms, setForms] = useState([{ id: 1, firstName: '', lastName: '', email: '', phone: '', companyName: '' }]);
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [errors, setErrors] = useState([]);

  const handleInputChange = (index, field, value) => {
    const updatedForms = [...forms];
    updatedForms[index][field] = value;
    setForms(updatedForms);

    setErrors(prevErrors => {
      const newErrors = [...prevErrors];
      newErrors[index] = { ...newErrors[index], [field]: '' };
      return newErrors;
    });
  };

  const handleAddNewForm = () => {
    if (forms.length < MAX_FORMS) {
      setForms([...forms, { id: Date.now(), firstName: '', lastName: '', email: '', phone: '', companyName: '' }]);
      setCurrentFormIndex(forms.length);
    } else {
      Alert.alert('Limit Reached', `You can add up to ${MAX_FORMS} Contacts.`);
    }
  };

  const handleRemoveForm = (index) => {
    if (forms.length > 1) {
      const updatedForms = forms.filter((_, i) => i !== index);
      setForms(updatedForms);
      setCurrentFormIndex(Math.max(0, index - 1));
    }
  };

  const validateForms = () => {
    const newErrors = forms.map(form => {
      let formErrors = {};
      if (!form.firstName.trim()) formErrors.firstName = 'First Name is required';
      if (!form.lastName.trim()) formErrors.lastName = 'Last Name is required';
      if (!form.email.trim() || !isEmailValid(form.email)) formErrors.email = 'Valid Email is required';
      if (!form.phone.trim()) formErrors.phone = 'Valid Phone is required';
      if (!form.companyName.trim()) formErrors.companyName = 'Company Name is required';
      return formErrors;
    });

    setErrors(newErrors);

    const firstErrorIndex = newErrors.findIndex(error => Object.keys(error).length > 0);
    if (firstErrorIndex !== -1) {
      setCurrentFormIndex(firstErrorIndex);
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (validateForms()) {
      Alert.alert('Success', 'All forms are valid. Submitting Data', [
        {
          text: "OK",
          onPress: () => {
            console.log("Submitted Data: ", forms);
          }
        }
      ]);
    } else {
      Alert.alert('Validation Error', 'Please fill all required fields.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Title & Add New Button Row */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Multiple Contact</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddNewForm}>
          <Text style={styles.addButtonText}>+ Add New</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Form Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollView}>
        <View style={styles.tabContainer}>
          {forms.map((form, index) => (
            <TouchableOpacity
              key={form.id}
              style={[
                styles.tab,
                currentFormIndex === index ? styles.activeTab : styles.inactiveTab
              ]}
              onPress={() => setCurrentFormIndex(index)}
            >
              <Text style={styles.tabText}>Contact {index + 1}</Text>
              {index !== 0 && (
                <TouchableOpacity onPress={() => handleRemoveForm(index)}>
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Form Fields */}
      <View style={styles.formContainer}>
        {forms.map((form, index) => {
          if (index === currentFormIndex) {
            return (
              <View key={form.id}>
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  value={form.firstName}
                  onChangeText={(value) => handleInputChange(index, 'firstName', value)}
                />
                {errors[index]?.firstName && <Text style={styles.errorText}>{errors[index].firstName}</Text>}

                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  value={form.lastName}
                  onChangeText={(value) => handleInputChange(index, 'lastName', value)}
                />
                {errors[index]?.lastName && <Text style={styles.errorText}>{errors[index].lastName}</Text>}

                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={form.email}
                  keyboardType="email-address"
                  onChangeText={(value) => handleInputChange(index, 'email', value)}
                />
                {errors[index]?.email && <Text style={styles.errorText}>{errors[index].email}</Text>}

                <TextInput
                  style={styles.input}
                  placeholder="Phone"
                  value={form.phone}
                  keyboardType="phone-pad"
                  onChangeText={(value) => handleInputChange(index, 'phone', value)}
                />
                {errors[index]?.phone && <Text style={styles.errorText}>{errors[index].phone}</Text>}

                <TextInput
                  style={styles.input}
                  placeholder="Company Name"
                  value={form.companyName}
                  onChangeText={(value) => handleInputChange(index, 'companyName', value)}
                />
                {errors[index]?.companyName && <Text style={styles.errorText}>{errors[index].companyName}</Text>}
              </View>
            );
          }
          return null;
        })}
      </View>

      {/* Submit Button */}
      <Button onPress={handleSubmit} style={styles.submitButton}>
        <FontText fontFamily={Fonts.robotRegular} size={normalize(16)} color={colors.white}>
          Submit
        </FontText>
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: wp(16), backgroundColor: colors.white },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(10) },
  headerTitle: { fontSize: normalize(18), fontWeight: 'bold', color: colors.black_222222 },
  tabScrollView: { marginBottom: wp(10) },
  tabContainer: { flexDirection: 'row' },
  tab: { padding: wp(10), marginRight: wp(5), flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2 },
  activeTab: { borderBottomColor: colors.primary, backgroundColor: colors.lightBlue },
  inactiveTab: { borderBottomColor: 'transparent', backgroundColor: colors.grey },
  removeText: { marginLeft: 10, color: 'red', fontSize: normalize(14) },
  input: { borderWidth: 1, borderColor: colors.teal_CCCBCB, borderRadius: 4, paddingLeft: 8, fontSize: normalize(16), marginBottom: 10, height: 50 },
  submitButton: { marginTop: wp(20), marginBottom: wp(20) },
  errorText: { color: 'red', fontSize: 12 },
});

export default MultiContactDemo;
