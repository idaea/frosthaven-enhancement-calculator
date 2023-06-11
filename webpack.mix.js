const mix = require("laravel-mix");
const path = require("path");

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.setPublicPath("./public");
mix.setResourceRoot("./");

mix.js("src/js/calculatorLoader.js", "public/js/calculator.js").react();

mix.sass("src/scss/calculator.scss", "public/css");

mix.version();

mix.options({
	terser: {
		extractComments: false,
	},
});
