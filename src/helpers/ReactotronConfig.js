/* eslint-disable import/no-extraneous-dependencies */
import Reactotron, { asyncStorage } from 'reactotron-react-native';
import {reactotronRedux} from 'reactotron-redux';

const reactron = Reactotron.configure({
  name: 'My Leads',
  host: '192.168.29.34',
  //  host: '192.168.31.124',
})
  .useReactNative({
    storybook: true,
    asyncStorage: true, // there are more options to the async storage.
    networking: {
      // optionally, you can turn it off with false.
      ignoreUrls: /symbolicate/,
    },
    editor: false, // there are more options to editor
    overlay: false, // just turning off overlay
  })
  .use(reactotronRedux())
  .use(asyncStorage())
  .connect();

export default reactron;
