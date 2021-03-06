import React from 'react';

import DescriptionList from './DescriptionList';
import MarathonStore from '../stores/MarathonStore';

class MarathonTaskDetailsList extends React.Component {
  getTaskEndpoints(task) {
    if ((task.ports == null || task.ports.length === 0) &&
        (task.ipAddresses == null || task.ipAddresses.length === 0)) {
      return 'None';
    }

    let service = MarathonStore.getServiceFromTaskID(task.id);

    if (service != null &&
      service.ipAddress != null &&
      service.ipAddress.discovery != null &&
      service.ipAddress.discovery.ports != null &&
      task.ipAddresses != null &&
      task.ipAddresses.length > 0) {

      let ports = service.ipAddress.discovery.ports;
      let endpoints = task.ipAddresses.reduce(function (memo, address) {
        ports.forEach(function (port) {
          memo.push(`${address.ipAddress}:${port.number}`);
        });

        return memo;
      }, []);

      if (endpoints.length) {
        return endpoints.map(function (endpoint, index) {
          return (
            <a key={index} className="visible-block" href={`//${endpoint}`} target="_blank">
              {endpoint}
            </a>
          );
        });
      }

      return 'n/a';
    }

    return task.ports.map(function (port, index) {
      let endpoint = `${task.host}:${port}`;
      return (
        <a key={index} className="visible-block" href={`//${endpoint}`} target="_blank">
          {endpoint}
        </a>
      );
    });
  }

  getTaskStatus(task) {
    if (task == null || task.status == null) {
      return 'Unknown';
    }
    return task.status;
  }

  getTimeField(time) {
    let timeString = 'Never';

    if (time != null) {
      timeString = new Date(time).toLocaleString();
    }

    return (
      <time dateTime={time} title={time}>
        {timeString}
      </time>
    );
  }

  getMarathonTaskDetailsDescriptionList(task) {
    if (task == null) {
      return null;
    }

    let headerValueMapping = {
      'Host': task.host,
      'Ports': task.ports.join(', '),
      'Endpoints': this.getTaskEndpoints(task),
      'Status': this.getTaskStatus(task),
      'Staged at': this.getTimeField(task.stagedAt),
      'Started at': this.getTimeField(task.startedAt),
      'Version': task.version
    };

    return (
      <DescriptionList
        className="container container-fluid flush container-pod container-pod-super-short flush-top"
        hash={headerValueMapping}
        headline="Marathon Task Configuration" />
    );
  }

  getMarathonTaskHealthCheckResults(task) {
    if (task == null || task.healthCheckResults == null) {

      return null;
    }

    return task.healthCheckResults.map((result, i) =>{
      let consecutiveFailures = result.consecutiveFailures;
      let alive = 'Yes';

      if (consecutiveFailures == null) {
        consecutiveFailures = 'None';
      }

      if (!result.alive) {
        alive = 'No';
      }

      const headerValueMapping = {
        'First success': this.getTimeField(result.firstSuccess),
        'Last success': this.getTimeField(result.lastSuccess),
        'Last failure': this.getTimeField(result.lastFailure),
        'Consecutive failures': consecutiveFailures,
        'Alive': alive
      };

      return (
        <DescriptionList
          key={i}
          className="container container-fluid flush container-pod container-pod-super-short flush-top"
          hash={headerValueMapping}
          headline={`Health Check Result ${i+1}`} />
      );
    });
  }

  render() {
    const marathonTask = MarathonStore.getTaskFromTaskID(this.props.taskID);
    const taskConfiguration =
      this.getMarathonTaskDetailsDescriptionList(marathonTask);
    const healthCheckResults =
      this.getMarathonTaskHealthCheckResults(marathonTask);
    return (
      <div>
        {taskConfiguration}
        {healthCheckResults}
      </div>
    );
  }
};

MarathonTaskDetailsList.propTypes = {
  taskID: React.PropTypes.string.isRequired
};

module.exports = MarathonTaskDetailsList;
