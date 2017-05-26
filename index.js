const bddy = require('./lib/engine');
const defs = new bddy.Definitions();
const { file } = require('./lib/filepath');

defs.forall('src/*.js', async function (target) {
	await this.command('echo', 'source', target);
	await this.command('sleep', 2);
});
defs.forall('test/*.js', async function (target) {
	await this.need(
		file(`src/${target.name}.js`),
		file(`src/${target.name}.2.js`),
		file(`src/${target.name}.3.js`),
		file(`src/${target.name}.4.js`),
		file(`src/${target.name}.5.js`),
		file(`src/${target.name}.6.js`),
		file(`src/${target.name}.7.js`),
		file(`src/${target.name}.8.js`),
		file(`src/${target.name}.9.js`)
	)
	await this.need(file(`src/${target.name}.js`))
	await this.command('echo', 'hello', target)
});

defs.run(file('test/a.js'), defs.createContext())