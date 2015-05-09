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

/*.directive('i18nSubstitute', function() {
	return {
		restrict: 'M',
		require: '^i18nContent',
		link: function (scope, element, attr, i18nContent) {
			var match = attr.i18nSubstitute.match(/^\$([1-9]):(.*)$/);
			if (match) {
				i18nContent.addSubstitute(parseInt(match[1]) - 1, match[2]);
			}
		}
	};
})*/