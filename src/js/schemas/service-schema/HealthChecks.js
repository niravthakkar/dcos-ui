import FormUtil from '../../utils/FormUtil';

let HealthChecks = {
  type: 'object',
  title: 'Health Checks',
  description: 'Perform health checks on running tasks to determine if they are operating as expected.',
  properties: {
    healthChecks: {
      type: 'array',
      duplicable: true,
      addLabel: 'Add Another Health Check',
      getter: function (service) {
        let healthChecks = service.getHealthChecks();

        if (healthChecks == null) {
          return [];
        }

        healthChecks = healthChecks.map(function (check) {
          if (check.protocol === 'COMMAND') {
            check.command = check.command.value;
          }
          return check;
        });

        return healthChecks;
      },
      deleteButtonTop: true,
      getTitle: function (index = 1) {
        return `Health check #${index}`;
      },
      filterProperties: function (service = {}, instanceDefinition) {
        let properties = HealthChecks
          .properties
          .healthChecks
          .itemShape
          .properties;

        instanceDefinition.forEach(function (definition) {
          let prop = definition.name;
          if (FormUtil.isFieldInstanceOfProp('healthChecks', definition)) {
            prop = FormUtil.getPropKey(definition.name);
          }
          if (properties[prop].shouldShow) {
            definition.formElementClass = {
              'hidden-form-element': !properties[prop].shouldShow(service)
            };
          }
        });
      },
      itemShape: {
        properties: {
          protocol: {
            title: 'Protocol',
            fieldType: 'select',
            type: 'string',
            options: [
              'HTTP',
              'COMMAND',
              'TCP'
            ]
          },
          command: {
            title: 'Command',
            type: 'string',
            shouldShow: function (service) {
              return service.protocol === 'COMMAND';
            }
          },
          path: {
            title: 'Path',
            type: 'string',
            shouldShow: function (service) {
              return service.protocol == null || service.protocol === 'HTTP';
            }
          },
          gracePeriodSeconds: {
            description: 'Grace period in seconds',
            title: 'Grace Period',
            type: 'number'
          },
          intervalSeconds: {
            description: 'Interval in seconds',
            title: 'Interval',
            type: 'number'
          },
          timeoutSeconds: {
            description: 'Timeout in seconds',
            title: 'Timeout',
            type: 'number'
          },
          maxConsecutiveFailures: {
            title: 'Maximum Consecutive Failures',
            type: 'number'
          },
          port: {
            title: 'Port Number',
            type: 'number',
            shouldShow: function (service) {
              return service.portType === 'PORT_NUMBER';
            }
          },
          portIndex: {
            title: 'Port Index',
            type: 'number',
            shouldShow: function (service) {
              return service.portType == null || service.portType === 'PORT_INDEX';
            }
          },
          portType: {
            title: 'Port Type',
            fieldType: 'select',
            type: 'string',
            options: [
              {
                html: 'Port Index',
                id: 'PORT_INDEX'
              },
              {
                html: 'Port Number',
                id: 'PORT_NUMBER'
              }
            ]
          },
          ignoreHttp1xx: {
            label: 'Ignore HTTP Status Codes 100 to 199',
            showLabel: false,
            type: 'boolean',
            shouldShow: function (service) {
              return service.protocol == null || service.protocol === 'HTTP';
            }
          }
        }
      }
    }
  }
};

module.exports = HealthChecks;
