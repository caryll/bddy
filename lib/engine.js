const minimatch = require('minimatch');
const cpp = require('child-process-promise');
const messages = require('./messages');
const Throat = require('throat');
const os = require('os');
const errors = require('./errors');
const fs = require('fs-extra');

const STARTED = Symbol('pending');
const COMPLETE = Symbol('complete');

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
		for (let j = this.recipies.length - 1; j >= 0; j--) {
			if (await this.recipies[j].whether(target)) {
				const ctx1 = ctx.for(target)
				return ctx1.start(target, () => this.recipies[j].run(ctx1, target));
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
		this.chain = new Set();
		this.tasks = new Map();
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
	start(target, prom) {
		const ctx = this;
		const targetid = target + '';
		if (this.tasks.has(targetid)) {
			const status = this.tasks.get(targetid)
			if (status.state === STARTED) {
				return status.promise.then(function () { })
			} else {
				return Promise.resolve(null);
			}
		} else {
			const prom1 = prom().then(function () { ctx.fulfill(target); })
			this.tasks.set(targetid, {
				state: STARTED,
				time: new Date,
				promise: prom1
			});
			return prom1;
		}
	}
	fulfill(target, time) {
		const targetid = target + '';
		if (this.tasks.has(targetid)
			&& this.tasks.get(targetid).state === COMPLETE) return;
		this.tasks.set(targetid, { state: COMPLETE, time: time || new Date() });
	}
	for(target) {
		let that = new TargetContext(this.definitions, target);
		that.tasks = this.tasks;
		that.chain = new Set(this.chain);
		that.chain.add(target + '');
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
			if (this.chain.has(prerequisite + '')) {
				throw new errors.Circular(prerequisite);
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
			let status = this.tasks.get(p + '');
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