'use strict';

var app = angular.module('qcFrontendApp');

app.controller('Questions/EditCtrl', ['$scope', '$location', '$window', '$routeParams', 'QuestionService', 'CourseService', 'SemesterService', function($scope, $location, $window, $routeParams, QuestionService, CourseService, SemesterService) {
	var isUndefined = angular.isUndefined;

	$scope.templateType = ($location.path().indexOf('create')> 0) ? 'create' : 'edit';

	$scope.course = CourseService.getCourse($routeParams.courseId);
	$scope.semester = SemesterService.getSemester($routeParams.semesterId);
	$scope.question = QuestionService.getQuestion($routeParams.questionId); // Is null when creating a question

	$scope.save = function() {
		if(isUndefined($scope.question.course_id) || isUndefined($scope.question.semester_id)) { // For creating question
			$scope.question.course_id = $scope.course.id;
			$scope.question.semester_id = $scope.semester.id;
		}

		QuestionService.saveQuestion($scope.question).then(function(){
			$window.history.back();
		});
	}
	
	$scope.cancel = function() {
		$window.history.back();
	}
}]);