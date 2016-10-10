var assert = require('assert');

describe('about page', function() {
  it('loads correctly on button click', function() {    
    browser.url('/');
    browser.waitForVisible('a=About', 5000);
    browser.click('a=About');
    browser.waitForVisible('h1.page-header', 5000);
    var text = browser.getText('h1.page-header');
    assert.equal(text, 'About It\'s Nice to Meet You!');
  });
});