var assert = require('assert');
describe('page title', function () {
    it('has the correct page title', function () {
        browser.url('/');
        var title = browser.getTitle();
        assert.equal(title, 'AngularJS - Todo Example');
    });
});
describe('todo page', function () {
    describe('todo tasks', function () {
        it('can add task', function () {
            browser.url('/');
            var taskName = 'test-add';
            AddTask(taskName);
            var exists = GetGridItems().isExisting('label=' + taskName);
            assert.equal(exists, true);
        });
        it('can delete task', function () {
            browser.url('/');
            var taskName = 'test-delete';
            AddTask(taskName);
            var selector = ".//label[text()='" + taskName + "']/parent::*";
            var item = browser.element(selector);
            browser.moveToObject(selector);
            item.click('.destroy');
            var exists = browser.isExisting('label=' + taskName);
            assert.equal(exists, false);
        });
        it('can mark a task as completed', function () {
            browser.url('/');
            var taskName = 'test-mark';
            AddTask(taskName);
            var item = MarkTaskAsCompleted(taskName);
            var checked = item.isSelected('input.toggle');
            assert.equal(checked, true);
        });
        it('can clear completed tasks', function () {
            browser.url('/');
            var taskName = 'test-clear';
            AddTask(taskName);
            MarkTaskAsCompleted(taskName);
            browser.click('#clear-completed');
            var exists = browser.isExisting('label=' + taskName);
            assert.equal(exists, false);
        });
        it('can filter completed tasks', function () {
            browser.url('/');
            var taskNameCompleted = 'test-filter-completed-1';
            AddTask(taskNameCompleted);
            MarkTaskAsCompleted(taskNameCompleted);
            var taskNameActive = 'test-filter-completed-2';
            AddTask(taskNameActive);
            Filter('Completed');
            var exists = browser.isExisting('label=' + taskNameCompleted);
            Filter('All');
            assert.equal(exists, true);
        });
        it('can filter active tasks', function () {
            browser.url('/');
            var taskNameCompleted = 'test-filter-active-1';
            AddTask(taskNameCompleted);
            MarkTaskAsCompleted(taskNameCompleted);
            var taskNameActive = 'test-filter-active-2';
            AddTask(taskNameActive);
            Filter('Active');
            var exists = browser.isExisting('label=' + taskNameActive);
            Filter('All');
            assert.equal(exists, true);
        });
    });
});

function GetGridItems() {
    return browser.element('#todo-list').element('li');
}

function AddTask(taskName) {
    var input = browser.element('#new-todo');
    input.setValue(taskName);
    input.keys("Enter");
    browser.waitForVisible('label=' + taskName, 5000);
}

function MarkTaskAsCompleted(taskName) {
    var item = browser.element(".//label[text()='" + taskName + "']/parent::*");
    item.click('input.toggle');
    return item;
}

function Filter(type) {
    var item = browser.element(".//ul[@id='filters']/li[text()[contains(.,'" + type + "')]]");
    item.click('input[name="filterType"]');
    return item;
}