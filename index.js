const engine = require("./lib/engine");
const { file, present, anyfile } = require("./lib/targets/file");
const { virt, anyvirt } = require("./lib/targets/virtual");

const any = {
	file: anyfile,
	virt: anyvirt
};

exports._bddy = function() {
	return new engine.Context();
};
exports.file = file;
exports.present = present;
exports.virt = virt;

class BuildFunctionSet {
	constructor(context, coTFn, args) {
		this.context = context;
		this.coTFn = coTFn;
		this.args = args;
	}
	def(f) {
		return this.context.def(this.coTFn(...this.args), f);
	}
	alsodir() {
		new BuildFunctionSet(this.context, any.file, [
			this.args[0].replace(/[/\\][^/\\]+$/, "")
		]).def(this.context.ensureDir);
		return this;
	}
}
const BuildEntryT = (ctx, coTFn) => (...args) => new BuildFunctionSet(ctx, coTFn, args);

//predefs
const existingFile = require("./lib/predefs/existingFile");
const Verda = require("./lib/plugins/verda");
const Command = require("./lib/plugins/command");
const Dir = require("./lib/plugins/dir");
const FileOps = require("./lib/plugins/fileops");

exports.bddy = function(defs, argv) {
	let r = new engine.Context();
	r.loadDefinitions(existingFile);
	r.loadPlugin({ verda: new Verda(argv) });
	r.loadPlugin({ command: new Command(), dir: new Dir(), fileops: new FileOps() });
	const forany = {};
	for (let type in any) {
		forany[type] = BuildEntryT(r, any[type]);
	}

	if (defs) {
		defs.call(r, r, forany, argv, exports);
	}
	return r;
};
