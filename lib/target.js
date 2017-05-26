class Target {
	constructor(name) {
		this.name = name;
	}
	toString() {
		return this.name;
	}
	async needUpdate(that) {
		return true;
	}
	async getUpdateTime() {
		return new Date;
	}
}

module.exports = Target;