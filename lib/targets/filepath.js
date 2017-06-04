"use strict";

const path = require("path");
const Target = require("../target");
const fs = require("fs-extra");

class FilePath extends Target {
	constructor(str) {
		super(str);
		const p = path.parse(str);
		this.dir = p.dir;
		this.name = p.name;
		this.ext = p.ext;
	}
	toString() {
		let r = path.relative(process.cwd(), path.resolve(process.cwd(), path.join(this.dir, this.name + this.ext)));
		return r;
	}
	async needUpdate(that) {
		if (!await fs.exists(this.toString())) return true;
		let sthis = await fs.stat(this.toString());
		if (sthis.mtime < that) return true;
		return false;
	}
	async getUpdateTime() {
		if (!await fs.exists(this.toString())) return new Date();
		return (await fs.stat(this.toString())).mtime;
	}
}
FilePath.file = function(f) {
	return new FilePath(f);
};

module.exports = FilePath;
