let utils = require('../utils.js')
let Task = require('./Task.js')

class Framework {
	constructor(tag, number, name, options = {cpus: 4, gpus: 0, mem: 4000, disk: 32000, tasks: 50}) {
		this.id = tag + '0000'.substring((number + '').length) + number
		this.name = name
		this.hostname = utils.getIp4Address()
		this.pid =  'scheduler-' + 
					new Array(8).fill('').map(() => utils.getChar()).join('') + '-' +
					new Array(4).fill('').map(() => utils.getChar()).join('') + '-' +
					new Array(4).fill('').map(() => utils.getChar()).join('') + '-' +
					new Array(4).fill('').map(() => utils.getChar()).join('') + '-' +
					new Array(12).fill('').map(() => utils.getChar()).join('') + '@' +
					this.hostname + ':' + utils.getRandomInteger(100, 90000)
		this.used_resources = {
			cpus: options.cpus,
			gpus: options.gpus,
			mem: options.mem,
			disk: options.disk
		}
		this.offered_resources = {
			cpus: 0,
			gpus: 0,
			mem: 0,
			disk: 0
		}
		this.webui_url = 'http://' + this.hostname + ':8080'
		this.capabilities = []
		this.active = true,
		this.TASK_STAGING = 0,
		this.TASK_STARTING = 0,
	  	this.TASK_RUNNING = options.tasks,
		this.TASK_FINISHED = 0,
		this.TASK_KILLED = 0,
		this.TASK_FAILED = 0,
		this.TASK_LOST = 0,
		this.TASK_ERROR = 0,
		this.slave_ids = []
	}

	getNumberTasks() {
		return this.TASK_STAGING + this.TASK_STARTING + this.TASK_RUNNING + this.TASK_FINISHED
	}

	getTasks() {
		let tasks = []
		for (let i = 0; i < this.getNumberTasks(); i++) {
			tasks.push(new Task(
				this.used_resources.cpus / this.getNumberTasks(),
				this.used_resources.gpus / this.getNumberTasks(),
				this.used_resources.mem / this.getNumberTasks(),
				this.used_resources.disk / this.getNumberTasks(),
				this.id
			))
		}
		console.log(tasks.length)
		return tasks
	}

	addSlaveId(id) {
		if (!this.slave_ids.includes(id)) {
			this.slave_ids.push(id)
		}
	}
}

module.exports = Framework
