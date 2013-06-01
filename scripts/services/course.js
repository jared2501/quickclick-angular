//~ Course service

'use strict';

var module = angular.module('service.course', ['qc-config']);

module.service('CourseModel', ['$q', '$http', 'apiConfig', 'Authuser', 'NotificationsService', function($q, $http, apiConfig, Authuser, NotificationsService){
	var apiRootLocation = apiConfig.rootLocation;

	this.list = function(params) {
		var deferred = $q.defer(),
			queryArr = [];

		if (!angular.isUndefined(params.user_id) && null !== params.user_id) {
			queryArr.push('user_id=' + params.user_id);
		}

		queryArr.push('limit=' + params.limit);
		queryArr.push('offset=' + (parseInt(params.pageNum, 10) - 1) * params.limit);

		$http.get(apiRootLocation + 'course?' + queryArr.join('&')).success(function(courseList) {
			deferred.resolve({
				'courses': 			courseList.courses,
				'totalCourses':		courseList.total_courses,
				'totalPages': 		Math.ceil(courseList.total_courses / params.limit),
				'pageNum': 			parseInt(params.pageNum, 10),
				'count': 			courseList.count,
				'limit': 			params.limit,
				'user_id': 			params.user_id
			});
		}).error(function(data) {
			deferred.reject(data);
		});

		return deferred.promise;
	};

	this.get = function (params) {
		return $http.get(apiRootLocation+'course/'+params.id);
	};

	this.update = function(params) {
		mixpanel.track('lecturer: update course', {id: params.id, user_id: Authuser.id});
		return $http.post(apiRootLocation+'course/'+params.id+'/update', params.course);
	};

	this.create = function (params) {
		mixpanel.track('lecturer: create course', {user_id: Authuser.id});
		return $http.post(apiRootLocation+'course/create', params.course);
	};

	this.joinMultiple = function (params) {
		mixpanel.track('lecturer: join courses', {ids: params.ids, user_id: Authuser.id});
		return $http.post(apiRootLocation+'user/'+params.userId+'/courses/add', params.ids);
	};

	this.unjoinMultiple = function (params) {
		mixpanel.track('lecturer: unjoin courses', {ids: params.ids, user_id: Authuser.id});
		return $http.post(apiRootLocation+'user/'+params.userId+'/courses/remove', params.ids);
	};
}]);

