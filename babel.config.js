module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          assets: './src/assets',
          components: './src/components',
          constants: './src/constants',
          helpers: './src/helpers',
          navigation: './src/navigation',
          screens: './src/screens',
          services: './src/services',
          reduxData: './src/reduxData',
          providers: './src/providers',
          stacks: './src/navigation/stacks',
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      },
    ],
    'react-native-reanimated/plugin',
  ],
  overrides: [
    {
      plugins: [['@babel/plugin-transform-private-methods', { loose: true }]],
    },
  ],
};
