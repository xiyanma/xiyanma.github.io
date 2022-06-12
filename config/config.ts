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
  navs: [
    {
      title: '快速上手',
      path: '/getting-started',
    },
    {
      title: '使用示例',
      path: '/examples',
    },
    {
      title: '贡献',
      path: '/contribute',
    },
    {
      title: 'git',
      path: 'https://github.com/xiyanma/xiyanma.github.io',
    },
  ],
});
