jest.dontMock('../UserGroupTable');
jest.dontMock('../../stores/ACLGroupStore');
jest.dontMock('../../stores/ACLGroupsStore');
jest.dontMock('../../../users/stores/ACLUserStore');

var JestUtil = require('../../../../src/js/utils/JestUtil');

JestUtil.unMockStores(['ACLGroupStore', 'ACLGroupsStore', 'ACLUserStore']);
require('../../../../src/js/utils/StoreMixinConfig');

var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');

var ActionTypes = require('../../constants/ActionTypes');
var ACLGroupStore = require('../../stores/ACLGroupStore');
var ACLUserStore = require('../../../users/stores/ACLUserStore');
var AppDispatcher = require('../../../../src/js/events/AppDispatcher');
var UserGroupTable = require('../UserGroupTable');
var User = require('../../../../src/js/structs/User');

let userDetailsFixture =
  require('../../../../tests/_fixtures/acl/user-with-details.json');
userDetailsFixture.groups = userDetailsFixture.groups.array;

describe('UserGroupTable', function () {

  beforeEach(function () {
    this.userStoreGetUser = ACLUserStore.getUser;

    ACLUserStore.getUser = function (userID) {
      if (userID === 'unicode') {
        return new User(userDetailsFixture);
      }
    };
    this.container = document.createElement('div');

    this.instance = ReactDOM.render(
      <UserGroupTable userID={'unicode'}/>,
      this.container
    );

    this.instance.handleOpenConfirm = jest.genMockFunction();
  });

  afterEach(function () {
    ACLUserStore.removeAllListeners();
    ACLGroupStore.removeAllListeners();
    ACLUserStore.getUser = this.userStoreGetUser;

    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#onGroupStoreDeleteUserError', function () {

    it('updates state when an error event is emitted', function () {
      ACLGroupStore.deleteUser = function () {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_ACL_GROUP_REMOVE_USER_ERROR,
          data: 'foo bar',
          groupID: 'baz',
          userID: 'unicode'
        });
      };

      ACLGroupStore.deleteUser('foo', 'unicode');
      expect(this.instance.state.userUpdateError).toEqual('foo bar');
    });

  });

  describe('#onGroupStoreDeleteUserSuccess', function () {

    it('gets called when a success event is emitted', function () {
      ACLGroupStore.deleteUser = function () {
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_ACL_GROUP_REMOVE_USER_SUCCESS,
          data: 'foo bar',
          groupID: 'baz',
          userID: 'unicode'
        });
      };
      this.instance.onGroupStoreDeleteUserSuccess = jest.genMockFunction();

      ACLGroupStore.deleteUser('foo', 'unicode');
      expect(this.instance.onGroupStoreDeleteUserSuccess.mock.calls.length)
        .toEqual(1);
    });

  });

  describe('#getConfirmModalContent', function () {

    beforeEach(function () {
      this.instance.state.groupID = 'bar';
    });

    it('returns a message containing the user\'s name and group name',
      function () {
      var modalContent = this.instance.getConfirmModalContent({
        description: 'foo', groups: [{group: {gid: 'bar', description: 'qux'}}]
      });

      var component = TestUtils.renderIntoDocument(modalContent);
      var node = ReactDOM.findDOMNode(component);
      var paragraph = node.querySelector('p');

      expect(paragraph.textContent)
        .toEqual('foo will be removed from qux.');
    });

    it('returns a message containing the error that was received',
      function () {
      this.instance.state.userUpdateError = 'quux';
      var modalContent = this.instance.getConfirmModalContent({
        description: 'foo', groups: [{group: {gid: 'bar', description: 'qux'}}]
      });

      var component = TestUtils.renderIntoDocument(modalContent);
      var node = ReactDOM.findDOMNode(component);
      var paragraphs = node.querySelectorAll('p');

      expect(paragraphs[1].textContent)
        .toEqual('quux');
    });

  });

  describe('#renderGroupLabel', function () {

    it('returns the specified property from the object', function () {
      var label = this.instance.renderGroupLabel('foo', {foo: 'bar'});
      expect(label).toEqual('bar');
    });

  });

  describe('#renderButton', function () {

    it('calls handleOpenConfirm with the proper arguments', function () {
      var buttonWrapper = TestUtils.renderIntoDocument(
        this.instance.renderButton('foo', {gid: 'bar'})
      );

      var node = ReactDOM.findDOMNode(buttonWrapper);
      var button = node.querySelector('button');

      TestUtils.Simulate.click(ReactDOM.findDOMNode(button));

      expect(this.instance.handleOpenConfirm.mock.calls[0][0]).toEqual(
        {gid: 'bar'}
      );
    });

  });

});