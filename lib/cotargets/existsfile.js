const CoTarget = require('../cotarget');
const fs = require('fs-extra');
const FilePath = require('../targets/filepath');

class ExistsFile extends CoTarget {
	constructor() { super() }
	async match(target) {
		if (!(target instanceof FilePath)) return false;
		return await fs.exists('' + target);
	}
}

module.exports = ExistsFile;