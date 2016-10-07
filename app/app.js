var myApp = angular.module('todoApp', ['ngRoute']);
myApp.config(function ($routeProvider) {
    'use strict';
    var viewPath = "app/views/";
    $routeProvider.when('/home', {
        templateUrl: viewPath + "todo.html",
        controller: "TodoCtrl",
        resolve: {
            store: function (todoStorage) {
                // Get the correct module (API or localStorage).
                return todoStorage.then(function (module) {
                    module.get(); // Fetch the todo records in the background.
                    return module;
                });
            }
        }
    }).when('/about', {
        templateUrl: viewPath + "about.html",
        controller: "AboutCtrl"
    }).otherwise({
        redirectTo: '/home'
    });
});