"use strict";

const path = require("path");
const { Target, CoTarget } = require("../target");
const fs = require("fs-extra");
const mm = require("micromatch");

class Virtual extends Target {
	constructor(str, captures) {
		super(str);
		this.__upstream = null;
		if (captures) {
			for (let j = 0; j < captures.length; j++) {
				this["$" + (j + 1)] = captures[j];
			}
		}
	}
	toIdentifier() {
		return "<#VIRT>" + this.toString();
	}
	asPrerequisite(that) {
		let v = new Virtual(this.name);
		if (that.__upstream) {
			v.__upstream = that.__upstream;
		} else {
			v.__upstream = that;
		}
		return v;
	}
	async needUpdate(that) {
		if (this.__upstream) {
			return await this.__upstream.needUpdate(that);
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
		return target instanceof Virtual && mm.isMatch(target + "", this.pattern);
	}
	async createTargetFromString(demand) {
		const match = mm.capture(this.pattern, demand + "");
		if (match) {
			return new Virtual(demand, match);
		} else {
			return super.createTargetFromString();
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
