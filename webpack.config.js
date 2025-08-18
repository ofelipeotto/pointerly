const name = 'Hoverly';
const nameLowerCase = name.toLowerCase();

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); 
const postcssPresetEnv = require('postcss-preset-env');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = [
    {
        mode: 'development',
        entry: './src/entry.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: `${nameLowerCase}.bundle.js`,
            library: {
                name: name,
                type: 'umd', // CommonJS, AMD and global
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
                                        postcssPresetEnv({
                                            browsers: 'last 2 versions'
                                        }),
                                        autoprefixer(),
                                    ],
                                },
                            },
                        },
                    ]
                },
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({ filename: `${nameLowerCase}.bundle.css` }),
            new CompressionPlugin({ filename: '[file].gz' })
        ]
    },
    // Minify
    {
        mode: 'production',
        entry: './src/entry.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: `${nameLowerCase}.min.js`,
            library: {
                name: name,
                type: 'umd',      // CommonJS, AMD and global
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
                                        postcssPresetEnv({
                                            browsers: 'last 2 versions'
                                        }),
                                        autoprefixer(),
                                        cssnano({ preset: 'default' })
                                    ],
                                },
                            },
                        },
                    ]
                }
            ]
        },
        optimization: {
            minimize: true,
            minimizer: [new TerserPlugin({ terserOptions: { compress: true } })]
        },
        plugins: [
            new MiniCssExtractPlugin({ filename: `${nameLowerCase}.min.css` }),
            new CompressionPlugin({ filename: '[file].gz' })
        ]
    }
];