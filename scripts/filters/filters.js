'use strict';

var app = angular.module('qcFrontendApp');

app.filter('numToLetter', [function () {
	return function (number) {
		return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(number);
	};
}])
.filter('truncate', [function () {
	return function (text, length, end, apply) {
		if(apply !== false) {
			if (isNaN(length)) {
					length = 10;
			}

			if (end === undefined) {
				end = "...";
			}

			if (text.length <= length || text.length - end.length <= length) {
				return text;
			} else {
				return String(text).substring(0, length-end.length) + end;
			}
		} else {
			return text;
		}
	};
}]);