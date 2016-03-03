import classNames from 'classnames';
import {Confirm, Table} from 'reactjs-components';
import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import CosmosPackagesStore from '../stores/CosmosPackagesStore';
import PackagesTableHeaderLabels from '../constants/PackagesTableHeaderLabels';
import ResourceTableUtil from '../utils/ResourceTableUtil';
import UniversePackagesList from '../structs/UniversePackagesList';

const METHODS_TO_BIND = [
  'getHeadline',
  'getUninstallButton',
  'handleOpenConfirm',
  'handleUninstallCancel',
  'handleUninstallPackage'
];

class PackagesTable extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {
      packageToUninstall: null,
      packageUninstallError: null,
      pendingRequest: false
    };

    this.store_listeners = [
      {
        name: 'cosmosPackages',
        events: ['uninstallError', 'uninstallSuccess'],
        unmountWhen: function () {
          return true;
        },
        listenAlways: true
      }
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  onCosmosPackagesStoreUninstallError(error) {
    this.setState({packageUninstallError: error, pendingRequest: false});
  }

  onCosmosPackagesStoreUninstallSuccess() {
    this.setState({
      packageToUninstall: null,
      packageUninstallError: null,
      pendingRequest: false
    });
    CosmosPackagesStore.fetchInstalledPackages();
  }

  handleOpenConfirm(packageToUninstall) {
    this.setState({packageToUninstall});
  }

  handleUninstallCancel() {
    this.setState({packageToUninstall: null});
  }

  handleUninstallPackage() {
    let {packageToUninstall} = this.state;
    let {name, version} = packageToUninstall.get('packageDefinition');
    CosmosPackagesStore.uninstallPackage(
      name,
      version,
      packageToUninstall.get('appId')
    );

    this.setState({pendingRequest: true});
  }

  getClassName(prop, sortBy, row) {
    return classNames({
      'highlight': prop === sortBy.prop,
      'clickable': row == null // this is a header
    });
  }

  getColumns() {
    let getClassName = this.getClassName;
    let heading = ResourceTableUtil.renderHeading(PackagesTableHeaderLabels);
    let sortFunction = ResourceTableUtil
      .getStatSortFunction('name', function (cosmosPackage, prop) {
        return cosmosPackage.get('packageDefinition')[prop];
      });

    return [
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: 'name',
        render: this.getHeadline,
        sortable: true,
        sortFunction
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: 'version',
        render: this.getProp,
        sortable: true,
        sortFunction
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading: function () {},
        prop: 'uninstall',
        render: this.getUninstallButton,
        sortable: false
      }
    ];
  }

  getColGroup() {
    return (
      <colgroup>
        <col />
        <col style={{width: '120px'}} />
        <col style={{width: '120px'}} />
      </colgroup>
    );
  }

  getHeadline(prop, cosmosPackage) {
    let packageImages = cosmosPackage.getIcons();
    return (
      <div className="package-table-heading flex-box flex-box-align-vertical-center table-cell-flex-box">
        <span className="icon icon-small icon-image-container icon-app-container">
          <img src={packageImages['icon-small']} />
        </span>
        <span className="text-overflow">
          {this.getProp(prop, cosmosPackage)}
        </span>
      </div>
    );
  }

  getProp(prop, cosmosPackage) {
    return cosmosPackage.get('packageDefinition')[prop];
  }

  getUninstallButton(prop, packageToUninstall) {
    return (
      <div className="flex-align-right">
        <a
          className="button button-link button-danger table-display-on-row-hover"
          onClick={this.handleOpenConfirm.bind(this, packageToUninstall)}>
          Uninstall
        </a>
      </div>
    );
  }

  getUninstallModalContent() {
    let {packageUninstallError, packageToUninstall} = this.state;
    let packageLabel = 'This package';
    if (packageToUninstall) {
      packageLabel = packageToUninstall.get('packageDefinition').name;
    }

    let error = null;

    if (packageUninstallError != null) {
      error = (
        <p className="text-error-state">{packageUninstallError}</p>
      );
    }

    return (
      <div className="container-pod container-pod-short text-align-center">
        <h3 className="flush-top">Are you sure?</h3>
        <p>
          {`${packageLabel} will be uninstalled from DCOS. All tasks belonging to this package will be killed.`}
        </p>
        {error}
      </div>
    );
  }

  render() {
    return (
      <div>
        <Table
          className="table inverse table-borderless-outer table-borderless-inner-columns flush-bottom"
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          data={this.props.packages.getItems().slice()}
          sortBy={{prop: 'name', order: 'desc'}} />
        <Confirm
          closeByBackdropClick={true}
          disabled={this.state.pendingRequest}
          footerContainerClass="container container-pod container-pod-short
            container-pod-fluid flush-top flush-bottom"
          open={!!this.state.packageToUninstall}
          onClose={this.handleUninstallCancel}
          leftButtonCallback={this.handleUninstallCancel}
          rightButtonCallback={this.handleUninstallPackage}
          rightButtonClassName="button button-danger"
          rightButtonText="Uninstall">
          {this.getUninstallModalContent()}
        </Confirm>
      </div>
    );
  }
}

PackagesTable.defaultProps = {
  packages: new UniversePackagesList()
};

PackagesTable.propTypes = {
  packages: React.PropTypes.object.isRequired
};

module.exports = PackagesTable;