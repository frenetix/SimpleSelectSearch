module.exports = {
  entry: "./chrome/js/background.js",
  output: {
    filename: "bundle.js",
    path: __dirname + "/chrome/dist",
  },
  mode: "development",
  devtool: "source-map",
};
