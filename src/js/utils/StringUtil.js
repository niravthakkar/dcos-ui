import marked from 'marked';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

const StringUtil = {
  arrayToJoinedString: function (array=[], separator = ', ') {
    if (Array.isArray(array)) {
      return array.join(separator);
    }

    return '';
  },

  filterByString: function (objects, getter, searchString) {
    var regex = StringUtil.escapeForRegExp(searchString);
    var searchPattern = new RegExp(regex, 'i');

    if (typeof getter === 'function') {
      return objects.filter(function (obj) {
        return searchPattern.test(getter(obj));
      });
    }

    return objects.filter(function (obj) {
      return searchPattern.test(obj[getter]);
    });
  },

  escapeForRegExp: function (str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  },

  isUrl: function (str) {
    return !!str && /^https?:\/\/.+/.test(str);
  },

  isEmail: function (str) {
    // https://news.ycombinator.com/item?id=8360786
    return !!str &&
      str.length > 3 &&
      str.indexOf('@') !== -1 &&
      str.indexOf('.') !== -1;
  },

  pluralize: function (string, arity) {
    if (arity == null) {
      arity = 2;
    }

    if (string.length === 0) {
      return '';
    }

    arity = parseInt(arity, 10);

    if (arity !== 1) {
      string = string.replace(/y$/, 'ie') + 's';
    }

    return string;
  },

  capitalize: function (string) {
    if (typeof string !== 'string') {
      return null;
    }

    return string.charAt(0).toUpperCase() + string.slice(1, string.length);
  },

  humanizeArray: function (array, options) {
    options = Object.assign({
      serialComma: true,
      wrapValueFunction: false
    }, options);

    let length = array.length;
    let conjunction =  ' and ';

    if (length === 0) {
      return '';
    }

    if (length === 1) {
      if (options.wrapValueFunction) {
        return options.wrapValueFunction(array[0], 0);
      } else {
        return array[0];
      }
    }

    if (length === 2) {
      if (options.wrapValueFunction) {
        return [
          options.wrapValueFunction(array[0], 0),
          conjunction,
          options.wrapValueFunction(array[1], 1)
        ];
      } else {
        return array.join(conjunction);
      }
    }

    let head = array.slice(0, -1);
    let tail = array.slice(-1)[0];
    if (options.serialComma) {
      conjunction = ', and ';
    }

    if (options.wrapValueFunction) {
      let jsx = head.reduce(function (memo, value, index) {
        memo.push(options.wrapValueFunction(value, index));

        if (index !== head.length - 1) {
          memo.push(', ');
        }

        return memo;
      }, []);

      jsx.push(conjunction);
      jsx.push(options.wrapValueFunction(tail, 'tail'));

      return jsx;
    } else {
      return head.join(', ') + conjunction + tail;
    }
  },

  parseMarkdown(text) {
    if (!text) {
      return null;
    }

    let __html = marked(
      // Remove any tabs, that will create code blocks
      text.replace('\t', ' '),
      {gfm: true, tables: false, sanitize: true}
    );

    if (!__html) {
      return null;
    }

    return {__html};
  },

  /**
   * @param {Array} id       - An array that, when concatenated, represents an ID.
   * @param {Array} splitBy  - Tokens to split id by.
   * @param {Object} replace - Keys are words to replace, with value of the word
   *                           to replace with.
   * @param {Boolean} removeConsecutive
   *                         - Whether or not to remove consecutive duplicate
   *                           word tokens.
   * @return {String}        - Human-readable title.
   */
  idToTitle: function (id, splitBy=[], replace={}, removeConsecutive) {

    if (splitBy.length === 0) {
      return id.reduce((title, word, i, words) => {
        if (removeConsecutive && (i > 0) && (word === words[i - 1])) {
          return title;
        }
        word = replace[word] || this.capitalize(word.toLowerCase().trim());
        return `${title} ${word}`;
      }, '').trim();
    }

    let splitID = id.reduce(function (accumulated, element) {
      let splitWords = element.split(splitBy.shift());

      splitWords.map(function (token) {
        accumulated.push(token);
      });
      return accumulated;
    }, []);

    return this.idToTitle(splitID, splitBy, replace, removeConsecutive);
  }
};

module.exports = StringUtil;
