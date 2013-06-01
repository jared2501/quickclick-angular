'use strict';

var app = angular.module('qcFrontendApp');

app.controller('Courses/EditCtrl', ['$scope', '$routeParams', '$location', 'CourseService', 'Authuser', function($scope, $routeParams, $location, CourseService, Authuser) {
	$scope.templateType = ($location.path().indexOf('create')> 0) ? 'create' : 'edit';

	$scope.course = CourseService.getCourse($routeParams.courseId);

	$scope.save = function() {
		CourseService.saveCourse($scope.course, {'userId': Authuser.id}).then(function(){
			$location.path('courses');
		});
	};
	
	$scope.cancel = function() {
		$location.path('courses');
	};
}]);
