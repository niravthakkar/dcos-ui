import Util from '../Util.js';

class Summary {
	constructor(slaves, frameworks) {
		this.hostname = Util.getIp4Address()
		this.cluser = 'andrew-viz'
		this.slaves = slaves
		this.frameworks = frameworks
	}

	write() {
		Util.write('summary.json', this)
	}
}

module.exports = Summary
