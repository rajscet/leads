import {action, createStore} from 'easy-peasy';
import reactron from '../helpers/ReactotronConfig';
import authModel from './models/authModel';





let initialState = {};
window.requestIdleCallback = null;
const store = createStore(
  {
    auth: authModel,
    reset: action(() => ({
      ...initialState,
    })),
  },
  {name: 'easystore', enhancers: [reactron.createEnhancer()]}
);

initialState = store.getState();
export default store;

// {name: 'easystore', enhancers: [reactotron.createEnhancer()]}
