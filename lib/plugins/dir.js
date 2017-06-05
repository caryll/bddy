"use strict";

const Plugin = require("../plugin");
const Verda = require("./verda");
const fs = require("fs-extra");

class Dir extends Plugin {
	constructor() {
		super();
	}
	load(context, targeted) {
		Verda.singleton.load(context, targeted);
		context.ensureDir = async function(target) {
			return await fs.ensureDir("" + target);
		};
	}
}

module.exports = Dir;
