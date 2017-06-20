const { bddy, file, virt, any } = require("../index");
const fs = require("fs-extra");

const dir = file(`${__dirname}/sample1`);

bddy(function(ctx, forany) {
	forany.file(`${dir}/b.txt`).def(async function(target) {
		let prerequisites = await this.need(`${dir}/a.txt`);
		await this.run("cp", prerequisites[0], target);
	});

	forany.file(`${dir}/c.txt`).def(async function(target) {
		let prerequisites = await this.need(`${dir}/b.txt`);
		await this.run("cp", prerequisites[0], target);
	});

	forany.virt("knot").def(async function(target) {
		await this.need(`${dir}/b.txt`);
	});

	forany.file(`${dir}/d.txt`).def(async function(target) {
		let prerequisites = await this.need("knot");
		await this.run("cp", `${dir}/b.txt`, target);
	});

	forany.file(`${dir}/e.txt`).def(async function(target) {
		let [$1, $2] = await this.need(`${dir}/c.txt`, `${dir}/d.txt`);
		let txt1 = await fs.readFile(`${$1}`, "utf-8");
		let txt2 = await fs.readFile(`${$2}`, "utf-8");
		console.log(txt1, txt2);
		await fs.writeFile(`${target}`, txt1 + "\n\n" + txt2);
		this.message(`${target} written.`);
	});

	forany.file(`${dir}/subdir`).def(ctx.ensureDir);

	forany.file(`${dir}/subdir/f.txt`).def(async function(target) {
		let [$1, $2] = await this.need(`${dir}/subdir`, `${dir}/e.txt`);
		await this.run("cp", `${$2}`, `${$1}/f.txt`);
	});
}).wish(`${dir}/subdir/f.txt`);
