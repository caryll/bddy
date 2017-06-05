const engine = require("./lib/engine");
const { file, anyfile } = require("./lib/targets/file");
const { virt, anyvirt } = require("./lib/targets/virtual");

exports._bddy = function() {
	return new engine.Context();
};
exports.file = file;
exports.virt = virt;
exports.any = {
	file: anyfile,
	virt: anyvirt
};

//predefs
const existingFile = require("./lib/predefs/existingFile");
const Command = require("./lib/plugins/command");
const Dir = require("./lib/plugins/dir");

exports.bddy = function(defs) {
	let r = new engine.Context();
	r.loadDefinitions(existingFile);
	r.loadPlugin({ command: new Command(), dir: new Dir() });
	if (defs) {
		defs.call(r, r, (...a) => r.def(...a));
	}
	return r;
};
