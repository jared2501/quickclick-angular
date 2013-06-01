'use strict';

var app = angular.module('qcFrontendApp');

app.controller('Questions/ListCtrl', ['$scope', '$routeParams', '$location', 'QuestionService', 'CourseService', 'SemesterService', 'Authuser', function($scope, $routeParams, $location, QuestionService, CourseService, SemesterService, Authuser) {
	$scope.templateType = ($location.path().indexOf('trash')> 0) ? 'trash' : 'list';
	
	$scope.course = CourseService.getCourse($routeParams.courseId);
	$scope.semester = SemesterService.getSemester($routeParams.semesterId);
	
	$scope.selectedQuestions = [];
	$scope.questionPage = QuestionService.getQuestionsPage({
		'location': $scope.templateType,
		'course_id': $routeParams.courseId,
		'semester_id': $routeParams.semesterId,
		'pageNum': $location.search().page || 1
	});

	// Necessary since we gotta watch for when the questions array changes
	$scope.$watch('questionPage.questions', function(questions) {
		if (questions && questions.length) {
			$scope.selectedQuestions = questions.filter(function(question) { return question.selected; });
		}
	});

	$scope.changePage = function(page) {
		$location.search({'page': page});
	};

	// Modal options
	$scope.modalOptions = {
		backdropFade: false
	};
	
	// For the copy to modal
	$scope.copyModalShouldBeOpen = false;
	$scope.copyModalClose = function () {
		$scope.copyModalShouldBeOpen = false;
	};
	$scope.copyModalOpen = function() {
		if($scope.questionPage.questions.find(function(q) { return q.selected; })) {
			$scope.coursePage = CourseService.getCoursePage({'user_id': Authuser.id, 'limit': 1000});
			$scope.semesterPage = SemesterService.getSemesterPage({'limit': 1000});

			$scope.$watch('coursePage.courses', function(courses) {
				if(courses) {
					$scope.selectedCourse = courses.find(function(c) { return c.id === $scope.course.id; });
				}
			});
			
			$scope.$watch('semesterPage.semesters', function(semesters) {
				if(semesters) {
					$scope.selectedSemester = semesters.find(function(s) { return s.id === $scope.semester.id; });
				}
			});

			$scope.copyModalShouldBeOpen = true;
		}
	}

	$scope.qrModalShouldBeOpen = false;
	$scope.qrModalClose = function () {
		$scope.qrModalShouldBeOpen = false;
	};
	$scope.qrModalOpen = function (question) {
		$scope.qrModalShouldBeOpen = true;
		$scope.qrQuestion = question;
	};


	$scope.open = function() {
		QuestionService.openSelected($scope.questionPage);
	};

	$scope.close = function() {
		QuestionService.closeSelected($scope.questionPage);
	};

	// Actions below here create/delete, therefore they should reload the question list
	$scope.trash = function() {
		QuestionService.trashSelected($scope.questionPage);
	};

	$scope.copy = function() {
		$scope.copyModalShouldBeOpen = false;
		QuestionService.copySelected($scope.questionPage, {
			'courseId': $scope.selectedCourse.id,
			'semesterId' : $scope.selectedSemester.id
		});
	};
	
	$scope['delete'] = function() {
		if (confirm('Do you really want to delete these questions permanently?')) {
			QuestionService.deleteSelected($scope.questionPage);
		}
	};

	$scope['restore'] = function() {
		QuestionService.restoreSelected($scope.questionPage);
	};
}]);