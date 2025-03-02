import {BASE_URL, PREFERENCE} from './src/constants/index';
import {StoreProvider} from 'easy-peasy';
// import {Bugfender} from '@bugfender/rn-bugfender';
import {configureBaseURL} from './src/helpers/AxiosHelper';
import {LoaderProvider} from './src/providers/LoaderProvider';
import {SafeAreaViewProvider} from './src/providers/SafeAreaViewProvider';
import React, {useEffect} from 'react';
import {LogBox} from 'react-native';
import store from './src/reduxData/store';
import Navigation from './src/navigation/index';
import NetInfo from '@react-native-community/netinfo';
import leadService from './src/services/leadService';
import useDidMountEffect from './src/components/UseDidMountEffect';
import ToastConfig from './src/components/Toast/ToastConfig';
import Toast from 'react-native-toast-message';
import {getAttachmentLeads} from './src/helpers/dbHelpler';
import AsyncStorage from '@react-native-async-storage/async-storage';

// import reactron from 'helpers/ReactotronConfig';

function App() {
  const [isConnected, setIsConnected] = React.useState(undefined);
  useEffect(() => {
    configureBaseURL(BASE_URL);
    LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
    LogBox.ignoreAllLogs();

    // Bugfender.init({
    //   appKey: 'xT7CJDta1wpNWPmpGt2XxWiV8jd495aQ',
    //   overrideConsoleMethods: true,
    //   printToConsole: false,
    //   logUIEvents: false,
    //   registerErrorHandler: true,
    //   enableLogcatLogging: true,
    // });

    ErrorUtils.setGlobalHandler((error, isFatal) => {
    //  Bugfender.sendIssue('JS Error', `${error.message}\n${error.stack}`);
    });

    NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
  }, []);

  useDidMountEffect(() => {
    (async () => {
      if (isConnected === true) {
        const user = JSON.parse(await AsyncStorage.getItem(PREFERENCE.USER));
        if (user && user.id) {
          await leadService.syncMultipleLeadInBackground();
          const attachmentLeads = await getAttachmentLeads(
            user.role.name === 'Tablet Super Admin',
            user.id,
          );
          try {
            attachmentLeads.forEach(async lead => {
            //  Bugfender.log('going for image upload: ' + lead);
              await leadService.uploadAttachmentInBackground(
                JSON.parse(lead.value),
                lead.id,
                lead.lead_id,
                lead.isSync,
              );
            });
          } catch (e) {
            alert(e);
          }
        }
      }
    })();
  }, [isConnected]);

  return (
    <StoreProvider store={store}>
      <SafeAreaViewProvider>
        <LoaderProvider>
          <Navigation />
        </LoaderProvider>
      </SafeAreaViewProvider>
      <Toast config={ToastConfig} />
    </StoreProvider>
  );
}

export default App;
