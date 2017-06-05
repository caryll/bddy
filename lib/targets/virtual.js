"use strict";

const path = require("path");
const { Target, CoTarget } = require("../target");
const fs = require("fs-extra");

class Virtual extends Target {
	constructor(str) {
		super(str);
		this.upstream = null;
	}
	asPrerequisite(that) {
		let v = new Virtual(this.name);
		v.upstream = that;
		return v;
	}
	async needUpdate(that) {
		if (this.upstream) {
			return this.upstream.needUpdate(that);
		} else {
			return true;
		}
	}
	async getUpdateTime(t) {
		return t;
	}
}
function virt(f) {
	return new Virtual(f);
}

class AnyVirtual extends CoTarget {
	constructor(pattern) {
		super();
		this.pattern = pattern;
	}
	async match(target) {
		return target instanceof Virtual && target + "" === this.pattern;
	}
	async createTargetFromString(name) {
		if (name === this.pattern) {
			return new Virtual(name);
		}
	}
}

function anyvirt(pat) {
	return new AnyVirtual(pat);
}

exports.Virtual = Virtual;
exports.virt = virt;
exports.AnyVirtual = AnyVirtual;
exports.anyvirt = anyvirt;
