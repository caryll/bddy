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

async function build(defs, argv, _options) {
	const defaultOptions = {
		parallelJobs: argv.j
	};
	const options = Object.assign(defaultOptions, _options);
	const bddyInst = bddy(defs, argv, options);
	const targets = argv.targets || argv._;
	if (argv._.length) {
		for (let wish of argv._) {
			await bddyInst.wish(wish);
		}
	} else {
		await bddyInst.wish("start");
	}
}

function parseARGV(yargs, _argopt) {
	const argopt = Object.assign(
		{
			j: {
				alias: "jobs",
				number: true,
				default: 0,
				requiresArg: true,
				describe: "Allow N jobs at once (incluences <run>); 0 for CPU cores of your system"
			}
		},
		_argopt
	);
	return yargs.options(argopt).argv;
}

module.exports = function(defs, argopt, options) {
	build(defs, parseARGV(yargs, argopt), options).catch(function(e) {
		const renderedError = pe.render(e);
		console.log(renderedError);
		if (!e.bddyIgnorable) process.exit(1);
	});
};
