const CoTarget = require('../cotarget');
const minimatch = require('minimatch');
const FilePath = require('../targets/filepath');

class FilePattern extends CoTarget {
	constructor(pattern) {
		super();
		this.pattern = pattern;
	}
	async match(target) {
		return target instanceof FilePath && minimatch(target + '', this.pattern);
	}
	async createTargetFromString(demand) {
		if (minimatch(demand, this.pattern)) {
			return new FilePath(demand);
		}
	}
}

FilePattern.anyfile = function (pat) { return new FilePattern(pat) }

module.exports = FilePattern;