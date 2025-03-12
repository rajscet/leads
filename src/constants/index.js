export const ROUTE_NAMES = {
  HOME: 'Home',
  AUTH_STACK: 'AuthStack',
  SPLASH: 'SplashScreen',
  USER_SETTINGS: 'UserSettings',
  APP_LOGIN: 'AppLogin',
  VERIFY_PIN_SCREEN: 'VerifyPINScreen',
  ENTER_LEAD_SCREEN: 'EnterLeadScreen',
  SETTINGS: 'SettingScreen',
  SUPER_ADMIN: 'SuperAdminScreen',
  LEAD_LIST: 'LeadListScreen',
  LOG_SCREEN: 'LogScreen',
  SEARCH_CUSTOMER: 'SearchCustomerScreen',
  USER_LOGIN: 'UserScreen',
  LEAD_DETAIL: 'LeadDetailScreen',
  SUPER_ADMIN_FEATURES: 'SuperAdminFeatures',
};

export const PREFERENCE = {
  USER_ID: 'user_id',
  JWT_TOKEN: 'jwt_token',
  TABLET_SESSION: 'tablet_session',
  USER_SESSION: 'user_session',
  IS_TABLET_LOGGED_IN: 'is_tablet_logged_in',
  IS_USER_LOGGED_IN: 'is_logged_in',
  USER: 'user',
  LOCATION_ID: 'location_id',
  LOCATION_NAME: 'location_name',
  ROLE: 'role',
  LEAD_FIELDS: 'lead_fields',
  USERS_SALES: 'users_sales',
  USERS_ADMIN: 'users_admin',
  LOCATIONS: 'locations',
  LOCATION_SET_PASSWORD: 'set_password',
  MULTIPLE_CONTACT_COUNT: 'multiple_contact_count',
};

export const backgroundActionOptions = {
  taskName: 'Leads',
  taskTitle: 'Syncing Leads',
  taskDesc: 'Background task to sync leads',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
},

  color: '#FF0000', // Notification color
  linkingURI: 'sync-leads', // Deep link when notification is clicked
  parameters: {
      delay: 60000, // Delay in milliseconds (1 minute)
  },
  // Keep the service running in the foreground
  foreground: true, 
};

// export const BASE_URL = 'https://backend.staging.leads.empireeto.com';
// export const BASE_URL = 'https://backend-review.staging.leads.empireeto.com';
export const BASE_URL = 'https://backend.leads.empiresas.com';
export const ENV = 'Production';

export const DEFAULT_DATE = '1111-11-11';

export const formData = [
  {
    id: '1',
    type: 'text',
    label: 'First Name',
    name: 'first_name',
    order: 0,
    values: [],
    required: true,
    conditions: [],
  },
  {
    id: '2',
    type: 'text',
    label: 'Last Name',
    name: 'last_name',
    order: 1,
    values: [],
    required: true,
    conditions: [],
  },
  {
    id: '3',
    type: 'text',
    label: 'Company',
    name: 'company',
    order: 2,
    values: [],
    required: true,
    conditions: [],
  },
  {
    id: '4',
    type: 'textarea',
    label: 'Address 1',
    name: 'address_1',
    order: 3,
    values: [],
    required: false,
    conditions: [],
  },
  {
    id: '5',
    type: 'textarea',
    label: 'Address 2',
    name: 'address_2',
    order: 4,
    values: [],
    required: false,
    conditions: [],
  },
  {
    id: '6',
    type: 'text',
    label: 'City',
    name: 'city',
    order: 5,
    values: [],
    required: false,
    conditions: [],
  },
  {
    id: '7',
    type: 'select',
    label: 'State',
    name: 'state',
    order: 6,
    values: [
      {
        label: 'California',
        value: 'CA',
      },
      {
        label: 'New York',
        value: 'NY',
      },
      {
        label: 'Texas',
        value: 'TX',
      },
    ],
    required: false,
    conditions: [],
  },
  {
    id: '8',
    type: 'text',
    label: 'Postal Code',
    name: 'postal_code',
    order: 7,
    values: [],
    required: false,
    conditions: [],
  },
  {
    id: '9',
    type: 'select',
    label: 'Country',
    name: 'country',
    order: 8,
    values: [
      {
        label: 'United States',
        value: 'US',
      },
    ],
    required: false,
    conditions: [],
  },
  {
    id: '10',
    type: 'text',
    label: 'Phone',
    name: 'phone',
    order: 9,
    values: [],
    required: true,
    conditions: [],
  },
  {
    id: '11',
    type: 'text',
    label: 'Email',
    name: 'email',
    order: 10,
    values: [],
    required: true,
    conditions: [],
  },
  {
    id: '88a0818c-c372-42ec-8b29-17af48ad319a',
    name: 'expected_stock_requirement',
    type: 'text',
    label: 'Expected Stock Requirement',
    order: 11,
    values: [],
    required: true,
    conditions: [],
  },
  {
    id: '9afc7cc0-5ebf-48f7-ac81-5303f9d4aca9',
    name: 'brief_description',
    type: 'textarea',
    label: 'Brief Description',
    order: 12,
    values: [],
    required: true,
    conditions: [
      {
        field: 'expected_stock_requirement',
        values: ['200'],
      },
    ],
  },
  {
    id: 'b90f02c6-3596-4218-b09e-5b2db6d63169',
    name: 'warehouse_location',
    type: 'select',
    label: 'Warehouse Location',
    order: 13,
    values: [
      {
        label: 'California',
        value: 'CA',
      },
      {
        label: 'Ontario',
        value: 'ON',
      },
      {
        label: 'New Jersey',
        value: 'NJ',
      },
    ],
    required: false,
  },
  {
    id: '2a522941-9135-4c86-9444-738b4f09ab08',
    name: 'required_varieties',
    type: 'checkbox-group',
    label: 'Required Varieties',
    order: 14,
    values: [
      {
        label: '1-10 MG',
        value: '1-10mg',
      },
      {
        label: '10-20 MG',
        value: '10-20mg',
      },
    ],
    required: false,
  },
  {
    id: 'f62dd375-c4b9-41dd-8f65-64047039f165',
    name: 'type_of_seller',
    type: 'radio-group',
    label: 'Type of Seller',
    order: 15,
    values: [
      {
        label: 'Retail',
        value: 'retail',
      },
      {
        label: 'Wholesale',
        value: 'wholesale',
      },
    ],
    required: true,
    conditions: [],
  },
  {
    id: 'd5e8b99e-2c94-4027-b46e-701139b2942f',
    name: 'licenses',
    type: 'file',
    label: 'Licenses',
    order: 16,
    values: [],
    required: false,
  },
  {
    id: '4b35b419-eced-4833-a653-8e5c5aac17d8',
    name: 'uid',
    type: 'image',
    label: 'Uid',
    order: 17,
    values: [],
    required: false,
  },
  {
    id: '12ca83eb-febd-4353-bbf2-881dbd597b2a',
    name: 'email_of_auth_person',
    type: 'email',
    label: 'Email of Auth Person',
    order: 18,
    values: [],
    required: true,
  },
  {
    id: '3c54a9d1-09af-4df3-afac-550003be0cc4',
    name: 'phone_of_auth_person',
    type: 'phone',
    label: 'Phone of Auth Person',
    order: 19,
    values: [],
    required: false,
  },
  {
    id: '4a482f76-94ec-48e4-b80f-827b3297f404',
    name: 'expected_sales',
    type: 'number',
    label: 'Expected Sales',
    order: 20,
    values: [],
    required: true,
  },
];
