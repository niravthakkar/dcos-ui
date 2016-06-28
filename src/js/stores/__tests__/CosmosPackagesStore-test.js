jest.dontMock('../CosmosPackagesStore');
jest.dontMock('../../config/Config');
jest.dontMock('../../events/AppDispatcher');
jest.dontMock('../../events/CosmosPackagesActions');
jest.dontMock('../../mixins/GetSetMixin');
jest.dontMock('./fixtures/MockPackageDescribeResponse.json');
jest.dontMock('./fixtures/MockPackagesListResponse.json');
jest.dontMock('./fixtures/MockPackagesSearchResponse.json');

import {RequestUtil} from 'mesosphere-shared-reactjs';

var AppDispatcher = require('../../events/AppDispatcher');
var Config = require('../../config/Config');
import {
  COSMOS_DESCRIBE_CHANGE,
  COSMOS_DESCRIBE_ERROR,
  COSMOS_INSTALL_ERROR,
  COSMOS_INSTALL_SUCCESS,
  COSMOS_LIST_CHANGE,
  COSMOS_LIST_ERROR,
  COSMOS_REPOSITORIES_SUCCESS,
  COSMOS_REPOSITORIES_ERROR,
  COSMOS_REPOSITORY_ADD_SUCCESS,
  COSMOS_REPOSITORY_ADD_ERROR,
  COSMOS_REPOSITORY_DELETE_SUCCESS,
  COSMOS_REPOSITORY_DELETE_ERROR,
  COSMOS_SEARCH_CHANGE,
  COSMOS_SEARCH_ERROR,
  COSMOS_UNINSTALL_ERROR,
  COSMOS_UNINSTALL_SUCCESS
} from '../../constants/EventTypes';
var CosmosPackagesStore = require('../CosmosPackagesStore');
var packageDescribeFixture =
  require('./fixtures/MockPackageDescribeResponse.json');
var packagesListFixture = require('./fixtures/MockPackagesListResponse.json');
var packagesSearchFixture =
  require('./fixtures/MockPackagesSearchResponse.json');
import {
  REQUEST_COSMOS_PACKAGES_LIST_ERROR,
  REQUEST_COSMOS_PACKAGES_LIST_SUCCESS,
  REQUEST_COSMOS_PACKAGES_SEARCH_ERROR,
  REQUEST_COSMOS_PACKAGES_SEARCH_SUCCESS,
  REQUEST_COSMOS_PACKAGE_DESCRIBE_ERROR,
  REQUEST_COSMOS_PACKAGE_DESCRIBE_SUCCESS,
  REQUEST_COSMOS_PACKAGE_INSTALL_ERROR,
  REQUEST_COSMOS_PACKAGE_INSTALL_SUCCESS,
  REQUEST_COSMOS_PACKAGE_UNINSTALL_ERROR,
  REQUEST_COSMOS_PACKAGE_UNINSTALL_SUCCESS,
  REQUEST_COSMOS_REPOSITORIES_LIST_SUCCESS,
  REQUEST_COSMOS_REPOSITORIES_LIST_ERROR,
  REQUEST_COSMOS_REPOSITORY_ADD_SUCCESS,
  REQUEST_COSMOS_REPOSITORY_ADD_ERROR,
  REQUEST_COSMOS_REPOSITORY_DELETE_SUCCESS,
  REQUEST_COSMOS_REPOSITORY_DELETE_ERROR
} from '../../constants/ActionTypes';
var UniversePackage = require('../../structs/UniversePackage');
var UniverseInstalledPackagesList =
  require('../../structs/UniverseInstalledPackagesList');
var UniversePackagesList = require('../../structs/UniversePackagesList');

