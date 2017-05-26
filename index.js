const bddy = require('./lib/engine');
const defs = new bddy.Definitions();
const { file } = require('./lib/filepath');

defs.forall(`test/b.txt`, async function (target) {
	let prerequisites = await this.need(file(`test/a.txt`));
	await this.command('cp', prerequisites[0], target);
})

defs.forall(`test/c.txt`, async function (target) {
	let prerequisites = await this.need(file(`test/b.txt`));
	await this.command('cp', prerequisites[0], target);
})

defs.run(file('test/c.txt'), defs.createContext()).catch(function (ex) { console.log(ex) })