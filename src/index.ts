import { program } from "commander";
import chalk from "chalk";
import { writeFileSync, existsSync } from "fs";
import { resolve } from "path";

// ─── Init ────────────────────────────────────────────────────────────────────

const RSPACK_CONFIG = `import { defineConfig } from "@rspack/cli";
import { rspack } from "@rspack/core";
import HtmlRspackPlugin from "html-rspack-plugin";

export default defineConfig({
  entry: {
    main: "./src/index.ts",
  },

  output: {
    filename: "[name].[contenthash].js",
    chunkFilename: "[name].[contenthash].chunk.js",
    path: __dirname + "/dist",
    clean: true,
    publicPath: "auto",
  },

  module: {
    rules: [
      // TypeScript / JavaScript via built-in SWC
      {
        test: /\\.(ts|tsx|js|jsx)$/,
        use: {
          loader: "builtin:swc-loader",
          options: {
            jsc: {
              parser: {
                syntax: "typescript",
                tsx: true,
              },
              transform: {
                react: {
                  runtime: "automatic",
                },
              },
            },
            env: {
              targets: "Chrome >= 87, Firefox >= 78, Safari >= 14",
            },
          },
        },
        exclude: /node_modules/,
      },
      // CSS
      {
        test: /\\.css$/,
        use: ["style-loader", "css-loader"],
        type: "javascript/auto",
      },
      // CSS Modules
      {
        test: /\\.module\\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: { modules: true },
          },
        ],
        type: "javascript/auto",
      },
      // Images / assets
      {
        test: /\\.(png|jpg|jpeg|gif|svg|ico|webp)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/images/[hash][ext]",
        },
      },
      // Fonts
      {
        test: /\\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/fonts/[hash][ext]",
        },
      },
    ],
  },

  plugins: [
    new HtmlRspackPlugin({
      template: "./public/index.html",
      title: "My Rspack App",
      favicon: "./public/favicon.ico",
    }),
    new rspack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "development"),
    }),
    new rspack.ProgressPlugin(),
  ],

  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendors: {
          test: /[\\\\/]node_modules[\\\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin({
        minimizerOptions: {
          minify: true,
          compress: true,
          mangle: true,
        },
      }),
      new rspack.LightningCssMinimizerRspackPlugin(),
    ],
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    alias: {
      "@": __dirname + "/src",
    },
  },

  devServer: {
    port: 3000,
    hot: true,
    liveReload: true,
    open: true,
    historyApiFallback: true,
    compress: true,
    proxy: [
      {
        context: ["/api"],
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    ],
    static: {
      directory: __dirname + "/public",
    },
  },

  experiments: {
    css: true,
    asyncWebAssembly: true,
    layers: true,
  },

  stats: {
    preset: "normal",
    colors: true,
  },
});
`;

// ─── Migrate guide ───────────────────────────────────────────────────────────

