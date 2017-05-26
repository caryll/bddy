const mimimatch = require('minimatch');

class Recipe {
	constructor(whether, howtodo, ignoreError) {
		this.whether = whether;
		this.howtodo = howtodo;
	}
	async run(item) {
		try {
			await this.howtodo(item);
		} catch (e) {
			if (!e.bddyIgnorable) { throw e; }
		}
	}
}

class Definitions {
	constructor() {
		this.recipies = [];
	}
	forall(pattern, f) {
		this.recipies.push(new Recipe(file => minimatch(file, pattern), f))
	}
}

class Context {
	constructor(defs) {
		this.definitions = defs;
		this.fullfilled = new Map();
	}
}

exports.Definitions = Definitions;
exports.Context = Context;