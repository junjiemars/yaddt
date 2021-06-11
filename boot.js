/*
 * boot.js
 */

console.log('XXX');

const process = require('process');
process.argv.push('--');
process.argv.push('-h');
process.argv.push('--help');
process.argv.push('--install');
console.log(process.argv);

const argv = process.argv.slice(process.argv.indexOf('--') !== -1
																? process.argv.indexOf('--') + 1
																: 1);
const getopt = require('minimist');
const options = getopt(argv);

if (options._ && options.length > 0) {
		console.log('!TODO: show help');
		process.exit(1);
}
if (options.install) {
		console.log('!TODO: install command');
}

/* eof */
