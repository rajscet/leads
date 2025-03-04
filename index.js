import { AppRegistry, Platform } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Normalize app name (use lowercase for iOS if required)
const normalizedAppName = Platform.OS === 'ios' ? 'leads' : appName;

AppRegistry.registerComponent(normalizedAppName, () => App);