describe('CosmosPackagesStore', function () {

  beforeEach(function () {
    this.configUseFixture = Config.useFixtures;
    Config.useFixtures = true;
  });

  afterEach(function () {
    Config.useFixtures = this.configUseFixture;
  });

  describe('#fetchAvailablePackages', function () {

    beforeEach(function () {
      this.requestFn = RequestUtil.json;
      RequestUtil.json = function (handlers) {
        handlers.success(Object.assign({}, packagesSearchFixture));
      };
      this.packagesSearchFixture = Object.assign({}, packagesSearchFixture);
    });

    afterEach(function () {
      RequestUtil.json = this.requestFn;
    });

    it('should return an instance of UniversePackagesList', function () {
      CosmosPackagesStore.fetchAvailablePackages('foo');
      var availablePackages = CosmosPackagesStore.getAvailablePackages();
      expect(availablePackages instanceof UniversePackagesList).toBeTruthy();
    });

    it('should return all of the availablePackages it was given', function () {
      CosmosPackagesStore.fetchAvailablePackages('foo');
      var availablePackages =
        CosmosPackagesStore.getAvailablePackages().getItems();
      expect(availablePackages.length)
        .toEqual(this.packagesSearchFixture.packages.length);
    });

    it('should pass though query parameters', function () {
      RequestUtil.json = jasmine.createSpy('RequestUtil#json');
      CosmosPackagesStore.fetchAvailablePackages('foo');
      expect(JSON.parse(RequestUtil.json.calls.mostRecent().args[0].data))
        .toEqual({query: 'foo'});
    });

    describe('dispatcher', function () {

      it('stores availablePackages when event is dispatched', function () {
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_PACKAGES_SEARCH_SUCCESS,
          data: [{gid: 'foo', bar: 'baz'}],
          query: 'foo'
        });

        var availablePackages =
          CosmosPackagesStore.getAvailablePackages().getItems();
        expect(availablePackages[0].get('gid')).toEqual('foo');
        expect(availablePackages[0].get('bar')).toEqual('baz');
      });

      it('dispatches the correct event upon success', function () {
        var mockedFn = jest.genMockFunction();
        CosmosPackagesStore.addChangeListener(
          COSMOS_SEARCH_CHANGE,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_PACKAGES_SEARCH_SUCCESS,
          data: [{gid: 'foo', bar: 'baz'}],
          query: 'foo'
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });

      it('dispatches the correct event upon error', function () {
        var mockedFn = jasmine.createSpy('mockedFn');
        CosmosPackagesStore.addChangeListener(
          COSMOS_SEARCH_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_PACKAGES_SEARCH_ERROR,
          data: 'error',
          query: 'foo'
        });

        expect(mockedFn.calls.count()).toEqual(1);
        expect(mockedFn.calls.mostRecent().args).toEqual(['error', 'foo']);
      });

    });

  });

  describe('#fetchPackageDescription', function () {

    beforeEach(function () {
      this.requestFn = RequestUtil.json;
      RequestUtil.json = function (handlers) {
        handlers.success(Object.assign({}, packageDescribeFixture));
      };
      this.packageDescribeFixture = Object.assign({}, packageDescribeFixture);
    });

    afterEach(function () {
      RequestUtil.json = this.requestFn;
    });

    it('should return an instance of UniversePackage', function () {
      CosmosPackagesStore.fetchPackageDescription('foo', 'bar');
      var packageDetails = CosmosPackagesStore.getPackageDetails();
      expect(packageDetails instanceof UniversePackage).toBeTruthy();
    });

    it('should return the packageDetails it was given', function () {
      CosmosPackagesStore.fetchPackageDescription('foo', 'bar');
      var pkg = CosmosPackagesStore.getPackageDetails();
      expect(pkg.get('package').name)
        .toEqual(this.packageDescribeFixture.package.name);
      expect(pkg.get('package').version)
        .toEqual(this.packageDescribeFixture.package.version);
    });

    it('should pass though query parameters', function () {
      RequestUtil.json = jasmine.createSpy('RequestUtil#json');
      CosmosPackagesStore.fetchPackageDescription('foo', 'bar');
      expect(JSON.parse(RequestUtil.json.calls.mostRecent().args[0].data))
        .toEqual({packageName: 'foo', packageVersion: 'bar'});
    });

    describe('dispatcher', function () {

      it('stores packageDetails when event is dispatched', function () {
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_PACKAGE_DESCRIBE_SUCCESS,
          data: {gid: 'foo', bar: 'baz'},
          packageName: 'foo',
          packageVersion: 'bar'
        });

        var pkg = CosmosPackagesStore.getPackageDetails();
        expect(pkg.get('gid')).toEqual('foo');
        expect(pkg.get('bar')).toEqual('baz');
      });

      it('dispatches the correct event upon success', function () {
        var mockedFn = jest.genMockFunction();
        CosmosPackagesStore.addChangeListener(
          COSMOS_DESCRIBE_CHANGE,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_PACKAGE_DESCRIBE_SUCCESS,
          data: {gid: 'foo', bar: 'baz'},
          packageName: 'foo',
          packageVersion: 'bar'
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });

      it('dispatches the correct event upon error', function () {
        var mockedFn = jasmine.createSpy('mockedFn');
        CosmosPackagesStore.addChangeListener(
          COSMOS_DESCRIBE_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_PACKAGE_DESCRIBE_ERROR,
          data: 'error',
          packageName: 'foo',
          packageVersion: 'bar'
        });

        expect(mockedFn.calls.count()).toEqual(1);
        expect(mockedFn.calls.mostRecent().args).toEqual(['error', 'foo', 'bar']);
      });

    });

  });

  describe('#fetchInstalledPackages', function () {

    beforeEach(function () {
      this.requestFn = RequestUtil.json;
      RequestUtil.json = function (handlers) {
        handlers.success(Object.assign({}, packagesListFixture));
      };
      this.packagesListFixture = Object.assign({}, packagesListFixture);
    });

    afterEach(function () {
      RequestUtil.json = this.requestFn;
    });

    it('should return an instance of UniverseInstalledPackagesList', function () {
      CosmosPackagesStore.fetchInstalledPackages('foo', 'bar');
      var installedPackages = CosmosPackagesStore.getInstalledPackages();
      expect(installedPackages instanceof UniverseInstalledPackagesList)
        .toBeTruthy();
    });

    it('should return all of the installedPackages it was given', function () {
      CosmosPackagesStore.fetchInstalledPackages('foo', 'bar');
      var installedPackages =
        CosmosPackagesStore.getInstalledPackages().getItems();
      expect(installedPackages.length).toEqual(2);
    });

    it('stores the installedPackages it was given', function () {
      CosmosPackagesStore.fetchInstalledPackages('foo', 'bar');
      var installedPackage =
        CosmosPackagesStore.getInstalledPackages().getItems()[0];
      expect(installedPackage.get('packageDefinition').name)
        .toEqual('marathon');
      expect(installedPackage.get('appId'))
        .toEqual('/marathon-user');
    });

    it('should pass though query parameters', function () {
      RequestUtil.json = jasmine.createSpy('RequestUtil#json');
      CosmosPackagesStore.fetchInstalledPackages('foo', 'bar');
      expect(JSON.parse(RequestUtil.json.calls.mostRecent().args[0].data))
        .toEqual({packageName: 'foo', appId: 'bar'});
    });

    describe('dispatcher', function () {

      it('stores installedPackages when event is dispatched', function () {
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_PACKAGES_LIST_SUCCESS,
          data: [{appId: 'bar', packageInformation: {gid: 'foo', bar: 'baz'}}],
          packageName: 'foo',
          appId: 'bar'
        });

        var installedPackages =
          CosmosPackagesStore.getInstalledPackages().getItems();
        expect(installedPackages[0].get('gid')).toEqual('foo');
        expect(installedPackages[0].get('bar')).toEqual('baz');
        expect(installedPackages[0].get('appId')).toEqual('bar');
      });

      it('dispatches the correct event upon success', function () {
        var mockedFn = jest.genMockFunction();
        CosmosPackagesStore.addChangeListener(
          COSMOS_LIST_CHANGE,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_PACKAGES_LIST_SUCCESS,
          data: [{appId: 'bar', packageInformation: {gid: 'foo', bar: 'baz'}}],
          packageName: 'foo',
          appId: 'baz'
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });

      it('dispatches the correct event upon error', function () {
        var mockedFn = jasmine.createSpy('mockedFn');
        CosmosPackagesStore.addChangeListener(
          COSMOS_LIST_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_PACKAGES_LIST_ERROR,
          data: 'error',
          packageName: 'foo',
          appId: 'bar'
        });

        expect(mockedFn.calls.count()).toEqual(1);
        expect(mockedFn.calls.mostRecent().args).toEqual(['error', 'foo', 'bar']);
      });

    });

  });

  describe('#installPackage', function () {

    describe('dispatcher', function () {

      it('dispatches the correct event upon success', function () {
        var mockedFn = jest.genMockFunction();
        CosmosPackagesStore.addChangeListener(
          COSMOS_INSTALL_SUCCESS,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_PACKAGE_INSTALL_SUCCESS,
          data: [{foo: 'bar'}],
          packageName: 'foo',
          packageVersion: 'bar'
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });

      it('dispatches the correct event upon error', function () {
        var mockedFn = jasmine.createSpy('mockedFn');
        CosmosPackagesStore.addChangeListener(
          COSMOS_INSTALL_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_PACKAGE_INSTALL_ERROR,
          data: 'error',
          packageName: 'foo',
          packageVersion: 'bar'
        });

        expect(mockedFn.calls.count()).toEqual(1);
        expect(mockedFn.calls.mostRecent().args).toEqual(['error', 'foo', 'bar']);
      });

    });

  });

  describe('#uninstallPackage', function () {

    describe('dispatcher', function () {

      it('dispatches the correct event upon success', function () {
        var mockedFn = jest.genMockFunction();
        CosmosPackagesStore.addChangeListener(
          COSMOS_UNINSTALL_SUCCESS,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_PACKAGE_UNINSTALL_SUCCESS,
          data: [{foo: 'bar'}],
          packageName: 'foo',
          packageVersion: 'bar',
          appId: 'baz'
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });

      it('dispatches the correct event upon error', function () {
        var mockedFn = jasmine.createSpy('mockedFn');
        CosmosPackagesStore.addChangeListener(
          COSMOS_UNINSTALL_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_PACKAGE_UNINSTALL_ERROR,
          data: 'error',
          packageName: 'foo',
          packageVersion: 'bar',
          appId: 'baz'
        });

        expect(mockedFn.calls.count()).toEqual(1);
        expect(mockedFn.calls.mostRecent().args).toEqual(['error', 'foo', 'bar', 'baz']);
      });

    });

  });

  describe('#processRepositoriesSuccess', function () {

    beforeEach(function () {
      CosmosPackagesStore.processRepositoriesSuccess([
        {foo: 'bar'}, {baz: 'qux'}
      ]);
    });

    it('stores repositories', function () {
      var repos = CosmosPackagesStore.getRepositories();
      expect(repos.getItems().length).toEqual(2);
    });

  });

  describe('dispatcher', function () {

    describe('repositories fetch', function () {

      it('dispatches the correct event on success', function () {
        var mockedFn = jest.genMockFunction();
        CosmosPackagesStore.addChangeListener(
          COSMOS_REPOSITORIES_SUCCESS,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_REPOSITORIES_LIST_SUCCESS,
          data: [{foo: 'bar'}]
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });

      it('dispatches the correct event on error', function () {
        var mockedFn = jest.genMockFunction();
        CosmosPackagesStore.addChangeListener(
          COSMOS_REPOSITORIES_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_REPOSITORIES_LIST_ERROR,
          data: {foo: 'bar'},
          name: 'baz',
          uri: 'qux'
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
        expect(mockedFn.mock.calls[0]).toEqual([{foo: 'bar'}]);
      });

    });

    describe('repository add', function () {

      it('dispatches the correct event on success', function () {
        var mockedFn = jest.genMockFunction();
        CosmosPackagesStore.addChangeListener(
          COSMOS_REPOSITORY_ADD_SUCCESS,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_REPOSITORY_ADD_SUCCESS,
          data: {foo: 'bar'},
          name: 'baz',
          uri: 'qux'
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
        expect(mockedFn.mock.calls[0]).toEqual(
          [{foo: 'bar'}, 'baz', 'qux']
        );
      });

      it('dispatches the correct event on error', function () {
        var mockedFn = jest.genMockFunction();
        CosmosPackagesStore.addChangeListener(
          COSMOS_REPOSITORY_ADD_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_REPOSITORY_ADD_ERROR,
          data: {foo: 'bar'},
          name: 'baz',
          uri: 'qux'
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
        expect(mockedFn.mock.calls[0]).toEqual(
          [{foo: 'bar'}, 'baz', 'qux']
        );
      });

    });

    describe('repository delete', function () {

      it('dispatches the correct event on success', function () {
        var mockedFn = jest.genMockFunction();
        CosmosPackagesStore.addChangeListener(
          COSMOS_REPOSITORY_DELETE_SUCCESS,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_REPOSITORY_DELETE_SUCCESS,
          data: {foo: 'bar'},
          name: 'baz',
          uri: 'qux'
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
        expect(mockedFn.mock.calls[0]).toEqual(
          [{foo: 'bar'}, 'baz', 'qux']
        );
      });

      it('dispatches the correct event on error', function () {
        var mockedFn = jest.genMockFunction();
        CosmosPackagesStore.addChangeListener(
          COSMOS_REPOSITORY_DELETE_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_COSMOS_REPOSITORY_DELETE_ERROR,
          data: {foo: 'bar'},
          name: 'baz',
          uri: 'qux'
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
        expect(mockedFn.mock.calls[0]).toEqual(
          [{foo: 'bar'}, 'baz', 'qux']
        );
      });

    });

  });

});
