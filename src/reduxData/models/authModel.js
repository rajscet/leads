import {action, persist} from 'easy-peasy';
import persistStorage from 'reduxData/persistStorage';

export default persist({
  user: undefined,
  location: undefined,
  isLoggedIn: 'false',
  isUserLoggedIn: 'false',
  setIsLoggedIn: action((state, payload) => {
    state.isLoggedIn = payload;
  }),
  setUser: action((state, payload) => {
    state.user = payload;
  }),
  setLocation: action((state, payload) => {
    state.location = payload;
  }),
  setIsUserLoggedIn: action((state, payload) => {
    state.isUserLoggedIn = payload;
  }),
},
{
  version: 1,
  storage: persistStorage,
});
