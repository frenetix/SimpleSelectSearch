angular.module('sss').directive('i18nContent', function($compile) {
	return {
		restrict: 'A',
		controller: function ($scope) {
			var substitutes = [];
			this.addSubstitute = function (index, content) {
				substitutes[index] = content;
			}
			this.getSubstitutes = function () {
				return substitutes;
			}
		},
		link: function (scope, element, attr, controller) {
			var message = chrome.i18n.getMessage(attr.i18nContent, controller.getSubstitutes());
			element.html(message || '');
			$compile(element.contents())(scope);
		}
	};
})