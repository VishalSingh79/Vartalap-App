// module.exports = {
//   presets: ['module:@react-native/babel-preset'],
// };
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['dotenv-import', {
      moduleName: '@env',
      path: '.env',
      safe: false,
      allowUndefined: true,
    }],
  ],
};