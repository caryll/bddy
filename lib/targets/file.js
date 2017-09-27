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
		if (p.dir && p.dir !== str) {
			this.dir = new Dir(p.dir);
		} else {
			this.dir = null;
		}
		this.dirPath = p.dir;
		this.name = p.name;
		this.ext = p.ext;
		this.base = p.base;
	}
	toString() {
		return path.relative(
			process.cwd(),
			path.resolve(process.cwd(), path.join("" + this.dirPath, this.base))
		);
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

class Dir extends File {
	constructor(str) {
		super(str);
		this.path = str;
	}
	async needUpdate(that) {
		if (!await fs.pathExists(this.toString())) return true;
		return false;
	}
	async getUpdateTime() {
		// We only check existance, set time to "very old".
		return new Date(1970, 1, 1, 0, 0, 0);
	}
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
		} else {
			return super.createTargetFromString();
		}
	}
}

// Directory creation cotarget
class AnyDir extends CoTarget {
	constructor() {
		super();
	}
	async match(target) {
		return target instanceof Dir;
	}
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
		if (minimatch(demand + "", this.pattern)) {
			return new File(demand);
		} else {
			return super.createTargetFromString();
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
exports.AnyDir = AnyDir;
