const minimatch = require('minimatch');
const cpp = require('child-process-promise');
const messages = require('./messages');
const Throat = require('throat');
const os = require('os');
const errors = require('./errors');
const fs = require('fs-extra');

const PENDING = Symbol('pending')
const COMPLETE = Symbol('complete')

class Recipe {
	constructor(whether, howtodo, ignoreError) {
		this.whether = whether;
		this.howtodo = howtodo;
	}
	async run(ctx, item) {
		try {
			await this.howtodo.call(ctx, item);
		} catch (e) {
			if (!e.bddyIgnorable) { throw e; }
		}
	}
}

const fileRecipe = new Recipe(
	async function (target) {
		return await fs.exists('' + target)
	},
	async function (target) {
		this.fulfill(target, await this.target.getUpdateTime());
	}
)

class Definitions {
	constructor() {
		this.recipies = [
			fileRecipe
		];
	}
	forall(pattern, f) {
		this.recipies.push(new Recipe(async target => minimatch(target + '', pattern), f))
		return this;
	}
	async run(target, ctx) {
		ctx.pending(target);
		for (let j = this.recipies.length - 1; j >= 0; j--) {
			if (await this.recipies[j].whether(target)) {
				await this.recipies[j].run(ctx.for(target), target);
				ctx.fulfill(target);
				return target;
			}
		}
		throw new errors.CannotFindRecipe(target);
	}
	createContext() {
		return new Context(this);
	}
}

class Context {
	constructor(defs) {
		this.definitions = defs;
		this.fulfilledTimes = new Map();
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
	pending(target) {
		const targetid = target + '';
		if (this.fulfilledTimes.has(targetid)) return;
		this.fulfilledTimes.set(targetid, { state: PENDING, time: new Date })
	}
	fulfill(target, time) {
		const targetid = target + '';
		if (this.fulfilledTimes.has(targetid)
			&& this.fulfilledTimes.get(targetid).state === COMPLETE) return;
		this.fulfilledTimes.set(targetid, { state: COMPLETE, time: time || new Date() });
	}
	for(target) {
		let that = new TargetContext(this.definitions, target);
		that.fulfilledTimes = this.fulfilledTimes;
		return that;
	}
}

class TargetContext extends Context {
	constructor(defs, target) {
		super(defs);
		this.target = target;
	}
	async check(...prerequisites) {
		let tasks = [];
		for (let prerequisite of prerequisites) {
			if (this.fulfilledTimes.has(prerequisite + '')) {
				let status = this.fulfilledTimes.get(prerequisite + '');
				if (status && status.state === PENDING) {
					throw new errors.Circular(prerequisite);
				}
			}
			tasks.push(this.definitions.run(prerequisite, this));
		}
		return tasks;
	}
	async need(...prerequisites) {
		let tasks = await this.check(...prerequisites);
		await Promise.all(tasks);
		let needUpdate = false;
		for (let p of prerequisites) {
			let status = this.fulfilledTimes.get(p + '');
			if (!status || status.state !== COMPLETE) {
				throw new errors.Incomplete(p);
			}
			needUpdate = needUpdate || await this.target.needUpdate(status.time);
		}
		if (!needUpdate) {
			this.fulfill(this.target, await this.target.getUpdateTime());
			throw new errors.NothingToDo;
		}
		return prerequisites;
	}
}

exports.Definitions = Definitions;
exports.Context = Context;