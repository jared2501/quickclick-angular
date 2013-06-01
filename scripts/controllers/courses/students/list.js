'use strict';

var app = angular.module('qcFrontendApp');

app.controller('Students/ListCtrl', ['$scope', '$routeParams', 'CourseService', 'SemesterService', function($scope, $routeParams, CourseService, SemesterService) {
	$scope.course = CourseService.getCourse($routeParams.courseId);
	$scope.semester = SemesterService.getSemester($routeParams.semesterId);
}]);
