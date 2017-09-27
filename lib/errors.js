"use strict";

class CannotFindRecipe extends Error {
	constructor(what) {
		super(`Cannot find recipe for "${what}".`);
	}
}

class NothingToDo extends Error {
	constructor() {
		super(`Nothing-to-do exception`);
		this.bddyIgnorable = true;
	}
}

class Incomplete extends Error {
	constructor(target) {
		super(`Task about ${target} is not completed.`);
	}
}

class Circular extends Error {
	constructor(target) {
		super(`Circular dependency of ${target} found.`);
	}
}

class BuildFailure extends Error {
	constructor(target, why) {
		super(`Target "${target}" failed: ${why}`);
	}
}

exports.CannotFindRecipe = CannotFindRecipe;
exports.NothingToDo = NothingToDo;
exports.Incomplete = Incomplete;
exports.Circular = Circular;
exports.BuildFailure = BuildFailure;
