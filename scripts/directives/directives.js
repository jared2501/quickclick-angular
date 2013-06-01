'use strict';

var app = angular.module('qcFrontendApp');

app.directive('divCheckbox', ['$timeout', function($timeout) {
	// This directive only increments/decrements the selectedCount so this has the potential to get out of wack
	return {
		scope: {
			object: '=divCheckbox',
			selectedObjects: '='
		},
		link: function(scope, element, attrs) {
			if(scope.object) {
				// set initial select state if not done
				if(angular.isUndefined(scope.object.selected)) {
					scope.object.selected = false;
				} else {
					if(scope.object.selected) {
						element.addClass('checkbox-selected');
					}
				}

				// change object selected state
				element.bind('click', function() {
					scope.$apply(function() {
						scope.object.selected = !scope.object.selected;
					});
				});

				var updatedSelectedObjects = function() {
					var index = scope.selectedObjects.indexOf(scope.object);
					do {
						if(index > -1) {
							scope.selectedObjects.splice(index, 1);
						}

						index = scope.selectedObjects.indexOf(scope.object);
					} while (index > 0)

					if(scope.object.selected) {
						scope.selectedObjects.push(scope.object);
					}
				}

				scope.$watch('object.selected', function() {
					if(scope.object.selected) {
						element.addClass('checkbox-selected');
						
					} else {
						element.removeClass('checkbox-selected');
					}

					$timeout(updatedSelectedObjects);
				});
			}
		}
	};
}])
.directive('divCheckboxAll', ['$timeout', function($timeout) {
	return {
		scope: {
			totalObjects: '=',
			selectedObjects: '='
		},
		link: function(scope, element, attrs) {
			scope.$watch('totalObjects.length', function(totalObjectsLength) {
				if(totalObjectsLength) {
					var selectedObjectsLength = scope.selectedObjects.length;

					if(totalObjectsLength !== selectedObjectsLength) {
						element.removeClass('checkbox-selected');
					} else if (totalObjectsLength === selectedObjectsLength) {
						element.addClass('checkbox-selected');
					}
				}
			});

			var deregWatch,
				applyWatch = function() {
				deregWatch = scope.$watch('selectedObjects.length', function(selectedObjectsLength) {
					if(0 === selectedObjectsLength) {
						element.removeClass('checkbox-selected');
					} else if(selectedObjectsLength) {
						var totalObjectsLength = scope.totalObjects.length;

						if(totalObjectsLength !== selectedObjectsLength) {
							element.removeClass('checkbox-selected');
						} else if (totalObjectsLength === selectedObjectsLength) {
							element.addClass('checkbox-selected');
						}
					}
				});
			};

			applyWatch();

			element.bind('click', function() {
				var select = !element.hasClass('checkbox-selected');

				deregWatch();

				scope.$apply(function() {
					scope.totalObjects.each(function(object) { object.selected = select; });
				});

				if(select) {
					element.addClass('checkbox-selected');
				} else {
					element.removeClass('checkbox-selected');
				}

				$timeout(function() {
					applyWatch();
				});
			});
		}
	};
}])
.directive('truncate', [function() {
	return {
		scope: {
			text: '@truncate'
		},
		replace: true,
		template: '<span>{{innerText}}<span ng-show="innerText.length > length-1">{{dotdotdot}} <a href="" ng-click="changeMoreLess()">&#40;{{moreLess}}&#41;</a></span></span>',
		link: function(scope, element, attrs) {
			var more = false;
			scope.length = attrs.truncateLength;

			if(typeof attrs.truncateLength === 'undefined') {
				scope.length = 100;
			}

			var truncate = function(val){
				val = $('<div>'+val+'</div>').text(); // get rid of html tags
				
				if(more) {
					return val;
				} else {
					return val.substring(0, scope.length);
				}
			}
			
			scope.moreLess = 'more';
			scope.dotdotdot = '...';
			scope.changeMoreLess = function(){
				more = !more;
				if(more) {
					scope.moreLess = 'less';
					scope.dotdotdot = ''
				} else {
					scope.moreLess = 'more';
					scope.dotdotdot = '...';
				}

				scope.innerText = $('<div>' + truncate(scope.text) + '</div>').text();
			}

			scope.$watch('text', function(newVal) {
				scope.innerText = $('<div>' + truncate(newVal) + '</div>').text();
			});
		}
	};
}])
.directive('placeholder', ['$timeout', function($timeout) {
	jQuery.support.placeholder = (function(){
		var i = document.createElement('input');
		return 'placeholder' in i;
	})();

	if (jQuery.support.placeholder) {
		return {};
	}

	return {
		link: function(scope, elm, attrs){
		if (attrs.type === 'password') {
			return;
		}
		$timeout(function(){
			elm.val(attrs.placeholder).focus(function() {
				if ($(this).val() == $(this).attr('placeholder')) {
					$(this).val('');
				}
			}).blur(function() {
				if ($(this).val() == '') {
					$(this).val($(this).attr('placeholder'));
				}
			});
		});
		}
	}
}])
.directive('resultsBar', [function() {
	return {
		scope: {
			count: '=',
			totalCount: '=',
			isCorrect: '=',
			showAnswers: '='
		},
		template: '<div class="progress" ng-class="{\'progress-success\': isCorrect && showAnswers}"> <strong class="responses">{{count}} Responses / {{percent.toFixed()}}%</strong><div class="bar" ng-style="style"></div> </div>',
		replace: true,
		link: function($scope, element, attr) {
			$scope.$watch('count', function(newCount){
				if($scope.totalCount < 1) {
					$scope.percent = 0;
					$scope.style = {'width': '0%'};
				} else {
					$scope.percent = ($scope.count/$scope.totalCount) * 100;
					$scope.style = {'width': ''+$scope.percent+'%'};
				}
			});
		}
	};
}])
.directive("wysiwyg", ['$timeout', 'apiConfig', function($timeout, apiConfig) {
	var apiRootLocation = apiConfig.rootLocation;

	var linkFn = function (scope, el, attr, ngModel) {
		// TODO: Add user preferences and save this in Authuser and database
		scope.redactor = el.redactor({
			'plugins': ['latex'],
			'focus': false,
			'shortcuts': false,
			'execCommandCallback': function() { // When things like style changed or font updated
				ngModel.$setViewValue(scope.redactor.getCode());
			},
			'keyupCallback': function() { // When user types stuff
				ngModel.$setViewValue(scope.redactor.getCode());
			},
			'callback': function (o) {
				ngModel.$render = function() {
					if(!!ngModel.$viewValue) {
						o.setCode(ngModel.$viewValue);
					}
				};

				// Hack, since the code is set above using o.setCode after redactor is loaded, and
				// redactor doesnt call oberveImages to make images editable. (bug of redactor i think?)
				$timeout(function(){
					o.observeImages();
				}, 50);

				// Not the best solution, but cant find any redactor call backs to watch for things like
				// when the user resizes or deletes an image, etc. So this method piggy backs of the method that
				// redactor uses to syncronize the code
				var oldSyncCode = o.syncCode;
				var newSyncCode = function(){
					ngModel.$setViewValue(scope.redactor.getCode());
					return oldSyncCode.call(this);
				};
				o.syncCode = newSyncCode;
			},
			'observeImages': true,
			imageUpload: apiRootLocation + 'upload/image'
		});

		scope.$on('$destroy', function() {
			el.destroyEditor();
		});
	}
	return {
		require: '?ngModel',
		link: linkFn,
		restrict: 'A'
	};
}])
.directive('termModal', ['$location', 'CourseService', 'SemesterService', 'Authuser', function($location, CourseService, SemesterService, Authuser) {
	return {
		transclude: true,
		restrict: 'E',
		templateUrl: 'scripts/directives/templates/termModal.html',
		scope: {
			'options': '=',
			'course': '=',
			'semester': '='
		},
		link: function(scope, el, attr) {
			if(!scope.options) {
				scope.options = {}
			}

			scope.termModalShouldBeOpen = false;

			scope.termModalClose = function () {
				scope.termModalShouldBeOpen = false;
			};
			scope.termModalOpen = function() {
				scope.coursePage = CourseService.getCoursePage({'user_id': Authuser.id, 'limit': 1000});
				scope.semesterPage = SemesterService.getSemesterPage({'limit': 1000});

				scope.$watch('coursePage.courses', function(courses) {
					if(courses) {
						scope.selectedCourse = courses.find(function(c) { return c.id === scope.course.id; });
					}
				});
				
				scope.$watch('semesterPage.semesters', function(semesters) {
					if(semesters) {
						scope.selectedSemester = semesters.find(function(s) { return s.id === scope.semester.id; });
					}
				});

				scope.termModalShouldBeOpen = true;
			}
			scope.termModalGo = function() {
				scope.termModalShouldBeOpen = false;
				$location.path('/' + scope.selectedCourse.id + '/' + scope.selectedSemester.id + '/questions/list');
			}

		}
	};
}])
.directive('addTags', [function(){
	return {
		replace: true,
		template: '<span><a href="" ng-show="!showState">&#40;add&#41;</a> <input ng-show="showState" ng-model="newTagName" style="width: 80px;" placeholder="enter tag"></input></span>',
		scope: {
			'object': '=addTags'
		},
		link: function($scope, elem, attrs) {
			$scope.showState = false;
			$scope.newTagName = '';

			var add = elem.children('a'),
				input = elem.children('input'),
				showInput = function() {
					$scope.$apply(function(){
						$scope.showState = true;
					});

					input.focus();
				},
				addTag = function() {
					// Check if weve hidden the input, this is here for debounce
					if($scope.showState) {
						var val = input.val(),
							tags = val.split(',').map(function(s) { return s.compact(); }).exclude(function(t) {
								return t == '';
							});
						
						input.val('');

						if(angular.isUndefined($scope.object.tags)) {
							$scope.object.tags = [];
						}
						
						if(tags.length > 0) {
							$scope.object.addTags(tags);
						}
					}
					

					$scope.$apply(function(){
						$scope.showState = false;
					});
				};

			add.bind('click', showInput);
			input.bind('blur', addTag);
			input.bind('keypress', function(e){
				if (e.which == 13) {
					addTag();
				}
			})
		}
	};
}])
.directive('tag', ['$parse', function($parse) {
	return {
		replace: true,
		transclude: true,
		template: '<span><span class="trasncludedContent" ng-transclude></span> <a ng-click="removeTag()" href="" style="color: white;">&times;</a></span>',
		link: function($scope, elem, attrs) {
			$scope.removeTag = function() {
				var tag = elem.children('.trasncludedContent').text();
				$scope[attrs.tag].removeTags([tag])
			}
		}
	}
}]);