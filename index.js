const bddy = require('./lib/engine');
const defs = new bddy.Definitions();
const { file } = require('./lib/filepath');

defs.forall('src/*.js', async function (target) {
	await this.command('echo', 'source', target)
});
defs.forall('test/*.js', async function (target) {
	await this.need(file(`src/${target.name}.js`))
	await this.need(file(`src/${target.name}.js`))
	await this.command('echo', 'hello', target)
});

defs.run(file('test/a.js'), defs.createContext())