const messages = require('./messages');
const errors = require('./errors');
const fs = require('fs-extra');

const STARTED = Symbol('pending');
const COMPLETE = Symbol('complete');

const ExistsFile = require('./cotargets/existsfile');

class Recipe {
	constructor(cotarget, howtodo, ignoreError) {
		this.cotarget = cotarget;
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
	new ExistsFile,
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
	for(cotarget, f) {
		this.recipies.push(new Recipe(cotarget, f))
		return this;
	}
	async run(target, ctx) {
		for (let j = this.recipies.length - 1; j >= 0; j--) {
			if (await this.recipies[j].cotarget.match(target)) {
				const ctx1 = ctx.for(target)
				return ctx1.start(target, () => this.recipies[j].run(ctx1, target));
			}
		}
		throw new errors.CannotFindRecipe(target);
	}
}

class Context {
	constructor() {
		this.definitions = new Definitions();
		this.chain = new Set();
		this.tasks = new Map();
		this.resources = {};
		this.plugins = [];
	}
	define(F) {
		F.call(this.definitions, this.definitions);
		return this;
	}
	start(target, prom) {
		const ctx = this;
		const targetid = target + '';
		if (this.tasks.has(targetid)) {
			const status = this.tasks.get(targetid)
			if (status.state === STARTED) {
				return status.promise.then(Promise.resolve(target))
			} else {
				return Promise.resolve(target);
			}
		} else {
			const prom1 = prom().then(function () {
				ctx.fulfill(target);
				return Promise.resolve(target)
			});
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
	for(target) { return new TargetContext(this, target); }
	loadPlugin(pluginInstance) {
		pluginInstance.addResources(this);
		pluginInstance.addMethods(this);
		this.plugins.push(pluginInstance);
		return this;
	}
	async wish(target) { await this.definitions.run(target, this).catch(function (e) { console.log(e) }); }
}

class TargetContext extends Context {
	constructor(parent, target) {
		super();
		this.definitions = parent.definitions;
		this.target = target;
		this.tasks = parent.tasks;
		this.chain = new Set(parent.chain);
		this.chain.add(target + '');
		this.resources = parent.resources;
		// inherit plugins
		for (let plugin of parent.plugins) {
			this.loadPlugin(plugin);
		}
	}
	async _check(..._prerequisites) {
		let tasks = [];
		let prerequisites = _prerequisites.map(p => p.asPrerequisite(this.target));
		for (let p of prerequisites) {
			if (this.chain.has(p + '')) throw new errors.Circular(p);
			tasks.push(this.definitions.run(p, this));
		}
		await Promise.all(tasks);
		let needUpdate = false;
		let latest = null;
		for (let p of prerequisites) {
			let status = this.tasks.get(p + '');
			if (!status || status.state !== COMPLETE) throw new errors.Incomplete(p);
			needUpdate = needUpdate || await this.target.needUpdate(status.time);
			latest = (!latest || status.time > latest) ? status.time : latest;
		}
		return { needUpdate, latest };
	}
	async check(...prerequisites) {
		let { needUpdate } = await this._check(...prerequisites);
		return needUpdate
	}
	async need(...prerequisites) {
		let { needUpdate, latest } = await this._check(...prerequisites);
		if (!needUpdate) {
			this.fulfill(this.target, await this.target.getUpdateTime(latest));
			throw new errors.NothingToDo;
		}
		return prerequisites;
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
	message(...text) {
		console.log(messages.DIAMOND, ...text)
	}
}

exports.Context = Context;