export function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// export function isEmailValid(email) {
//   return /^[^\s@]+@[^\s@]+\.(com|net|org)$/.test(email);
// }

export function isPhoneValid(number) {
  const regex = /^\(\d{3}\) \d{3}-\d{4}$/;
  return regex.test(number);
}

export function validatePassword(password = '') {
  return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(password);
}

export function isAlphabets(name) {
  return /^[a-zA-Z\s]+$/.test(name);
}

export function isValidURL(url) {
  return /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})$/.test(
    url
  );
}

export const limitLength = (string, maxLength) => string.substr(0, maxLength);

export const removeNonNumber = (string) => string.replace(/[^\d]/g, '');

// Added validation for Indian pincode
export function isIndianPincode(pincode) {
  const regex = /^[1-9][0-9]{5}$/;
  return regex.test(pincode);
}

// Added simple validation for first name
export function isValidFirstName(name) {
  return /^[a-zA-Z ]+$/.test(name);
}

// Added simple validation for address
export function isValidAddress(address) {
  return /^[a-zA-Z0-9\s,'-]*$/.test(address);
}
