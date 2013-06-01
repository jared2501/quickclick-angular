//~ Authentication service

var module = angular.module('service.semester', ['qc-config']);

module.service('SemesterModel', ['$q', '$http', 'apiConfig', function($q, $http, apiConfig){
	var apiRootLocation = apiConfig.rootLocation;

	this.list = function(params) {
		var deferred = $q.defer(),
			queryArr = [];

		queryArr.push('limit=' + params.limit);
		queryArr.push('offset=' + (parseInt(params.pageNum, 10) - 1) * params.limit);

		$http.get(apiRootLocation + 'semester?' + queryArr.join('&')).success(function(semesterList) {
			deferred.resolve({
				'semesters': 		semesterList.semesters,
				'totalSemesters':	semesterList.total_semesters,
				'totalPages': 		Math.ceil(semesterList.total_semesters / params.limit),
				'pageNum': 			parseInt(params.pageNum, 10),
				'count': 			semesterList.count,
				'limit': 			params.limit
			});
		}).error(function(data) {
			deferred.reject(data);
		});

		return deferred.promise;
	};

	this.get = function (params) {
		return $http.get(apiRootLocation+'semester/'+params.id);
	};
}]);

module.factory('SemesterService', ['$cacheFactory', 'SemesterModel', 'NotificationsService', function($cacheFactory, SemesterModel, NotificationsService){
	var extend = angular.extend,
		semesterCache = $cacheFactory.get('semesterCache') || $cacheFactory('semesterCache', {'capacity': 20}),
		semesterPageCache = $cacheFactory.get('semesterPageCache') || $cacheFactory('semesterPageCache', {'capacity': 20}),
		calcHash = function(params) {
			return 'a:' + params.pageNum + 'b:' + params.limit;
		},
		SemesterService;

	SemesterService = {
		getSemesterPage: function(params) {
			params.limit = (!angular.isUndefined(params.limit) && null !== params.limit) ? params.limit : 20;
			params.pageNum = (!angular.isUndefined(params.pageNum) && null !== params.pageNum) ? parseInt(params.pageNum, 10) : 1;

			var hash = calcHash(params),
				cache = semesterPageCache.get(hash) || {},
				notification = {
					title: 'Loading...',
					message: '',
					type: 'alert'
				};

			NotificationsService.push(notification);

			SemesterModel.list(params).then(function(semesterPage) {
				semesterPageCache.put(hash, semesterPage);
				extend(cache, semesterPage);
				notification.remove();
			});

			return cache;
		},

		getSemester: function(id) {
			var cache = semesterCache.get(id) || {};

			SemesterModel.get({'id': id}).success(function(semester) {
				semesterCache.put(id, semester);
				extend(cache, semester);
			});

			return cache;
		}
	}

	return SemesterService;
}]);