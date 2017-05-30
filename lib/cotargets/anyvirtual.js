"use strict"

const CoTarget = require('../cotarget');
const minimatch = require('minimatch');
const Virtual = require('../targets/virtual')

class AnyVirtual extends CoTarget {
	constructor(pattern) {
		super();
		this.pattern = pattern;
	}
	async match(target) {
		return target instanceof Virtual && target + '' === this.pattern;
	}
	async createTargetFromString(name) {
		if (name === this.pattern) {
			return new Virtual(name);
		}
	}
}

AnyVirtual.anyvirtual = function (pat) { return new AnyVirtual(pat) }

module.exports = AnyVirtual;