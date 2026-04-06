export type InitType = 'react' | 'vue' | 'svelte' | 'vanilla' | 'library' | 'node';

export function getInitTemplate(type: InitType): string {
  const base = `import { Configuration } from '@rspack/core';
import path from 'path';
`;

  const templates: Record<InitType, string> = {
    react: `${base}
const config: Configuration = {
  entry: './src/index.tsx',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(process.cwd(), 'dist'),
    clean: true,
    publicPath: '/',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\\.(tsx?|jsx?)$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
              transform: {
                react: {
                  runtime: 'automatic',
                },
              },
            },
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [],
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
  },
};

export default config;
`,

    vue: `${base}
const config: Configuration = {
  entry: './src/main.ts',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(process.cwd(), 'dist'),
    clean: true,
    publicPath: '/',
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue'],
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\\.ts$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
              },
            },
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\\.css$/,
        use: ['vue-style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [],
  devServer: {
    port: 3000,
    hot: true,
  },
};

export default config;
`,

    svelte: `${base}
const config: Configuration = {
  entry: './src/main.ts',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(process.cwd(), 'dist'),
    clean: true,
    publicPath: '/',
  },
  resolve: {
    extensions: ['.ts', '.js', '.svelte'],
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
    conditionNames: ['svelte', 'browser', 'import'],
  },
  module: {
    rules: [
      {
        test: /\\.svelte$/,
        use: {
          loader: 'svelte-loader',
          options: {
            compilerOptions: {
              dev: process.env['NODE_ENV'] !== 'production',
            },
            hotReload: process.env['NODE_ENV'] !== 'production',
          },
        },
      },
      {
        test: /\\.ts$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
              },
            },
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [],
  devServer: {
    port: 3000,
    hot: true,
  },
};

export default config;
`,

    vanilla: `${base}
const config: Configuration = {
  entry: './src/index.ts',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(process.cwd(), 'dist'),
    clean: true,
    publicPath: '/',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\\.ts$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
              },
            },
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [],
  devServer: {
    port: 3000,
    hot: true,
  },
};

export default config;
`,

    library: `${base}
const config: Configuration = {
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(process.cwd(), 'dist'),
    clean: true,
    library: {
      type: 'module',
    },
    globalObject: 'this',
  },
  experiments: {
    outputModule: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\\.ts$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
              },
            },
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    // Add peer dependencies here, e.g.:
    // react: 'react',
  },
  optimization: {
    minimize: false,
  },
};

export default config;
`,

    node: `${base}
const config: Configuration = {
  target: 'node',
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(process.cwd(), 'dist'),
    clean: true,
    library: {
      type: 'commonjs2',
    },
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\\.ts$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
              },
            },
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  externalsPresets: {
    node: true,
  },
  optimization: {
    minimize: false,
  },
};

export default config;
`,
  };

  return templates[type];
}
