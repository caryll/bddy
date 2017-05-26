const { def, run, file } = require('../index');
const fs = require('fs-extra')

const dir = file(`${__dirname}/sample1`);

const recipe = def(function () {
	this.forall(`${dir}/b.txt`, async function (target) {
		let prerequisites = await this.need(file(`${dir}/a.txt`));
		await this.command('cp', prerequisites[0], target);
	});

	this.forall(`${dir}/c.txt`, async function (target) {
		let prerequisites = await this.need(file(`${dir}/b.txt`));
		await this.command('cp', prerequisites[0], target);
	});

	this.forall(`${dir}/d.txt`, async function (target) {
		let prerequisites = await this.need(file(`${dir}/b.txt`));
		await this.command('cp', prerequisites[0], target);
	});

	this.forall(`${dir}/e.txt`, async function (target) {
		let [$1, $2] = await this.need(file(`${dir}/c.txt`), file(`${dir}/d.txt`));
		let txt1 = await fs.readFile(`${$1}`, 'utf-8');
		let txt2 = await fs.readFile(`${$2}`, 'utf-8');
		console.log(txt1, txt2);
		await fs.writeFile(`${target}`, txt1 + '\n\n' + txt2);
		this.message(`${target} written.`)
	});
});

run(recipe, file(`${dir}/e.txt`));