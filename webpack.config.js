const path = require('path');

module.exports = {
	entry: {
		reddit: ['./src/reddit.js'],
		popup: ['./src/popup.js']
	  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
};