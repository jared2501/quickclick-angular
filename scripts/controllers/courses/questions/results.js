'use strict';

var app = angular.module('qcFrontendApp');

app.controller('Questions/ResultsCtrl', ['$scope', '$routeParams', '$timeout', 'QuestionService', 'CourseService', 'SemesterService', function($scope, $routeParams, $timeout, QuestionService, CourseService, SemesterService) {
	var backUrl = $routeParams.courseId+'/'+$routeParams.semesterId+'/'+'questions/list',
		timeoutPromise;

	$scope.course = CourseService.getCourse($routeParams.courseId);
	$scope.semester = SemesterService.getSemester($routeParams.semesterId);

	var questionPoller = function() {
		timeoutPromise = $timeout(function(){
			$scope.question = QuestionService.getQuestion($routeParams.questionId);
			questionPoller();
		}, 1000);
	}

	$scope.question = QuestionService.getQuestion($routeParams.questionId);
	questionPoller();
	
	$scope.$on('$destroy', function() {
		$timeout.cancel(timeoutPromise);
	});

	// Default to not showing answers, or results
	$scope.showResults = false;
	$scope.showAnswers = false;


	$scope.open = function() {
		QuestionService.openQuestion($scope.question);
	}

	$scope.close = function() {
		QuestionService.closeQuestion($scope.question);
	}


	$scope.nextQuestion = {'disabled': true, 'link': '', 'title': ''};
	$scope.previousQuestion = {'disabled': true, 'link': '', 'title': ''};

	$scope.$watch('question.siblings', function(siblings) {
		if(siblings) {
			$scope.nextQuestion = generateSiblingInfo(siblings['next'], 'next');
			$scope.previousQuestion = generateSiblingInfo(siblings['previous'], 'previous');
		}
	});

	var generateSiblingInfo = function(sibling, nextOrPrevious) {
		if(sibling && sibling.id) {
			return {
				'disabled': false,
				'link': '#/'+$routeParams.courseId+'/'+$routeParams.semesterId+'/results/'+sibling.id,
				'title': (nextOrPrevious == 'next') ? 'Next question: \''+sibling.title+'\'' : 'Previous question: \''+sibling.title+'\''
			}
		}
		return {'disabled': true, 'link': '', 'title': ''};
	}
}]);
