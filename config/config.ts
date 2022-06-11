import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'socket-manager',
  favicon: 'https://retail.gtimg.com/sr_mms_test/favicon.ico',
  outputPath: 'docs-dist',
  dynamicImport: {},
  exportStatic: {},
  manifest: {},
  mode: 'site',
  resolve: {
    includes: [
      'docs',
      'packages/socket-manager/src',
      'packages/socket-connect/src',
    ],
  },
  extraBabelPlugins: [
    [
      'babel-plugin-import',
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
      },
      'antd',
    ],
  ],
  nodeModulesTransform: {
    type: 'none',
    exclude: [],
  },
});
