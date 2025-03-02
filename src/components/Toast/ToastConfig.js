import React from 'react';
import { BaseToast } from 'react-native-toast-message';
import { StyleSheet } from 'react-native';

const ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={styles.successContainer}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
  error: (props) => (
    <BaseToast
      {...props}
      style={styles.errorContainer}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
};

const styles = StyleSheet.create({
  successContainer: {
    borderLeftColor: 'green',
    backgroundColor: '#222',
  },
  errorContainer: {
    borderLeftColor: 'red',
    backgroundColor: '#400',
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
  text1: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  text2: {
    fontSize: 14,
    color: '#ccc',
  },
});

export default ToastConfig;
