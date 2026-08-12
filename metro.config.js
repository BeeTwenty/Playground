// Metro config: alias a deep import used by expo-router to the package entry.
// This is a safe fallback when the bundler can't resolve "react-native-web/dist/index".
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver = config.resolver || {};
config.resolver.alias = Object.assign({}, config.resolver.alias, {
  'react-native-web/dist/index': 'react-native-web',
});

module.exports = config;
