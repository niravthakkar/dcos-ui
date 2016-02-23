import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import ACLGroupStore from '../stores/ACLGroupStore';
import FormModal from '../../../src/js/components/FormModal';

const METHODS_TO_BIND = [
  'handleNewGroupSubmit',
  'onGroupStoreCreateSuccess',
  'onGroupStoreCreateError'
];

module.exports = class GroupFormModal extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {
      disableNewGroup: false,
      errorMsg: false
    };

    this.store_listeners = [
      {
        name: 'group',
        events: ['createSuccess', 'createError']
      }
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  onGroupStoreCreateSuccess() {
    this.setState({
      disableNewGroup: false,
      errorMsg: false
    });
    this.props.onClose();
  }

  onGroupStoreCreateError(errorMsg) {
    this.setState({
      disableNewGroup: false,
      errorMsg
    });
  }

  handleNewGroupSubmit(model) {
    this.setState({disableNewGroup: true});
    ACLGroupStore.addGroup(model);
  }

  getNewGroupFormDefinition() {
    return [
      {
        fieldType: 'text',
        name: 'description',
        placeholder: 'Group name',
        required: true,
        showError: this.state.errorMsg,
        showLabel: false,
        writeType: 'input',
        validation: function () { return true; },
        value: ''
      }
    ];
  }

  render() {
    return (
      <FormModal
        disabled={this.state.disableNewGroup}
        onClose={this.props.onClose}
        onSubmit={this.handleNewGroupSubmit}
        open={this.props.open}
        definition={this.getNewGroupFormDefinition()}>
        <h2 className="modal-header-title text-align-center flush-top">
          Create New Group
        </h2>
      </FormModal>
    );
  }
};