"use strict";

const path = require("path");
const { Target, CoTarget } = require("../target");
const fs = require("fs-extra");
const minimatch = require("minimatch");

// File Target
class File extends Target {
	constructor(str) {
		super(str);
		const p = path.parse(str);
		this.dir = p.dir;
		this.name = p.name;
		this.ext = p.ext;
		this.base = p.base;
	}
	toString() {
		let r = path.relative(
			process.cwd(),
			path.resolve(process.cwd(), path.join(this.dir, this.base))
		);
		return r;
	}
	toIdentifier() {
		return "<#FILE>" + this.toString();
	}
	async needUpdate(that) {
		if (!await fs.pathExists(this.toString())) return true;
		let t = await this.getUpdateTime();
		if (t < that) return true;
		return false;
	}
	async getUpdateTime() {
		let stat = null;
		try {
			stat = await fs.stat(this.toString());
		} catch (e) {
			return new Date();
		}
		return stat.mtime;
	}
}
function file(f) {
	return new File(f);
}

// File existance cotarget
class ExistsFile extends CoTarget {
	constructor() {
		super();
	}
	async match(target) {
		if (!(target instanceof File)) return false;
		return await fs.pathExists("" + target);
	}
	async createTargetFromString(name) {
		if (await fs.pathExists(name)) {
			return new File(name);
		}
	}
}

function existsFile(pat) {
	return new ExistsFile(pat);
}

// File pattern cotarget
class AnyFile extends CoTarget {
	constructor(pattern) {
		super();
		this.pattern = pattern;
	}
	async match(target) {
		return target instanceof File && minimatch(target + "", this.pattern);
	}
	async createTargetFromString(demand) {
		if (minimatch(demand, this.pattern)) {
			return new File(demand);
		}
	}
}

function anyfile(pat) {
	return new AnyFile(pat);
}

exports.File = File;
exports.file = file;
exports.AnyFile = AnyFile;
exports.anyfile = anyfile;
exports.ExistsFile = ExistsFile;
exports.existsFile = existsFile;
