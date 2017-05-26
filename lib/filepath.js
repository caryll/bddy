const path = require('path')

class FilePath {
	constructor(str) {
		const p = path.parse(str);
		this.dir = p.dir;
		this.name = p.name;
		this.ext = p.ext;
	}
	toString() {
		return path.join(this.dir, this.name + this.ext);
	}
}
FilePath.file = function (f) {
	return new FilePath(f)
}

module.exports = FilePath