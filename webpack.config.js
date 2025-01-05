const path = require("path-browserify");

module.exports = {
  resolve: {
    fallback: {
      vm: require.resolve("path-browserify"),
    },
  },
};
