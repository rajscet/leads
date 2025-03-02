import {action, persist} from 'easy-peasy';
import persistStorage from 'reduxData/persistStorage';

export default persist({
  leads: [],
  setLeads: action((state, payload) => {
    state.leads = payload;
  }),
  addLead: action((state, payload) => {
    state.leads = [...state.leads, payload];
  }),
},
{
  version: 1,
  storage: persistStorage,
});
