import classNames from 'classnames';
import {Link} from 'react-router';
import React from 'react';

import CheckboxTable from './CheckboxTable';
import MarathonStore from '../stores/MarathonStore';
import ResourceTableUtil from '../utils/ResourceTableUtil';
import TaskStates from '../constants/TaskStates';
import TaskEndpointsList from './TaskEndpointsList';
import TaskTableHeaderLabels from '../constants/TaskTableHeaderLabels';
import TaskUtil from '../utils/TaskUtil';
import Units from '../utils/Units';

const METHODS_TO_BIND = [
  'renderHeadline',
  'renderState',
  'renderStats'
];

class TaskTable extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(function (method) {
      this[method] = this[method].bind(this);
    }, this);
  }

  getStatValue(task, prop) {
    return task.resources[prop];
  }

  getStateValue(task, prop) {
    return TaskStates[task[prop]].displayName;
  }

  getColumns() {
    var className = ResourceTableUtil.getClassName;
    var heading = ResourceTableUtil.renderHeading(TaskTableHeaderLabels);
    let sortFunction = ResourceTableUtil.getSortFunction('id');

    return [
      {
        className,
        headerClassName: className,
        heading,
        prop: 'name',
        render: this.renderHeadline,
        sortable: true,
        sortFunction
      },
      {
        className: this.getHostColumnClassname,
        headerClassName: this.getHostColumnClassname,
        heading,
        prop: 'host',
        render: this.renderHost,
        sortable: true,
        sortFunction
      },
      {
        cacheCell: true,
        className,
        getValue: this.getStateValue,
        headerClassName: className,
        heading,
        prop: 'state',
        render: this.renderState,
        sortable: true,
        sortFunction
      },
      {
        cacheCell: true,
        className,
        getValue: this.getStatValue,
        headerClassName: className,
        heading,
        prop: 'cpus',
        render: this.renderStats,
        sortable: true,
        sortFunction
      },
      {
        cacheCell: true,
        className,
        getValue: this.getStatValue,
        headerClassName: className,
        heading,
        prop: 'mem',
        render: this.renderStats,
        sortable: true,
        sortFunction
      },
      {
        className,
        headerClassName: className,
        heading,
        prop: 'updated',
        render: ResourceTableUtil.renderUpdated,
        sortable: true,
        sortFunction
      }
    ];
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{width: '40px'}} />
        <col />
        <col style={{width: '20%'}} className="hidden-mini" />
        <col style={{width: '120px'}} />
        <col style={{width: '85px'}} className="hidden-mini" />
        <col style={{width: '100px'}} className="hidden-mini" />
        <col style={{width: '120px'}} />
      </colgroup>
    );
  }

  getHostColumnClassname(prop, sortBy, row) {
    return classNames('hidden-mini', {
      'highlight': prop === sortBy.prop,
      'clickable': row == null // this is a header
    });
  }

  renderHeadline(prop, task) {
    let dangerState = TaskStates[task.state].stateTypes.includes('failure');

    let successState = TaskStates[task.state].stateTypes.includes('success');

    let statusClass = classNames({
      'dot': true,
      success: successState,
      danger: dangerState
    });

    let title = task.name || task.id;
    let params = this.props.parentRouter.getCurrentParams();
    let routeParams = Object.assign({taskID: task.id}, params);

    let linkTo = 'services-task-details';
    if (params.nodeID != null) {
      linkTo = 'nodes-task-details';
    }

    return (
      <div className="flex-box flex-box-align-vertical-center
        table-cell-flex-box">
        <div className="table-cell-icon table-cell-task-dot
          task-status-indicator">
          <span className={statusClass}></span>
        </div>
        <div className="table-cell-value flex-box flex-box-col">
          <Link
            className="emphasize clickable text-overflow"
            to={linkTo}
            params={routeParams}
            title={title}>
            {title}
          </Link>
        </div>
      </div>
    );
  }

  renderHost(prop, task) {
    let marathonTask = MarathonStore.getTaskFromTaskID(task.id);

    return <TaskEndpointsList portLimit={3} task={marathonTask} />;
  }

  renderStats(prop, task) {
    return (
      <span>
        {Units.formatResource(prop, this.getStatValue(task, prop))}
      </span>
    );
  }

  renderState(prop, task) {
    let statusClassName = TaskUtil.getTaskStatusClassName(task);
    let statusLabelClasses = `${statusClassName} table-cell-value`;

    return (
      <div className="flex-box flex-box-align-vertical-center
        table-cell-flex-box">
        <span className={statusLabelClasses}>
          {this.getStateValue(task, prop)}
        </span>
      </div>
    );
  }

  render() {
    let {checkedItemsMap, className, onCheckboxChange, tasks} = this.props;

    return (
      <CheckboxTable
        checkedItemsMap={checkedItemsMap}
        className={className}
        columns={this.getColumns()}
        data={tasks.slice()}
        getColGroup={this.getColGroup}
        onCheckboxChange={onCheckboxChange}
        sortBy={{prop: 'updated', order: 'desc'}}
        sortOrder="desc"
        sortProp="updated"
        uniqueProperty="id" />
    );
  }
}

TaskTable.propTypes = {
  checkedItemsMap: React.PropTypes.object,
  className: React.PropTypes.string,
  onCheckboxChange: React.PropTypes.func,
  parentRouter: React.PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.object
  ]).isRequired,
  tasks: React.PropTypes.array.isRequired
};

TaskTable.defaultProps = {
  className: 'table table-borderless-outer table-borderless-inner-columns flush-bottom',
  tasks: []
};

module.exports = TaskTable;
