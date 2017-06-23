"use strict";

const messages = require("./messages");
const errors = require("./errors");
const fs = require("fs-extra");
const { Target } = require("./target");
const { ExistsFile } = require("./targets/file");

const STARTED = Symbol("pending");
const COMPLETE = Symbol("complete");

class Recipe {
	constructor(cotarget, howtodo, ignoreError) {
		this.cotarget = cotarget;
		this.howtodo = howtodo;
	}
	async run(ctx, item) {
		try {
			await this.howtodo.call(ctx, item);
		} catch (e) {
			if (!e.bddyIgnorable) {
				throw e;
			}
		}
	}
}

class Definitions {
	constructor() {
		this.recipies = [];
	}
	def(cotarget, f) {
		this.recipies.push(new Recipe(cotarget, f));
		return this;
	}
	async run(target, ctx) {
		for (let j = this.recipies.length - 1; j >= 0; j--) {
			if (await this.recipies[j].cotarget.match(target)) {
				const ctx1 = ctx.ctxTargeting(target);
				return startTask(ctx1, target, () => this.recipies[j].run(ctx1, target));
			}
		}
		throw new errors.CannotFindRecipe(target);
	}
}

function startTask(ctx, target, prom) {
	const targetid = target.toIdentifier();
	if (ctx.tasks.has(targetid)) {
		const status = ctx.tasks.get(targetid);
		if (status.state === STARTED) {
			return status.promise.then(Promise.resolve(target));
		} else {
			return Promise.resolve(target);
		}
	} else {
		const prom1 = prom().then(target.getUpdateTime.bind(target)).then(function(t) {
			ctx.fulfill(target, t || new Date());
			return Promise.resolve(target);
		});
		ctx.tasks.set(targetid, {
			state: STARTED,
			time: new Date(),
			promise: prom1
		});
		return prom1;
	}
}

class Context {
	constructor() {
		this.definitions = new Definitions();
		this.chain = new Set();
		this.tasks = new Map();
		this.resources = {};
		this.plugins = {};
	}
	loadDefinitions(F) {
		F.call(this.definitions, this.definitions);
		return this;
	}
	def(cotarget, f) {
		this.definitions.def(cotarget, f);
		return this;
	}
	fulfill(target, time) {
		const targetid = target.toIdentifier();
		if (this.tasks.has(targetid) && this.tasks.get(targetid).state === COMPLETE) return;
		this.tasks.set(targetid, { state: COMPLETE, time: time || new Date() });
	}
	ctxTargeting(target) {
		return new TargetContext(this, target);
	}
	async toTarget(t) {
		if (t instanceof Target) return t;
		const defs = this.definitions;
		for (let j = defs.recipies.length - 1; j >= 0; j--) {
			let t1 = await defs.recipies[j].cotarget.createTargetFromString("" + t);
			if (t1 instanceof Target) return t1;
		}
		throw new errors.CannotFindRecipe(t);
	}
	async wish(t) {
		let target = await this.toTarget(t);
		await this.definitions.run(target, this);
		return this;
	}
	loadPlugin(ps) {
		for (let pid in ps) {
			this.plugins[pid] = ps[pid];
			ps[pid].load(this, false);
		}
		return this;
	}
	message(...text) {
		console.log(messages.DIAMOND, ...text);
	}
}

class TargetContext extends Context {
	constructor(parent, target) {
		super();
		this.definitions = parent.definitions;
		this.target = target;
		this.tasks = parent.tasks;
		this.chain = new Set(parent.chain);
		this.chain.add(target.toIdentifier());
		this.resources = Object.create(parent.resources);
		this.plugins = Object.create(parent.plugins);
		// inherit plugins
		for (let pid in this.plugins) {
			const plugin = this.plugins[pid];
			plugin.load(this, true);
		}
	}
	async _check(..._prerequisites) {
		let tasks = [];
		let prerequisites = _prerequisites.map(p => p.asPrerequisite(this.target));
		for (let p of prerequisites) {
			if (this.chain.has(p.toIdentifier())) throw new errors.Circular(p);
			tasks.push(this.definitions.run(p, this));
		}
		await Promise.all(tasks);
		let needUpdate = false;
		let latest = null;
		for (let p of prerequisites) {
			let status = this.tasks.get(p.toIdentifier());
			if (!status || status.state !== COMPLETE) throw new errors.Incomplete(p);
			needUpdate = needUpdate || (await this.target.needUpdate(status.time));
			latest = !latest || status.time > latest ? status.time : latest;
		}
		return { needUpdate, latest };
	}
	async check(...p) {
		let prerequisites = await Promise.all(p.map(this.toTarget.bind(this)));
		let { needUpdate } = await this._check(...prerequisites);
		prerequisites.needUpdate = needUpdate;
		return prerequisites;
	}
	async need(...p) {
		let prerequisites = await Promise.all(p.map(this.toTarget.bind(this)));
		let { needUpdate, latest } = await this._check(...prerequisites);
		if (!needUpdate) {
			this.fulfill(this.target, await this.target.getUpdateTime(latest));
			throw new errors.NothingToDo();
		}
		return prerequisites;
	}
}

exports.Context = Context;
