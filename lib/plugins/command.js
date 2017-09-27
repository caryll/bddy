"use strict";

const cpp = require("child-process-promise");

const Verda = require("./verda");
const Plugin = require("../plugin");
const messages = require("../messages");

function flatten(args) {
	let ans = [];
	for (let x of args) {
		if (x == null) continue;
		else if (Array.isArray(x)) ans = [...ans, ...flatten(x)];
		else ans.push(x);
	}
	return ans;
}

class Command extends Plugin {
	constructor() {
		super();
	}
	load(context, targeted) {
		if (!context.resources.verda) Verda.singleton.load(context, targeted);
		context.command = async function(cmd, args, options, interactive) {
			const t = this;
			args = flatten(args);
			return await context.resources.verda.mutex(function() {
				t.message(
					messages.kind("Command"),
					cmd,
					args.join(" "),
					options && options.cwd ? messages.kind("in") + " " + options.cwd : ""
				);
				let prom = cpp.spawn(cmd, args, options);
				let proc = prom.childProcess;
				if (!interactive) {
					proc.stdout.on("data", function(data) {
						process.stdout.write(data);
					});
					proc.stderr.on("data", function(data) {
						process.stderr.write(data);
					});
				}
				return prom;
			});
		};
		context.cd = function(dir) {
			return {
				run: function(cmd, ...args) {
					return context.command(cmd, args, { cwd: dir });
				},
				runInteractive: function(cmd, ...args) {
					return context.command(cmd, args, { cwd: dir, stdio: "inherit" }, true);
				}
			};
		};
		context.run = function(cmd, ...args) {
			return this.command(cmd, args);
		};
		context.runInteractive = function(cmd, ...args) {
			return context.command(cmd, args, { stdio: "inherit" }, true);
		};
	}
}

module.exports = Command;
