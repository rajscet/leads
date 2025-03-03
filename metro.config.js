const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const path = require("path");

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  transformer: {
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  },
  resolver: {
    enableGlobalPackages: true,
    assetExts: assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...sourceExts, "svg"],
    extraNodeModules: {
      assets: path.resolve(__dirname, "src/assets"),
      components: path.resolve(__dirname, "src/components"),
      constants: path.resolve(__dirname, "src/constants"),
      helpers: path.resolve(__dirname, "src/helpers"),
      navigation: path.resolve(__dirname, "src/navigation"),
      screens: path.resolve(__dirname, "src/screens"),
      services: path.resolve(__dirname, "src/services"),
      reduxData: path.resolve(__dirname, "src/reduxData"),
      providers: path.resolve(__dirname, "src/providers"),
      stacks: path.resolve(__dirname, "src/navigation/stacks"),
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