module.factory('CourseService', ['$cacheFactory', '$q', 'CourseModel', 'NotificationsService', function($cacheFactory, $q, CourseModel, NotificationsService){
	var emptyId = 'empty',
		extend = angular.extend,
		isUndefined = angular.isUndefined,
		isDefined = angular.isDefined,
		coursePageCache = $cacheFactory.get('coursePageCache') || $cacheFactory('coursePageCache', {'capacity': 20}),
		courseCache = $cacheFactory.get('courseCache') || $cacheFactory('courseCache', {'capacity': 20}),
		calcHash = function(params) {
			return 'a:' + params.user_id + 'b:' + params.pageNum + 'c:' + params.limit;
		},
		updateWithReload = function(loadMessage, successMessage, errorMessage, currentPage, functionToCall, functionToLoad) {
			var deferred = $q.defer(),
				showError = function() {
					NotificationsService.push({
						title: 'Error!',
						message: errorMessage,
						type: 'error'
					});
				};

			if (currentPage) {
				var selectedCourses = currentPage.courses.filter(function(course) { return course.selected; });

				if (selectedCourses.length > 0) {
					NotificationsService.push({
						title: 'Loading...',
						message: loadMessage,
						type: 'alert'
					});

					var ids = selectedCourses.map(function(course) { return course.id; });

					functionToCall({'ids': ids}).then(function() {
						functionToLoad(currentPage).then(function(coursePage) {
							NotificationsService.push({
								title: 'Success!',
								message: successMessage,
								type: 'success'
							});
							
							extend(currentPage, coursePage);
							deferred.resolve(currentPage);
						}, function() {
							showError();
							deferred.reject(reason);
						});
					}, function(reason) {
						showError();
						deferred.reject(reason);
					});
				}
			} else {
				deferred.reject();
			}

			return deferred.promise;
		},
		CourseService;

	CourseService = {
		getCoursePage: function(params) {
			params.limit = (!angular.isUndefined(params.limit) && null !== params.limit) ? params.limit : 20;
			params.pageNum = (!angular.isUndefined(params.pageNum) && null !== params.pageNum) ? parseInt(params.pageNum, 10) : 1;

			var hash = calcHash(params),
				cache = coursePageCache.get(hash) || {},
				notification = {
					title: 'Loading...',
					message: '',
					type: 'alert'
				};

			NotificationsService.push(notification);

			CourseModel.list(params).then(function(coursePage) {
				coursePageCache.put(hash, coursePage);
				extend(cache, coursePage);
				notification.remove();
			});

			return cache;
		},

		unjoinSelected: function(currentPage, userId) {
			var loadMessage = 'Removing selected courses from your account.',
				successMessage = 'Selected courses removed.',
				errorMessage = 'Sorry, there has been an error, please try again.',
				functionToCall = function(params) {
					extend(params, {'userId': userId});
					return CourseModel.unjoinMultiple(params);
				},
				functionToLoad = CourseModel.list;

			return updateWithReload(loadMessage, successMessage, errorMessage, currentPage, functionToCall, functionToLoad);
		},

		joinSelected: function(currentPage, userId) {
			var loadMessage = 'Adding selected courses to your account.',
				successMessage = 'Selected courses added.',
				errorMessage = 'Sorry, there has been an error, please try again.',
				functionToCall = function(params) {
					extend(params, {'userId': userId});
					return CourseModel.joinMultiple(params);
				},
				functionToLoad = CourseModel.list;

			return updateWithReload(loadMessage, successMessage, errorMessage, currentPage, functionToCall, functionToLoad);
		},

		getCourse: function(id) {
			if(isUndefined(id) || null === id) {
				id = emptyId;
			} else {
				id = parseInt(id, 10);
			}

			var blankCourse = {
					id: null
				},
				cache = courseCache.get(id) || blankCourse;

			if(id === emptyId) {
				courseCache.put(id, cache);
			} else {
				CourseModel.get({'id': id}).success(function(course) {
					courseCache.put(id, course);
					extend(cache, course);
				});
			}

			return cache;
		},

		saveCourse: function(inputCourse, options) {
			var deferred = $q.defer();

			NotificationsService.push({
				title: 'Loading...',
				message: 'Saving course.',
				type: 'alert'
			});
			
			if(null === inputCourse.id || isUndefined(inputCourse.id)) { // Creating question
				CourseModel.create({'course': inputCourse}).then(function(response) {
					var course = response.data;

					courseCache.remove(emptyId); // remove the entry for the blank question in the cache
					courseCache.put(parseInt(course.id, 10), course);

					if(isDefined(options.userId)) { // Join question as well
						CourseModel.joinMultiple({'userId': options.userId, 'ids': [course.id]}).then(function() {
							NotificationsService.push({
								title: 'Success!',
								message: 'Course successfully <strong>created</strong> and <strong>added</strong> to your account.',
								type: 'success'
							});

							deferred.resolve(courseCache.get(parseInt(course.id, 10)));
						}, function(reason) {
							deferred.reject(reason);
						});
					} else { // Just creat the question
						NotificationsService.push({
							title: 'Success!',
							message: 'Course successfully <strong>created</strong>.',
							type: 'success'
						});

						deferred.resolve(courseCache.get(parseInt(course.id, 10)));
					}
				}, function(reason) {
					deferred.reject(reason);
				});
			} else { // Editing question
				CourseModel.update({
					'id': inputCourse.id,
					'course': inputCourse
				}).then(function(response) {
					var course = response.data;

					courseCache.put(parseInt(course.id, 10), course);

					NotificationsService.push({
						title: 'Success!',
						message: 'Course successfully <strong>updated</strong>.',
						type: 'success'
					});

					deferred.resolve(courseCache.get(parseInt(course.id, 10)));
				}, function(reason) {
					deferred.reject(reason);
				});
			}

			return deferred.promise;
		}
	}

	return CourseService;
}]);