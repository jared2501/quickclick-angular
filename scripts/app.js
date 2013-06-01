'use strict';

angular.module('qc-config', []).config(['$provide', function($provide){
	$provide.constant('apiConfig', globalApi);

	// gloablAuthUser should be defined by fuelphp, accessible at top of page.
	$provide.constant('authUserConfig', globalAuthUser);
}]);

angular.module('qcFrontendApp', ['ui.bootstrap', 'model.authuser', 'service.question', 'service.course', 'service.semester', 'NotifcationsService'])
	.config(['$routeProvider', '$provide', function($routeProvider, $provide) {
	$routeProvider
		// ==== Courses ====
		// List
		.when('/courses', {
			templateUrl: 'views/courses/list.html',
			controller: 'Courses/ListCtrl'
		})
		// Join
		.when('/courses/join', {
			templateUrl: 'views/courses/join.html',
			controller: 'Courses/JoinCtrl'
		})
		.when('/courses/create', {
			templateUrl: 'views/courses/edit.html',
			controller: 'Courses/EditCtrl'
		})
		.when('/courses/:courseId', {
			templateUrl: 'views/courses/edit.html',
			controller: 'Courses/EditCtrl'
		})

		// ==== Course -> Questions ====
		// List
		.when('/:courseId/:semesterId/questions/list', {
			templateUrl: 'views/courses/questions/list.html',
			controller: 'Questions/ListCtrl'
		})
		// Trash
		.when('/:courseId/:semesterId/questions/trash', {
			templateUrl: 'views/courses/questions/list.html',
			controller: 'Questions/ListCtrl'
		})
		// Create
		.when('/:courseId/:semesterId/questions/create', {
			templateUrl: 'views/courses/questions/edit.html',
			controller: 'Questions/EditCtrl'
		})
		// Edit
		.when('/:courseId/:semesterId/questions/:questionId', {
			templateUrl: 'views/courses/questions/edit.html',
			controller: 'Questions/EditCtrl'
		})
		// Results
		.when('/:courseId/:semesterId/results/:questionId', {
			templateUrl: 'views/courses/questions/results.html',
			controller: 'Questions/ResultsCtrl'
		})

		// ==== Courses -> Students ====
		.when('/:courseId/:semesterId/courses/students/list', {
			templateUrl: 'views/courses/students/list.html',
			controller: 'Students/ListCtrl'
		})

		// ==== Students ====
		.when('/students', {
			templateUrl: 'views/students/main.html',
			controller: 'Students/MainCtrl'
		})


		.otherwise({redirectTo: '/courses'});
}]);