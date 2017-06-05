const { bddy, file, virt, any } = require("../index");
const fs = require("fs-extra");

const dir = file(`${__dirname}/sample1`);

bddy(function(ctx, def) {
	def(any.file(`${dir}/b.txt`), async function(target) {
		let prerequisites = await this.need(`${dir}/a.txt`);
		await this.run("cp", prerequisites[0], target);
	});

	def(any.file(`${dir}/c.txt`), async function(target) {
		let prerequisites = await this.need(`${dir}/b.txt`);
		await this.run("cp", prerequisites[0], target);
	});

	def(any.virt("knot"), async function(target) {
		await this.need(`${dir}/b.txt`);
	});

	def(any.file(`${dir}/d.txt`), async function(target) {
		let prerequisites = await this.need("knot");
		await this.run("cp", `${dir}/b.txt`, target);
	});

	def(any.file(`${dir}/e.txt`), async function(target) {
		let [$1, $2] = await this.need(`${dir}/c.txt`, `${dir}/d.txt`);
		let txt1 = await fs.readFile(`${$1}`, "utf-8");
		let txt2 = await fs.readFile(`${$2}`, "utf-8");
		console.log(txt1, txt2);
		await fs.writeFile(`${target}`, txt1 + "\n\n" + txt2);
		this.message(`${target} written.`);
	});

	def(any.file(`${dir}/subdir`), ctx.ensureDir);

	def(any.file(`${dir}/subdir/f.txt`), async function(target) {
		let [$1, $2] = await this.need(`${dir}/subdir`, `${dir}/e.txt`);
		await this.run("cp", `${$2}`, `${$1}/f.txt`);
	});
}).wish(`${dir}/subdir/f.txt`);
