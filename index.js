const engine = require("./lib/engine");
const { file, anyfile } = require("./lib/targets/file");
const { virt, anyvirt } = require("./lib/targets/virtual");

const argv = require("yargs").argv;

exports._bddy = function() {
	return new engine.Context();
};
exports.file = file;
exports.virt = virt;
exports.any = {
	file: anyfile,
	virt: anyvirt
};
exports.argv = argv;

//predefs
const existingFile = require("./lib/predefs/existingFile");
const Command = require("./lib/plugins/command");
const Dir = require("./lib/plugins/dir");
const FileOps = require("./lib/plugins/fileops");

exports.bddy = function(defs) {
	let r = new engine.Context();
	r.loadDefinitions(existingFile);
	r.loadPlugin({ command: new Command(), dir: new Dir(), fileops: new FileOps() });
	if (defs) {
		defs.call(r, r, (...a) => r.def(...a));
	}
	return r;
};

exports.build = async function(defs) {
	const bddy = exports.bddy(defs);
	if (argv._.length) {
		for (let wish of argv._) {
			await bddy.wish(wish);
		}
	} else {
		await bddy.wish("start");
	}
};
