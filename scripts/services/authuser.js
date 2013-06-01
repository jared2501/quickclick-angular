//~ Authentication service

var app = angular.module('model.authuser', ['qc-config'], ['$httpProvider', function($httpProvider) {
	$httpProvider.responseInterceptors.push(['$q', '$window', '$location', 'apiConfig', function($q, $window, $location, apiConfig) {
		return function ( promise ) {
			var deferred = $q.defer();

			promise.then(function(response) {
				deferred.resolve(response);
			}, function(reason) {
				// If reason is because we are unauthorized..
				if(reason.status === 401) {
					$window.location = apiConfig.loginLocation + '#' + $location.path();
				}
				deferred.reject(reason);
			});

			return deferred.promise;
		}
	}]);
}]);

app.factory('Authuser', ['authUserConfig', function(authUserConfig){
	var User = authUserConfig;

	return User;
}]);