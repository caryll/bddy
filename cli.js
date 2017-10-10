const yargs = require("yargs");
const { bddy } = require("bddy-core");
const PrettyError = require("pretty-error");
const pe = new PrettyError();

pe.appendStyle({
	"pretty-error > header > title > kind": { display: "none" },
	"pretty-error > header > colon": { display: "none" },
	"pretty-error > header > message": {
		color: "bright-white",
		background: "cyan",
		padding: "0 0"
	},
	"pretty-error > trace > item": { marginLeft: 2, bullet: '"<grey>-</grey>"' },
	"pretty-error > trace > item > header > pointer > file": { color: "bright-cyan" },
	"pretty-error > trace > item > header > pointer > colon": { color: "cyan" },
	"pretty-error > trace > item > header > pointer > line": { color: "bright-cyan" },
	"pretty-error > trace > item > header > what": { color: "bright-white" },
	"pretty-error > trace > item > footer > addr": { display: "none" }
});

async function build(defs, argv) {
	const bddyInst = bddy(defs, argv);
	const targets = argv.targets || argv._;
	if (argv._.length) {
		for (let wish of argv._) {
			await bddyInst.wish(wish);
		}
	} else {
		await bddyInst.wish("start");
	}
}

module.exports = function(defs, _argv) {
	build(defs, _argv || yargs.argv).catch(function(e) {
		const renderedError = pe.render(e);
		console.log(renderedError);
		if (!e.bddyIgnorable) process.exit(1);
	});
};
