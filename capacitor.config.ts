import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.panpan818.fphone",
  appName: "f小手机",
  webDir: "out",
  bundledWebRuntime: false,
  android: {
    allowMixedContent: true,
    backgroundColor: "#000000",
  },
};

export default config;
