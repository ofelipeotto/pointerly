const pkg = require('./package.json');
const name = pkg.name ?? '';
const nameCapitalize = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const postcssPresetEnv = require('postcss-preset-env');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const webpack = require('webpack');

function createConfig(mode) {

    const isProd = mode === 'production';

    return {
        mode,
        entry: './src/entry.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: isProd
                ? `${name}.min.js`
                : `${name}.bundle.js`,
            library: {
                name: nameCapitalize,
                type: 'umd',
                umdNamedDefine: true,
                export: 'default',
            },
            globalObject: 'this'
        },
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: [
                                        postcssPresetEnv({ browsers: 'last 2 versions' }),
                                        autoprefixer(),
                                        ...(isProd
                                            ? [cssnano({ preset: 'default' })]
                                            : [])
                                    ],
                                },
                            },
                        },
                    ]
                }
            ]
        },
        optimization: isProd
            ? {
                minimize: true,
                minimizer: [
                    new TerserPlugin({
                        extractComments: false,
                        terserOptions: {
                            compress: true,
                            keep_classnames: true,
                            //format: { comments: false }
                        }
                    })
                ]
            }
            : {},
        plugins: [
            new webpack.DefinePlugin({
                __VERSION__: JSON.stringify(pkg.version)
            }),
            new webpack.BannerPlugin({
                banner: `/*!
 * ${nameCapitalize} ${pkg.version}
 * ${pkg.homepage}
 * 
 * Copyright ${pkg.meta.year} — ${pkg.author}
 * Released under the MIT License
 */
`,
                raw: true,
                entryOnly: true
            }),
            new MiniCssExtractPlugin({ filename: isProd 
                ? `${name}.min.css` 
                : `${name}.bundle.css` }),
            new CompressionPlugin({ filename: '[file].gz' })
        ]
    };
}
 
module.exports = ['development', 'production'].map(createConfig);