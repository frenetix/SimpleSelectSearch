angular.module('sss').controller('sssCredits', ['$scope', '$http', '$templateCache',
 function ($scope, $http, $templateCache) {

        ///  Credits \\\

        //AJAX call to retrieb GitHub contributors 
        $http({
            method: 'GET',
            url: 'https://api.github.com/repos/frenetix/SimpleSelectSearch/stats/contributors',
            cache: $templateCache
        }).
        success(function (data, status) {
            $scope.status = status;
            $scope.dataGitHub = data;
        }).
        error(function (data, status) {
            $scope.dataGitHub = data || "Request failed";
            $scope.status = status;
        });
     
     // FUTURE: when available, bring this from Crowdin's API: https://api.crowdin.com/api/project/simpleselectsearch/info?key=ab02ea20081020d450697d518d3d7729

        $scope.dataCrowdin = [
            {
                "profile": "teknozem",
                "name": "j eleveld",
                "language": "Dutch"
            },
            {
                "profile": "Smoku",
                "language": "Polish"
            },
            {
                "profile": "emmanuelhoarau",
                "name": "Emmanuel H.",
                "language": "French"
            },
            {
                "profile": "JonLDS",
                "name": "Jonathan Mahoney",
                "language": "Russian"
            },
            {
                "profile": "Jbakers",
                "language": "Dutch"
            },
            {
                "profile": "JPlanas",
                "language": "Catalan"
            },
            {
                "profile": "teknozem",
                "name": "j eleveld",
                "language": "Dutch"
            },

            {
                "profile": "lorispoole",
                "name": "Loris Poole",
                "language": "Italian"
            },
            {
                "profile": "Backspaze",
                "name": "Peter Lövgren",
                "language": "Swedish"
            }
        ];

 }])