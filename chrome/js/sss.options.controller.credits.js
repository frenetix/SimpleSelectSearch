angular.module('sss').controller('sssCredits', ['$scope', '$http', '$templateCache', 
	function($scope, $http, $templateCache) {

	 	///  Credits \\\

	 	//AJAX call to retrieb GitHub contributors 
	 	$http({method: 'GET', url: 'https://api.github.com/repos/frenetix/SimpleSelectSearch/stats/contributors', cache: $templateCache}).
	 	success(function(data, status) {
	 		$scope.status = status;
	 		$scope.dataGitHub = data;
	 	}).
	 	error(function(data, status) {
	 		$scope.dataGitHub = data || "Request failed";
	 		$scope.status = status;
	 	});
	}])
