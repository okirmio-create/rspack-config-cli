export type PluginName = 'html' | 'copy' | 'define' | 'progress' | 'bundle-analyzer' | 'mini-css-extract';

export function getPluginSnippet(name: PluginName): { imports: string; plugin: string } {
  const plugins: Record<PluginName, { imports: string; plugin: string }> = {
    html: {
      imports: `import HtmlWebpackPlugin from 'html-webpack-plugin';`,
      plugin: `new HtmlWebpackPlugin({
    template: './public/index.html',
    filename: 'index.html',
    inject: true,
    minify: process.env['NODE_ENV'] === 'production' ? {
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
    } : false,
  })`,
    },

    copy: {
      imports: `import CopyPlugin from 'copy-webpack-plugin';`,
      plugin: `new CopyPlugin({
    patterns: [
      {
        from: 'public',
        to: '.',
        globOptions: {
          ignore: ['**/index.html'],
        },
      },
    ],
  })`,
    },

    define: {
      imports: `import { DefinePlugin } from '@rspack/core';`,
      plugin: `new DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env['NODE_ENV'] || 'development'),
    '__DEV__': process.env['NODE_ENV'] !== 'production',
    '__VERSION__': JSON.stringify(process.env['npm_package_version']),
  })`,
    },

    progress: {
      imports: `import { ProgressPlugin } from '@rspack/core';`,
      plugin: `new ProgressPlugin({
    profile: false,
  })`,
    },

    'bundle-analyzer': {
      imports: `import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';`,
      plugin: `process.env['ANALYZE'] && new BundleAnalyzerPlugin({
    analyzerMode: 'static',
    reportFilename: 'bundle-report.html',
    openAnalyzer: true,
  })`,
    },

    'mini-css-extract': {
      imports: `import MiniCssExtractPlugin from 'mini-css-extract-plugin';`,
      plugin: `new MiniCssExtractPlugin({
    filename: 'css/[name].[contenthash:8].css',
    chunkFilename: 'css/[id].[contenthash:8].css',
  })`,
    },
  };

  return plugins[name];
}