const MIGRATE_GUIDE = `
${chalk.bold.cyan("╔══════════════════════════════════════════════════════╗")}
${chalk.bold.cyan("║        Webpack → Rspack Migration Guide              ║")}
${chalk.bold.cyan("╚══════════════════════════════════════════════════════╝")}

${chalk.bold.yellow("1. Installation")}
   ${chalk.dim("# Remove webpack")}
   npm remove webpack webpack-cli webpack-dev-server

   ${chalk.dim("# Install Rspack")}
   npm install -D @rspack/core @rspack/cli

${chalk.bold.yellow("2. Config file rename")}
   ${chalk.green("webpack.config.js")} → ${chalk.green("rspack.config.js")} ${chalk.dim("(or .ts)")}
   ${chalk.dim("Import change:")}
   ${chalk.red('- const { DefinePlugin } = require("webpack");')}
   ${chalk.green('+ const { rspack } = require("@rspack/core");')}
   ${chalk.green('+ const { DefinePlugin } = rspack;')}

${chalk.bold.yellow("3. Package.json scripts")}
   ${chalk.red('- "start": "webpack serve"')}
   ${chalk.green('+ "start": "rspack serve"')}

   ${chalk.red('- "build": "webpack --mode production"')}
   ${chalk.green('+ "build": "rspack build --mode production"')}

${chalk.bold.yellow("4. Loader changes")}
   ┌─────────────────────────────────────────────────────┐
   │  Webpack loader          │  Rspack equivalent        │
   ├──────────────────────────┼───────────────────────────┤
   │  babel-loader            │  builtin:swc-loader       │
   │  ts-loader               │  builtin:swc-loader       │
   │  @swc/core + swc-loader  │  builtin:swc-loader       │
   │  css-loader              │  css-loader (same)        │
   │  style-loader            │  style-loader (same)      │
   │  sass-loader             │  sass-loader (same)       │
   │  less-loader             │  less-loader (same)       │
   │  file-loader             │  type: "asset/resource"   │
   │  url-loader              │  type: "asset/inline"     │
   │  raw-loader              │  type: "asset/source"     │
   └─────────────────────────────────────────────────────┘

${chalk.bold.yellow("5. Plugin changes")}
   ┌─────────────────────────────────────────────────────────────────────────┐
   │  Webpack plugin                   │  Rspack equivalent                   │
   ├───────────────────────────────────┼──────────────────────────────────────┤
   │  html-webpack-plugin              │  rspack.HtmlRspackPlugin (built-in)  │
   │  copy-webpack-plugin              │  rspack.CopyRspackPlugin (built-in)  │
   │  mini-css-extract-plugin          │  rspack.CssExtractRspackPlugin       │
   │  webpack.DefinePlugin             │  rspack.DefinePlugin (built-in)      │
   │  webpack.ProvidePlugin            │  rspack.ProvidePlugin (built-in)     │
   │  webpack.BannerPlugin             │  rspack.BannerPlugin (built-in)      │
   │  webpack.IgnorePlugin             │  rspack.IgnorePlugin (built-in)      │
   │  webpack.HotModuleReplacementPlugin│ rspack.HotModuleReplacementPlugin   │
   │  TerserPlugin                     │  rspack.SwcJsMinimizerRspackPlugin   │
   │  CssMinimizerPlugin               │  rspack.LightningCssMinimizerPlugin  │
   └─────────────────────────────────────────────────────────────────────────┘

${chalk.bold.yellow("6. builtin:swc-loader (replaces babel-loader / ts-loader)")}
   ${chalk.dim("webpack.config.js (before):")}
   ${chalk.red(`{
     test: /\\.(ts|tsx)$/,
     use: [
       { loader: "babel-loader", options: { presets: ["@babel/preset-typescript"] } }
     ]
   }`)}

   ${chalk.dim("rspack.config.js (after):")}
   ${chalk.green(`{
     test: /\\.(ts|tsx)$/,
     use: {
       loader: "builtin:swc-loader",
       options: {
         jsc: { parser: { syntax: "typescript", tsx: true } }
       }
     }
   }`)}

${chalk.bold.yellow("7. CSS experiments (Rspack-native CSS handling)")}
   ${chalk.dim("Enable in rspack.config.js:")}
   ${chalk.green(`experiments: { css: true }`)}
   ${chalk.dim("Then use:")}
   ${chalk.green('type: "css"         // for plain CSS modules')}
   ${chalk.green('type: "css/module"  // for CSS Modules')}

${chalk.bold.yellow("8. Performance expectations")}
   • Cold build:    5–10× faster than webpack
   • Incremental:   3–5× faster HMR
   • Memory usage:  significantly lower
   • Compatibility: ~80–90% webpack config compatible out of the box

${chalk.bold.yellow("9. Unsupported / known gaps")}
   • Some webpack loaders with native bindings may not work
   • Custom webpack plugin hooks may differ (check Rspack plugin API)
   • Some community plugins have no Rspack equivalent yet

${chalk.bold.yellow("10. Official docs")}
    ${chalk.underline("https://rspack.dev/guide/migration/webpack")}
`;

// ─── Plugin configs ──────────────────────────────────────────────────────────

