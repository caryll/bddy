"use strict";

const { ExistsFile } = require("../targets/file");

module.exports = function(defs) {
	defs.def(new ExistsFile(), async function(target) {
		this.fulfill(target, await target.getUpdateTime());
	});
};
