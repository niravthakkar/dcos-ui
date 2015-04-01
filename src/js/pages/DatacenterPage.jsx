/** @jsx React.DOM */

var _ = require("underscore");
var React = require("react/addons");

var AlertPanel = require("../components/AlertPanel");
var EventTypes = require("../constants/EventTypes");
var FilterInputText = require("../components/FilterInputText");
var FilterHeadline = require("../components/FilterHeadline");
var InternalStorageMixin = require("../mixins/InternalStorageMixin");
var MesosStateStore = require("../stores/MesosStateStore");
var ResourceBarChart = require("../components/charts/ResourceBarChart");
var SidebarActions = require("../events/SidebarActions");
var SidebarToggle = require("./SidebarToggle");
var HostTable = require("../components/HostTable");

function getMesosHosts(state) {
  var filters = _.pick(state, "searchString");
  var hosts = MesosStateStore.getHosts(filters);
  var allHosts = MesosStateStore.getLatest().slaves;
  return {
    hosts: hosts,
    statesProcessed: MesosStateStore.getStatesProcessed(),
    refreshRate: MesosStateStore.getRefreshRate(),
    allHosts: allHosts,
    totalHostsResources: MesosStateStore.getTotalHostsResources(hosts),
    totalResources: MesosStateStore.getTotalResources()
  };
}

var DEFAULT_FILTER_OPTIONS = {
  searchString: ""
};

var DatacenterPage = React.createClass({

  displayName: "DatacenterPage",

  mixins: [InternalStorageMixin],

  getInitialState: function () {
    return _.clone(DEFAULT_FILTER_OPTIONS);
  },

  componentWillMount: function () {
    this.internalStorage_set(getMesosHosts(this.state));
  },

  componentDidMount: function () {
    MesosStateStore.addChangeListener(
      EventTypes.MESOS_STATE_CHANGE,
      this.onMesosStateChange
    );
  },

  componentWillUnmount: function () {
    MesosStateStore.removeChangeListener(
      EventTypes.MESOS_STATE_CHANGE,
      this.onMesosStateChange
    );
  },

  statics: {
    willTransitionTo: function () {
      SidebarActions.close();
    }
  },

  onMesosStateChange: function () {
    this.internalStorage_set(getMesosHosts(this.state));
    this.forceUpdate();
  },

  onFilterChange: function (searchString) {
    var stateChanges = {searchString: searchString};

    this.internalStorage_set(getMesosHosts(stateChanges));
    this.setState(stateChanges);
  },

  resetFilter: function () {
    var state = _.clone(DEFAULT_FILTER_OPTIONS);
    this.internalStorage_set(getMesosHosts(state));
    this.setState(state);
  },

  getHostsPageContent: function () {
    var data = this.internalStorage_get();
    var state = this.state;

    /* jshint trailing:false, quotmark:false, newcap:false */
    /* jscs:disable disallowTrailingWhitespace, validateQuoteMarks, maximumLineLength */
    return (
      <div className="container container-fluid container-pod">
        <ResourceBarChart
          data={data.hosts}
          resources={data.totalHostsResources}
          totalResources={data.totalResources}
          refreshRate={data.refreshRate} />
        <FilterHeadline
          onReset={this.resetFilter}
          name="Hosts"
          currentLength={data.hosts.length}
          totalLength={data.allHosts.length} />
        <FilterInputText
          searchString={state.searchString}
          onSubmit={this.onFilterChange} />
        <HostTable hosts={data.hosts} />
      </div>
    );
    /* jshint trailing:true, quotmark:true, newcap:true */
    /* jscs:enable disallowTrailingWhitespace, validateQuoteMarks, maximumLineLength */
  },

  getEmptyHostsPageContent: function () {
    /* jshint trailing:false, quotmark:false, newcap:false */
    /* jscs:disable disallowTrailingWhitespace, validateQuoteMarks, maximumLineLength */
    return (
      <AlertPanel title="Empty Datacenter">
        <p>Your datacenter is looking pretty empty. We don't see any nodes other than your master.</p>
      </AlertPanel>
    );
    /* jshint trailing:true, quotmark:true, newcap:true */
    /* jscs:enable disallowTrailingWhitespace, validateQuoteMarks, maximumLineLength */
  },

  getContents: function (isEmpty) {
    if (isEmpty) {
      return this.getEmptyHostsPageContent();
    } else {
      return this.getHostsPageContent();
    }
  },

  render: function () {
    var data = this.internalStorage_get();
    var isEmpty = data.statesProcessed && data.allHosts.length === 0;

    /* jshint trailing:false, quotmark:false, newcap:false */
    /* jscs:disable disallowTrailingWhitespace, validateQuoteMarks, maximumLineLength */
    return (
      <div className="flex-container-col">
        <div className="page-header">
          <div className="container container-fluid container-pod container-pod-short-bottom container-pod-divider-bottom container-pod-divider-bottom-align-right">
            <div className="page-header-context">
              <SidebarToggle />
              <h1 className="page-header-title flush-top flush-bottom">
                Datacenter
              </h1>
            </div>
            <div className="page-header-navigation" />
          </div>
        </div>
        <div className="page-content container-scrollable">
         {this.getContents(isEmpty)}
        </div>
      </div>
    );
  }

});

module.exports = DatacenterPage;
