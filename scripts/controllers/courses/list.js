'use strict';

var app = angular.module('qcFrontendApp');

app.controller('Courses/ListCtrl', ['$scope', '$location', 'CourseService', 'SemesterService', 'Authuser', function($scope, $location, CourseService, SemesterService, Authuser) {
	$scope.selectedCourses = [];
	
	$scope.coursePage = CourseService.getCoursePage({
		'user_id': Authuser.id,
		'pageNum': $location.search().page || 1
	});

	$scope.semesterPage = SemesterService.getSemesterPage({
		'limit': 1000
	});

	$scope.$watch('semesterPage.semesters', function(semesters) {
		if(semesters) {
			$scope.selectedSemester = semesters.find(function(s) { return s.current; });
		}
	});
	
	$scope.$watch('coursePage.courses', function(courses) {
		if (courses && courses.length) {
			$scope.selectedCourses = courses.filter(function(course) { return course.selected; });
		}
	});

	$scope.changePage = function(page) {
		$location.search({'page': page});
	};

	$scope.remove = function() {
		CourseService.unjoinSelected($scope.coursePage, Authuser.id);
	};
}]);
