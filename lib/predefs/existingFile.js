"use strict";

const { ExistsFile, AnyDir } = require("../targets/file");
const fs = require("fs-extra");

module.exports = function(defs) {
	defs.def(new ExistsFile(), async function(target) {
		this.fulfill(target, await target.getUpdateTime());
	});
	defs.def(new AnyDir(), async function(target) {
		await fs.ensureDir("" + target);
	});
};
