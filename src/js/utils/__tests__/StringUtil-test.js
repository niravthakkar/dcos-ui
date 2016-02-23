jest.dontMock('../StringUtil');

var StringUtil = require('../StringUtil');

describe('StringUtil', function () {

  describe('#filterByString', function () {

    it('filters using a key as getter', function () {
      var _return = StringUtil.filterByString(
        [{id: 0, foo: 'bar'}, {id: 1, foo: 'baz'}, {id: 2, foo: 'bar'}],
        'foo',
        'bar'
      );

      expect(_return).toEqual([{id: 0, foo: 'bar'}, {id: 2, foo: 'bar'}]);
    });

    it('filters using a function as getter', function () {
      var _return = StringUtil.filterByString(
        [{id: 0, foo: 'bar'}, {id: 1, foo: 'baz'}, {id: 2, foo: 'bar'}],
        function (el) {
          return el.foo;
        },
        'baz'
      );
      expect(_return).toEqual([{id: 1, foo: 'baz'}]);
    });

  });

  describe('#escapeForRegExp', function () {

    it('escapes string', function () {
      var _return = StringUtil.escapeForRegExp('-[]/{}()*+?.\\^$|');
      var escaped = '\\-\\[\\]\\/\\{\\}\\(\\)\\*\\+\\?\\.\\\\\\^\\$\\|';
      expect(_return).toEqual(escaped);
    });

  });

  describe('#pluralize', function () {

    it('pluralizes if there\'s more than one item', function () {
      expect(StringUtil.pluralize('item', 2)).toEqual('items');
    });

    it('pluralizes if there\'s no items', function () {
      expect(StringUtil.pluralize('item', 0)).toEqual('items');
    });

    it('doesn\'t pluralize if there\'s a single item', function () {
      expect(StringUtil.pluralize('item', 1)).toEqual('item');
    });

    it('correctly pluralizes if a word ends with a \'y\'', function () {
      expect(StringUtil.pluralize('butterfly', 2)).toEqual('butterflies');
    });

  });

  describe('#capitalize', function () {

    it('capitalizes the string correctly', function () {
      expect(StringUtil.capitalize('kenny')).toEqual('Kenny');
    });

    it('returns null if input is not a string', function () {
      expect(StringUtil.capitalize(10)).toEqual(null);
    });

    it('does nothing if string is already capitalized', function () {
      var capitalizedString = 'Name';
      expect(StringUtil.capitalize(capitalizedString))
        .toEqual(capitalizedString);
    });
  });

});