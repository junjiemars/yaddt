/*
 * boot.js
 */

const process = require('process');
const argv = process.argv.slice(process.argv.indexOf('--') !== -1
																? process.argv.indexOf('--') + 1
																: 1);
const getopt = require('minimist');
const options = getopt(argv);

if ((options._ && options.length > 0)
		|| (options.h || options.help)) {
		console.log('!TODO: show help');
		process.exit(1);
}

if (options.install) {
		console.log('!TODO: install command');
}

/* eof */
