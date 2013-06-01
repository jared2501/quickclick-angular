'use strict';

var app = angular.module('qcFrontendApp');

app.controller('Courses/JoinCtrl', ['$scope', '$location', 'CourseService', 'CourseModel', 'Authuser', function($scope, $location, CourseService, CourseModel, Authuser) {
	$scope.coursePage = CourseService.getCoursePage({
		'limit': 1000
	});

	$scope.selectedCourses = [];
	
	$scope.joinMultiple = function() {
		$scope.selectedCourses.each(function(course) { course.selected = true; });
		CourseService.joinSelected($scope.coursePage, Authuser.id).then(function(){
			$location.path('courses');
		});
	};

	$scope.cancel = function() {
		$location.path('courses');
	}
}]);
