"use strict"

class CannotFindRecipe extends Error {
	constructor(what) {
		super();
		this.message = `Cannot find recipe for "${what}".`
	}
}

class NothingToDo extends Error {
	constructor() {
		super();
		this.bddyIgnorable = true;
	}
}

class Incomplete extends Error {
	constructor(target) {
		super(`Task about ${target} is not completed.`)
	}
}

class Circular extends Error {
	constructor(target) {
		super(`Circular dependency of ${target} found.`)
	}
}

exports.CannotFindRecipe = CannotFindRecipe;
exports.NothingToDo = NothingToDo;
exports.Incomplete = Incomplete;
exports.Circular = Circular;