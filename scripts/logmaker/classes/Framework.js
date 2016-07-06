import MarathonTask from './MarathonTask.js';
import Task from './Task.js';
import Util from '../Util.js';

class Framework {
  constructor(tag, number, name, options = {
    cpus: 6.4, gpus: 0, mem: 4000, disk: 32000, tasks: 10
  }) {
    this.id = tag + '0000'.substring((number + '').length) + number;
    this.name = name;
    this.hostname = Util.generateIPv4Address();
    this.pid =  'scheduler-' +
      new Array(8).fill('').map(() => Util.getChar()).join('') + '-' +
      new Array(4).fill('').map(() => Util.getChar()).join('') + '-' +
      new Array(4).fill('').map(() => Util.getChar()).join('') + '-' +
      new Array(4).fill('').map(() => Util.getChar()).join('') + '-' +
      new Array(12).fill('').map(() => Util.getChar()).join('') + '@' +
      this.hostname + ':' + Util.getRandomInteger(100, 90000);
    this.used_resources = {
      cpus: options.cpus,
      gpus: options.gpus,
      mem: options.mem,
      disk: options.disk
    };
    this.offered_resources = {
      cpus: 0,
      gpus: 0,
      mem: 0,
      disk: 0
    };
    this.webui_url = `http://${this.hostname}:8080`;
    this.capabilities = [];
    this.active = true;
    this.TASK_STAGING = 0;
    this.TASK_STARTING = 0;
    this.TASK_RUNNING = options.tasks;
    this.TASK_FINISHED = 0;
    this.TASK_KILLED = 0;
    this.TASK_FAILED = 0;
    this.TASK_LOST = 0;
    this.TASK_ERROR = 0;
    this.slave_ids = [];

    // make big tasks, medium tasks, and small tasks. 49 tasks total + 1 scheduler
    let tasks = [];

    let cpuEven = options.cpus / this.getNumberTasks();
    let gpuEven = options.gpus / this.getNumberTasks();
    let memEven = options.mem / this.getNumberTasks();
    let diskEven = options.disk / this.getNumberTasks();

    // scheduler task
    // 1 scheduler, using 1 share of resource
    tasks.push(new Task(
      Util.roundTenth(cpuEven),
      Util.roundTenth(gpuEven),
      Util.roundTenth(memEven),
      Util.roundTenth(diskEven),
      this.id, // framework id
      'scheduler-' + this.name // id of task
    ));

    // big tasks, they use double their even share of things
    // 2 are big, using 4 shares of resource
    for (let i = 0; i < 2; i++) {
      tasks.push(new Task(
        Util.roundTenth(cpuEven * 2),
        Util.roundTenth(gpuEven * 2),
        Util.roundTenth(memEven * 2),
        Util.roundTenth(diskEven * 2),
        this.id, // framework id
        this.name + i // id of the task, will be unique
      ));
    }

    // normal tasks
    // 3 are normal, using 3 shares of resource
    for (let i = 2; i < 5; i++) {
      tasks.push(new Task(
        Util.roundTenth(cpuEven),
        Util.roundTenth(gpuEven),
        Util.roundTenth(memEven),
        Util.roundTenth(diskEven),
        this.id, // framework id
        this.name + i // id of the task, will be unique
      ));
    }

    // small tasks
    // 4 are small, using last 2 shares of resource
    for (let i = 6; i < 10; i++) {
      tasks.push(new Task(
        Util.roundTenth(cpuEven / 2),
        Util.roundTenth(gpuEven / 2),
        Util.roundTenth(memEven / 2),
        Util.roundTenth(diskEven / 2),
        this.id, // framework id
        this.name + i // id of the task, will be unique
      ));
    }

    this.tasks = tasks;
  }

  getNumberTasks() {
    return this.TASK_STAGING + this.TASK_STARTING + this.TASK_RUNNING + this.TASK_FINISHED;
  }

  addSlaveId(id) {
    if (!this.slave_ids.includes(id)) {
      this.slave_ids.push(id);
    }
  }

  // for use in marathon/v2/groups endpoint
  getMarathonTask() {
    if (this.name !== 'marathon') {
      return new MarathonTask(this.name, this.used_resources);
    } else {
      return null;
    }
  }
}

module.exports = Framework;
