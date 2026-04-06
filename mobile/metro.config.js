const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

const webMock = path.resolve(__dirname, "stripe-web-mock.js");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const nativeOnlyModules = [
    "@stripe/stripe-react-native",
    "@react-native-community/netinfo",
  ];
  if (platform === "web" && nativeOnlyModules.includes(moduleName)) {
    return { type: "sourceFile", filePath: webMock };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