const PLUGINS: Record<string, string> = {
  HtmlRspackPlugin: `${chalk.bold.cyan("HtmlRspackPlugin")} ${chalk.dim("— Built-in HTML generation plugin (no extra install needed)")}

${chalk.bold("Import:")}
  ${chalk.green('import { rspack } from "@rspack/core";')}
  ${chalk.dim("// or destructure:")}
  ${chalk.green('const { HtmlRspackPlugin } = rspack;')}

${chalk.bold("Full config:")}
  ${chalk.yellow(`new rspack.HtmlRspackPlugin({
  // Required
  template: "./public/index.html",   // Path to HTML template

  // Output
  filename: "index.html",            // Output filename (default: "index.html")
  publicPath: "auto",                // Override output.publicPath

  // Page metadata
  title: "My Rspack App",            // Injected as <title> (use <%= htmlRspackPlugin.options.title %>)
  favicon: "./public/favicon.ico",   // Copied and linked automatically

  // Script / style injection
  inject: "body",                    // "head" | "body" | true | false
  scriptLoading: "defer",            // "blocking" | "defer" | "module"

  // Chunks
  chunks: ["main", "vendors"],       // Only include specific chunks
  excludeChunks: ["admin"],          // Exclude specific chunks
  chunksSortMode: "auto",            // "auto" | "manual" | "none"

  // Caching
  hash: true,                        // Append webpack hash to URLs

  // Minification
  minify: true,                      // Minify HTML in production

  // Template variables
  templateParameters: {
    buildDate: new Date().toISOString(),
    appVersion: process.env.npm_package_version,
  },

  // Multiple pages: repeat plugin instance per page
  // new HtmlRspackPlugin({ filename: "about.html", chunks: ["about"] })
})`)}

${chalk.bold("Multiple pages example:")}
  ${chalk.green(`plugins: [
  new rspack.HtmlRspackPlugin({ template: "./src/pages/index.html", chunks: ["main"] }),
  new rspack.HtmlRspackPlugin({ filename: "about.html", template: "./src/pages/about.html", chunks: ["about"] }),
]`)}

${chalk.bold("Docs:")} ${chalk.underline("https://rspack.dev/plugins/rspack/html-rspack-plugin")}
`,

  CopyRspackPlugin: `${chalk.bold.cyan("CopyRspackPlugin")} ${chalk.dim("— Built-in static asset copy plugin (no extra install needed)")}

${chalk.bold("Import:")}
  ${chalk.green('import { rspack } from "@rspack/core";')}
  ${chalk.dim("// or:")}
  ${chalk.green('const { CopyRspackPlugin } = rspack;')}

${chalk.bold("Full config:")}
  ${chalk.yellow(`new rspack.CopyRspackPlugin({
  patterns: [
    // ── Simple: copy a whole directory ──
    {
      from: "public",                // Source (relative to context, default: webpack root)
      to: ".",                       // Destination (relative to output.path)
    },

    // ── Copy with glob ──
    {
      from: "src/assets/**/*.{png,svg}",
      to: "assets/[name][ext]",
    },

    // ── Single file ──
    {
      from: "src/manifest.json",
      to: "manifest.json",
    },

    // ── Transform file content ──
    {
      from: "src/version.txt",
      to: "version.txt",
      transform: (content: Buffer) => {
        return content.toString().replace("__VERSION__", process.env.npm_package_version ?? "0.0.0");
      },
    },

    // ── Exclude patterns ──
    {
      from: "static",
      to: "static",
      globOptions: {
        ignore: ["**/*.map", "**/.DS_Store"],
      },
    },

    // ── Force overwrite even if newer ──
    {
      from: "robots.txt",
      to: "robots.txt",
      force: true,
    },

    // ── Copy without flattening directory structure ──
    {
      from: "docs",
      to: "docs",
      noErrorOnMissing: true,        // Don't error if source missing
    },
  ],

  // Options applied to all patterns (can be overridden per-pattern)
  options: {
    concurrency: 100,                // Max concurrent copies
  },
})`)}

${chalk.bold("Docs:")} ${chalk.underline("https://rspack.dev/plugins/rspack/copy-rspack-plugin")}
`,

  SwcJsMinimizerRspackPlugin: `${chalk.bold.cyan("SwcJsMinimizerRspackPlugin")} ${chalk.dim("— Built-in SWC-based JS minifier (replaces TerserPlugin)")}

${chalk.bold("Import:")}
  ${chalk.green('import { rspack } from "@rspack/core";')}
  ${chalk.dim("// or:")}
  ${chalk.green('const { SwcJsMinimizerRspackPlugin } = rspack;')}

${chalk.bold("Usage:")}
  ${chalk.dim("Place in optimization.minimizer")}

${chalk.bold("Full config:")}
  ${chalk.yellow(`new rspack.SwcJsMinimizerRspackPlugin({
  // ── Include / Exclude ──
  include: /\\.js$/,                 // Only minify matching files (RegExp | string | array)
  exclude: /\\.min\\.js$/,           // Skip already-minified files

  // ── Extract comments ──
  extractComments: false,            // false = inline all comments (default)
                                     // true  = extract to *.js.LICENSE.txt
  // ── SWC minifier options ──
  minimizerOptions: {
    // Compression
    compress: {
      passes: 2,                     // Run compressor N times (more = smaller, slower)
      drop_console: true,            // Remove console.* calls in production
      drop_debugger: true,           // Remove debugger statements
      pure_funcs: ["console.log"],   // Treat these as side-effect-free
      dead_code: true,               // Remove unreachable code
      unused: true,                  // Drop unused variables
    },

    // Mangling
    mangle: {
      toplevel: true,                // Mangle top-level names (safe for bundles)
      keep_classnames: false,
      keep_fnames: false,
    },

    // Output formatting
    format: {
      comments: false,               // Strip all comments
      ascii_only: true,              // Escape non-ASCII characters
    },

    // Source maps
    // Rspack handles source maps via devtool option — no need to set here
    // source_map: false,
  },

  // ── Parallel ──
  parallel: true,                    // Use worker threads (default: true)
})`)}

${chalk.bold("Comparison with TerserPlugin:")}
  ${chalk.dim(`// webpack (before)
  optimization: {
    minimizer: [new TerserPlugin({ parallel: true, terserOptions: { compress: true } })]
  }

  // rspack (after) — same result, ~10× faster
  optimization: {
    minimizer: [new rspack.SwcJsMinimizerRspackPlugin({ minimizerOptions: { compress: true } })]
  }`)}

${chalk.bold("Also available — CSS minimizer:")}
  ${chalk.green("new rspack.LightningCssMinimizerRspackPlugin()")}
  ${chalk.dim("// Replaces css-minimizer-webpack-plugin — uses Lightning CSS (Rust)")}

${chalk.bold("Docs:")} ${chalk.underline("https://rspack.dev/plugins/rspack/swc-js-minimizer-rspack-plugin")}
`,
};

