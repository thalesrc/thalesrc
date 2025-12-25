const tailwindcss = require('@tailwindcss/postcss');
const path = require('path');

module.exports = {
  plugins: [
    tailwindcss({
      base: path.resolve(__dirname, "../"),
      // Disable Tailwind's built-in optimizer to avoid the source(none) parsing issue
      optimize: false,
    })
  ],
}
