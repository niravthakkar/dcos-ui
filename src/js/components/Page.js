var classNames = require('classnames');
var GeminiScrollbar = require('react-gemini-scrollbar');
var React = require('react');

var InternalStorageMixin = require('../mixins/InternalStorageMixin');
var SidebarToggle = require('../components/SidebarToggle');

var Page = React.createClass({

  displayName: 'Page',

  mixins: [InternalStorageMixin],

  propTypes: {
    className: React.PropTypes.string,
    navigation: React.PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.string
    ]),
    title: React.PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.string
    ]),
    wrapChildren: React.PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      wrapChildren: true
    };
  },

  componentDidMount: function () {
    this.internalStorage_set({
      rendered: true
    });
    this.forceUpdate();
  },

  getChildren: function () {
    var data = this.internalStorage_get();
    if (data.rendered === true) {
      return this.props.children;
    }

    return null;
  },

  getNavigation: function (navigation) {
    if (!navigation) {
      return null;
    }

    return (
      <div className="page-header-navigation">
        <div className="container container-fluid container-pod container-pod-short flush-bottom">
          {navigation}
        </div>
      </div>
    );
  },

  getPageHeader: function (title, navigation) {
    return (
      <div className="page-header">
        {this.getTitle(title)}
        {this.getNavigation(navigation, title)}
      </div>
    );
  },

  getTitle: function (title) {
    if (!title) {
      return null;
    } else if (React.isValidElement(title)) {
      return title;
    }

    return (
      <div className="page-header-context">
        <div className="container container-fluid container-pod container-pod-short">
          <h1 className="page-header-title inverse flush">
            <SidebarToggle />
            {title}
          </h1>
        </div>
      </div>
    );
  },

  render: function () {
    let {className, navigation, title} = this.props;

    let classSet = classNames('page flex-container-col', className);

    let content = this.getChildren();

    if (this.props.wrapChildren) {
      content = (
        <GeminiScrollbar autoshow={true} className="page-content container-scrollable inverse">
          <div className="flex-container-col container container-fluid container-pod container-pod-short-top">
            {content}
          </div>
        </GeminiScrollbar>
      );
    }

    return (
      <div className={classSet}>
        {this.getPageHeader(title, navigation)}
        {content}
      </div>
    );
  }
});

module.exports = Page;