// ─── CLI ─────────────────────────────────────────────────────────────────────

program
  .name("rspack-config")
  .description(chalk.bold("CLI tool for Rspack configuration, migration guides, and plugin references"))
  .version("1.0.0");

// ── init ──────────────────────────────────────────────────────────────────────
program
  .command("init")
  .description("Create rspack.config.ts with entry, output, module rules, plugins, and devServer")
  .option("-o, --output <path>", "Output path for the config file", "rspack.config.ts")
  .option("-f, --force", "Overwrite existing file", false)
  .action((options: { output: string; force: boolean }) => {
    const outputPath = resolve(process.cwd(), options.output);

    if (existsSync(outputPath) && !options.force) {
      console.error(
        chalk.red(`✗ File already exists: ${options.output}\n`) +
          chalk.dim("  Use --force to overwrite.")
      );
      process.exit(1);
    }

    writeFileSync(outputPath, RSPACK_CONFIG, "utf8");

    console.log(chalk.green(`✔ Created ${options.output}`));
    console.log();
    console.log(chalk.bold("Next steps:"));
    console.log(`  ${chalk.cyan("npm install -D @rspack/core @rspack/cli")}`);
    console.log(`  ${chalk.cyan('  "start": "rspack serve"')}`);
    console.log(`  ${chalk.cyan('  "build": "rspack build --mode production"')}`);
    console.log();
    console.log(chalk.dim("Docs: https://rspack.dev/guide/start/quick-start"));
  });

// ── migrate ───────────────────────────────────────────────────────────────────
program
  .command("migrate")
  .description("Show migration guide from webpack to Rspack with config mapping")
  .action(() => {
    console.log(MIGRATE_GUIDE);
  });

// ── plugin ────────────────────────────────────────────────────────────────────
program
  .command("plugin <name>")
  .description(
    "Show Rspack built-in plugin config\n" +
      chalk.dim(
        "  Available: HtmlRspackPlugin, CopyRspackPlugin, SwcJsMinimizerRspackPlugin"
      )
  )
  .action((name: string) => {
    const key = Object.keys(PLUGINS).find(
      (k) => k.toLowerCase() === name.toLowerCase()
    );

    if (key === undefined) {
      console.error(chalk.red(`✗ Unknown plugin: "${name}"\n`));
      console.error(chalk.bold("Available plugins:"));
      Object.keys(PLUGINS).forEach((k) => console.error(`  • ${chalk.cyan(k)}`));
      process.exit(1);
    }

    console.log();
    console.log(PLUGINS[key] ?? "");
  });

program.parse(process.argv);
