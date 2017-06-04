const engine = require("./lib/engine");
const { file } = require("./lib/targets/filepath");
const { virt } = require("./lib/targets/virtual");
const { anyfile } = require("./lib/cotargets/filepattern.js");
const { anyvirtual } = require("./lib/cotargets/anyvirtual.js");

exports.bddy = function() {
	return new engine.Context();
};
exports.file = file;
exports.virt = virt;
exports.anyfile = anyfile;
exports.anyvirtual = anyvirtual;
