'use strict';

var app = angular.module('qcFrontendApp');

app.controller('SubnavCtrl', ['$scope', '$location', function($scope, $location) {
	$scope.updateMenu = function (location) {
		try {
			var reg = new RegExp("/([a-zA-Z\-]+)");
			var result = reg.exec(location);
			
			if(!angular.isUndefined(result)) {
				if(!angular.isUndefined(result.length) && result.length > 1) {
					if(result[1] == 'dashboard') {
						$scope.currentLocation = 'dashboard';
					} else if(result[1] == 'courses' || result[1] == 'questions' || result[1] == 'results') {
						$scope.currentLocation = 'manageCourses';
					} else if(result[1] == 'students') {
						$scope.currentLocation = 'manageStudents';
					}
				}
			}
		} catch(err) {
			if(!angular.isUndefined(console) && !angular.isUndefined(console.log)) {
				console.log(err);
			}
		}
	}

	$scope.$watch( function() { return $location.path(); }, function ( path ) {
		$scope.updateMenu(path);
	});
}]);