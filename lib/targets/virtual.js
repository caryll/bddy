"use strict"

const path = require('path');
const Target = require('../target');
const fs = require('fs-extra');

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
Virtual.virt = function (f) {
	return new Virtual(f)
}

module.exports = Virtual