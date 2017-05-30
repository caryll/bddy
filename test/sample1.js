const { bddy, file, virt, anyfile, anyvirtual } = require('../index');
const Command = require('../lib/plugins/command');
const fs = require('fs-extra')

const dir = file(`${__dirname}/sample1`);

bddy().loadPlugin(new Command).define(function () {
	this.for(anyfile(`${dir}/b.txt`), async function (target) {
		let prerequisites = await this.need(`${dir}/a.txt`);
		await this.command('cp', prerequisites[0], target);
	});

	this.for(anyfile(`${dir}/c.txt`), async function (target) {
		let prerequisites = await this.need(`${dir}/b.txt`);
		await this.command('cp', prerequisites[0], target);
	});

	this.for(anyvirtual('knot'), async function (target) {
		await this.need(`${dir}/b.txt`);
	});

	this.for(anyfile(`${dir}/d.txt`), async function (target) {
		let prerequisites = await this.need('knot');
		await this.command('cp', `${dir}/b.txt`, target);
	});

	this.for(anyfile(`${dir}/e.txt`), async function (target) {
		let [$1, $2] = await this.need(`${dir}/c.txt`, `${dir}/d.txt`);
		let txt1 = await fs.readFile(`${$1}`, 'utf-8');
		let txt2 = await fs.readFile(`${$2}`, 'utf-8');
		console.log(txt1, txt2);
		await fs.writeFile(`${target}`, txt1 + '\n\n' + txt2);
		this.message(`${target} written.`)
	});
}).wish(`${dir}/e.txt`);