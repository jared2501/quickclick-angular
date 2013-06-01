'use strict';

var app = angular.module('qcFrontendApp');

app.controller('NotificationsCtrl', ['$scope', 'NotificationsService', function($scope, NotificationsService) {
	$scope.$watch( function () { return NotificationsService.notifications; }, function ( notifications ) {
		$scope.notifications = notifications;
	});
}]);