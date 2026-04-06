export type LoaderType = 'css' | 'sass' | 'less' | 'postcss' | 'svg' | 'image' | 'font' | 'wasm';

export function getLoaderSnippet(type: LoaderType): string {
  const loaders: Record<LoaderType, string> = {
    css: `// CSS Loader
{
  test: /\\.css$/,
  use: ['style-loader', 'css-loader'],
}`,

    sass: `// Sass/SCSS Loader
{
  test: /\\.(scss|sass)$/,
  use: [
    'style-loader',
    'css-loader',
    {
      loader: 'sass-loader',
      options: {
        implementation: require('sass'),
        sassOptions: {
          fiber: false,
        },
      },
    },
  ],
}`,

    less: `// Less Loader
{
  test: /\\.less$/,
  use: [
    'style-loader',
    'css-loader',
    {
      loader: 'less-loader',
      options: {
        lessOptions: {
          javascriptEnabled: true,
        },
      },
    },
  ],
}`,

    postcss: `// PostCSS Loader
{
  test: /\\.css$/,
  use: [
    'style-loader',
    'css-loader',
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [
            'postcss-preset-env',
            // 'tailwindcss',
            // 'autoprefixer',
          ],
        },
      },
    },
  ],
}`,

    svg: `// SVG Loader (as React component or URL)
{
  test: /\\.svg$/i,
  issuer: /\\.[jt]sx?$/,
  use: [
    {
      loader: '@svgr/webpack',
      options: {
        typescript: true,
        dimensions: false,
      },
    },
  ],
}`,

    image: `// Image Asset Modules
{
  test: /\\.(png|jpe?g|gif|webp|avif)$/i,
  type: 'asset',
  parser: {
    dataUrlCondition: {
      maxSize: 8 * 1024, // 8kb inline limit
    },
  },
  generator: {
    filename: 'images/[name].[contenthash:8][ext]',
  },
}`,

    font: `// Font Asset Modules
{
  test: /\\.(woff2?|eot|ttf|otf)$/i,
  type: 'asset/resource',
  generator: {
    filename: 'fonts/[name].[contenthash:8][ext]',
  },
}`,

    wasm: `// WebAssembly Modules
{
  test: /\\.wasm$/,
  type: 'webassembly/async',
}
// Also add to config root:
// experiments: { asyncWebAssembly: true }`,
  };

  return loaders[type];
}
