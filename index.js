const engine = require('./lib/engine');
const { file } = require('./lib/filepath');

exports.def = function (F) {
	let defs = new engine.Definitions;
	F.call(defs, defs);
	return defs;
}
exports.run = function (defs, target) {
	return defs.run(target, defs.createContext()).catch(function (ex) { console.log(ex) });
}
exports.file = file;