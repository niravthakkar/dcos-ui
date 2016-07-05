/*
 * Generate fixture data.
 *
 * Make random number of frameworks, with varying number of tasks each.
 * A random number of slaves will be created.
 * The tasks are guaranteed to fit on the slaves because more are created
 * if there's not enough space.
 *
 * User input:
 * - # frameworks
 * - degree of varience of framework size
 * - variance of task size
*/

import Framework from './classes/Framework.js';
import MarathonTask from './classes/MarathonTask.js';
import MarathonGroups from './classes/MarathonGroups.js';
import Nodes from './classes/Nodes.js';
import Node from './classes/Node.js';
import MesosState from './classes/MesosState.js';
import Slave from './classes/Slave.js';
import Summary from './classes/Summary.js';
import Task from './classes/Task.js';
import Units from './classes/Units.js';
import Unit from './classes/Unit.js';
import Util from './Util.js';
import yargs from 'yargs';

let argv = yargs
  .usage('Usage: $0 [options]')
  .example('$0 -s 2 -a 5000 -f 8', '20 Slaves, 8 Frameworks, 5000 Apps')
  .option('s', {
    alias: 'slaves',
    demand: true,
    describe: 'Number of Slaves',
    type: 'number'
  })
  .option('a', {
    alias: 'apps',
    default: 0,
    describe: 'Number of Apps',
    type: 'number'
  })
  .option('f', {
    alias: 'frameworks',
    default: 0,
    describe: 'Number of Frameworks',
    type: 'number'
  })
  .help('h')
  .alias('h', 'help')
  .demand(['s', 'a', 'f'])
  .argv;

/*********** MAKE FRAMEWORKS **************/
const tag = Util.getTag();
let frameworks = [];

frameworks.push(new Framework(tag, 0, 'marathon', {
	cpus: 4,
	gpus: 0,
	mem: 4000,
	disk: 32000,
	tasks: argv.apps
}));

const names = ['arangodb', 'cassandra', 'chronos', 'jenkins', 'kafka', 'spark', 'elasticsearch', 'calico', 'hdfs', 'mysql'];
for (let i = 0; i < argv.frameworks; i++) {
	let index = Util.getRandomInteger(0, names.length - 1);
	frameworks.push(new Framework(tag, frameworks.length, names[index]));
	names.splice(index, 1);
}

/************** MAKE SLAVES **************/
let slaves = [];
for (let i = 0; i < argv.slaves; i++) {
	slaves.push(new Slave(tag, slaves.length));
}

/************* SCHEDULE ALL *************/
let tasks = [];

for (let f of frameworks) {
	tasks = tasks.concat(f.tasks);
}

let slaveIndex = 0;
while (tasks.length > 0) {
	let task = tasks.pop();

	// find slave with enough space
	let slave = slaves[slaveIndex];
	let start = slaveIndex;
	while (!slave.hasSpaceForTask(task)) {
		// circular iteration
		slaveIndex += 1;
		if (slaveIndex >= slaves.length) {
			slaveIndex = 0;
		}
		slave = slaves[slaveIndex];

		// no slaves have space for task, make a new slave and schedule task on it
		if (slaveIndex === start) {
			let emptySlave = new Slave(tag, slaves.length);
			slaves.push(emptySlave);
			slave = emptySlave;
			break;
		}
	}

	slave.scheduleTask(task);

	for (let f of frameworks) {
		if (f.id === task.framework_id && !f.slave_ids.includes(slave.id)) {
			f.slave_ids.push(slave.id);
		}
	}

	slaveIndex += 1;
	if (slaveIndex >= slaves.length) {
		slaveIndex = 0;
	}
}

/*************** SUMMARY JSON *******************/
let summary = new Summary(slaves, frameworks);
summary.write();

/*************** MARATHON GROUPS JSON *************/
let marathonTasks = [];

// one scheduler for each framework (except marathon)
for (let f of frameworks) {
	if (f.name === 'marathon') continue;
	marathonTasks.push(f.getMarathonTask());
}

let marathonGroups = new MarathonGroups(marathonTasks);
marathonGroups.write();

/**************** MESOS STATE JSON ****************/
let mesosState = new MesosState(tag, slaves, frameworks);
mesosState.write();

/**************** NODE HEALTH ****************/
// /nodes (master and all slaves)
let n = [];
let master = {
	host_ip: mesosState.hostname,
	health: 0,
	role: 'master'
};
n.push(master);
for (let ip of slaves.map((s) => s.hostname)) { // slaves
	n.push({
		host_ip: ip,
		health: 0,
		role: 'agent'
	});
}

let nodes = new Nodes(n);
nodes.write();

// nodes/<ip-of-node> (for now pick master)
let node = new Node(master);
node.write();

// nodes/<ip-of-node>/units (also pick master)
let units = new Units(mesosState.hostname);
units.write();

// node/<ip-of-node>/units/<unit-id> (also pick master first unit)
let unit = new Unit(mesosState.hostname);
unit.write();
