const Throat = require('throat');
const os = require('os');
const cpp = require('child-process-promise');

const Plugin = require('../plugin');

class Command extends Plugin {
	constructor() { super() }
	addResources(context) {
		if (context.resources.command) return;
		context.resources.command = {}
		context.resources.command.throat = Throat(os.cpus().length);
	}
	addMethods(context) {
		context.command = async function (cmd, ...args) {
			const t = this;
			return await context.resources.command.throat(function () {
				t.message([cmd, ...args].join(' '));
				let prom = cpp.spawn(cmd, args);
				let proc = prom.childProcess;
				proc.stdout.on('data', function (data) { process.stdout.write(data) });
				proc.stderr.on('data', function (data) { process.stderr.write(data) });
				return prom;
			})
		}
	}
}

module.exports = Command;