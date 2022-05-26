import { defineConfig } from 'dumi';
import menus from './menus/index';

export default defineConfig({
  title: 'socket-manager',
  favicon: 'https://retail.gtimg.com/sr_mms_test/favicon.ico',
  // logo: "https://retail.gtimg.com/sr_mms_test/favicon.ico",
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
  navs: [
    {
      title: '指南',
      path: '/guide',
    },
    {
      title: 'socket-manager',
      path: '/socket-manager',
    },
    {
      title: 'git',
      path: 'git@github.com:xiyanma/socket-manager.github.io.git',
    },
  ],
  menus,
  // more config: https://d.umijs.org/config
});
