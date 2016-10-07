var assert = require('assert');

describe('page title', function() {
  it('has the correct page title', function() {
    browser.url('/');
    var title = browser.getTitle();
    assert.equal(title, 'AngularJS - Todo Example');
  });
});

describe