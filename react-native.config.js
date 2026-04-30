const path = require("path");

module.exports = {
  dependencies: {
    "react-native-nitro-modules": {
      root: path.resolve(__dirname, "node_modules/react-native-nitro-modules"),
      platforms: {
        android: {
          sourceDir: path.resolve(
            __dirname,
            "node_modules/react-native-nitro-modules/android"
          ),
          packageImportPath: "import com.margelo.nitro.NitroModulesPackage;",
          packageInstance: "new NitroModulesPackage()",
        },
      },
    },
  },
};
