"use strict";

const Throat = require("throat");
const os = require("os");
const Plugin = require("../plugin");
const messages = require("../messages");

class Verda extends Plugin {
	constructor() {
		super();
	}
	load(context, targeted) {
		if (!context.resources.verda) {
			context.resources.verda = {};
			const cpus = os.cpus().length;
			context.resources.verda.mutex = Throat(cpus);
			context.message(messages.kind("bddy/Verda"), "Created mutex with capacity", cpus);
		}
	}
}

Verda.singleton = new Verda();

module.exports = Verda;
