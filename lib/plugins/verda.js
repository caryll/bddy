"use strict";

const Throat = require("throat");
const os = require("os");
const Plugin = require("../plugin");
const messages = require("../messages");

class Verda extends Plugin {
	constructor(_argv) {
		super();
		const argv = _argv || {};
		this.parallelJobs = argv.j - 0 || os.cpus().length;
	}
	load(context, targeted) {
		if (!context.resources.verda) {
			context.resources.verda = {};
			context.resources.verda.mutex = Throat(this.parallelJobs);
			context.log("Parallel capacity =", this.parallelJobs);
		}
	}
}

Verda.singleton = new Verda();

module.exports = Verda;
