const minimatch = require('minimatch');
const cpp = require('child-process-promise');
const messages = require('./messages');
const Throat = require('throat');
const os = require('os');

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
		this.recipies.push(new Recipe(target => minimatch(target + '', pattern), f))
		return this;
	}
	async run(target, ctx) {
		for (let j = this.recipies.length - 1; j >= 0; j--) {
			if (this.recipies[j].whether(target)) {
				await this.recipies[j].howtodo.call(ctx, target);
				ctx.fullfilled.add(target + '');
				return target;
			}
		}
	}
	createContext() {
		return new Context(this);
	}
}

class Context {
	constructor(defs) {
		this.definitions = defs;
		this.fullfilled = new Set();
		this.throat = Throat(os.cpus().length);
	}
	async command(cmd, ...args) {
		return await this.throat(function () {
			console.log(messages.DIAMOND, [cmd, ...args].join(' '));
			let prom = cpp.spawn(cmd, args);
			let proc = prom.childProcess;
			proc.stdout.on('data', function (data) { process.stdout.write(data) });
			proc.stderr.on('data', function (data) { process.stderr.write(data) });
			return prom;
		})
	}
	async need(...prerequisites) {
		let tasks = [];
		for (let prerequisite of prerequisites) {
			if (!this.fullfilled.has(prerequisite + '')) {
				tasks.push(this.definitions.run(prerequisite, this))
			}
		}
		await Promise.all(tasks);
	}
}

exports.Definitions = Definitions;
exports.Context = Context;