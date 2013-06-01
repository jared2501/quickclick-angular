'use strict';

var app = angular.module('qcFrontendApp');

app.controller('UserDropdownCtrl', ['$scope', 'Authuser', function($scope, Authuser) {
	$scope.authUser = Authuser;
}]);