"use strict";

const Throat = require("throat");
const os = require("os");
const cpp = require("child-process-promise");

const Plugin = require("../plugin");
const messages = require("../messages");

class Command extends Plugin {
	constructor() {
		super();
	}
	load(context, targeted) {
		if (!context.resources.command) {
			context.resources.command = {};
			context.resources.command.throat = Throat(os.cpus().length);
		}
		context.command = async function(cmd, args, options) {
			const t = this;
			return await context.resources.command.throat(function() {
				t.message(messages.kind("Command"), cmd, args.join(" "));
				let prom = cpp.spawn(cmd, args, options);
				let proc = prom.childProcess;
				proc.stdout.on("data", function(data) {
					process.stdout.write(data);
				});
				proc.stderr.on("data", function(data) {
					process.stderr.write(data);
				});
				return prom;
			});
		};
		context.run = async function(cmd, ...args) {
			return await this.command(cmd, args);
		};
	}
}

module.exports = Command;
