"use strict";

class Target {
	constructor(name) {
		this.name = name;
	}
	toString() {
		return this.name;
	}
	toIdentifier() {
		return this.toString();
	}
	async needUpdate(that) {
		return true;
	}
	async getUpdateTime() {
		return new Date();
	}
	asPrerequisite(that) {
		return this;
	}
}

class CoTarget {
	constructor() {}
	async match(target) {
		return false;
	}
	async createTargetFromString(name) {
		return null;
	}
}

exports.Target = Target;
exports.CoTarget = CoTarget;
