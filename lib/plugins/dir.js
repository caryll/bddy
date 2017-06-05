"use strict";

const Plugin = require("../plugin");
const fs = require("fs-extra");

class Dir extends Plugin {
	constructor() {
		super();
	}
	load(ctx, targeted) {
		ctx.ensureDir = async function(target) {
			return await fs.ensureDir("" + target);
		};
	}
}

module.exports = Dir;
