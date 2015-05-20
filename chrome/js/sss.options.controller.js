angular.module('sss').controller('sssData', ['$scope', '$sce', 'sssService',
 function ($scope, $sce, sssService) {

        $scope.localConfig = sssService.bg.config; // JSON: User's config. Core.
        $scope.featuredURLs = sssService.featuredSearchEngines; // List of featured URLs.
        $scope.currentVersion = "Version: " + sssService.bg.currVersion; // String of current version displayed in SideNav. ToDo:refactor name in bg
        $scope.editRow = null; // index used to show INPUT in SearchEngine Table 
        $scope.isDirty = false; // prevents adding multiple null rows
        $scope.backup = null; // used as restore point for import-export.
        $scope.import = localStorage["config"]; //import/export textarea default value
        $scope.loading = false;

        //  Watcher: persists data.
        $scope.$watch('localConfig', function () {
            // FIXME: the following refactors witht the same as importConfig() & undoLastImport()
            localStorage["config"] = JSON.stringify(sssService.bg.config);
            sssService.bg.createMenu();
            $scope.checkIsDirty();
            $scope.import = localStorage["config"];
        }, true);

        /// My Search Engines \\\

        // Function checks if there's any null names in the Search Engines list, and disables adding more Search Engines (isDirty = true)
        $scope.checkIsDirty = function () {
            for (var member in $scope.localConfig.searchEngines) {
                if ($scope.localConfig.searchEngines[member].name == null) {
                    $scope.isDirty = true;
                    return;
                }
            }
            $scope.isDirty = false;
        };

        //  Show/hide delete button
        $scope.hoverIn = function () {
            this.hoverTable = true;
        };
        $scope.hoverOut = function () {
            this.hoverTable = false;
        };

        $scope.safeHTML = function (rawHTML) {
            return $sce.trustAsHtml(rawHTML);
        };

        // Add Search engine to list. 
        // Called both from the + Button and the Featured Search Engines table
        $scope.addSearchEngine = function (featuredOptional) {
            $scope.inserted = {
                name: featuredOptional === undefined ? null : featuredOptional.x.name,
                url: featuredOptional === undefined ? null : featuredOptional.x.url,
                incognito: false
            };
                $scope.localConfig.searchEngines.push($scope.inserted);
                $scope.editRow = $scope.localConfig.searchEngines.length - 1;
                $scope.checkIsDirty();
        };

        // Delete Search engine from list. 
        // NOTE: do I need to show a confirm message?
        $scope.deleteSearchEngine = function (index) {
            sssService.bg.config.searchEngines.splice(index, 1);
            $scope.editRow = null;
        };

        // Sets row to be edited
        $scope.setEdit = function (index) {
            $scope.editRow = index;
        };

        /// Featured Search Engines \\\

        // Sort Feature table code
        $scope.sortType = 'name'; // set the default sort type
        $scope.sortReverse = false; // set the default sort order
        $scope.searchURL = ''; // set the default search/filter term

        $scope.isFeaturedUsed = function () {
            var usedNames = [];
            for (var i = 0; i < $scope.localConfig.length; i++) {
                usedNames.push($scope.localConfig[i].name);
            }

            for (var i = 0; i < $scope.localConfig.length; i++) {
                usedNames.push($scope.localConfig[i].name);
            }


        }


        /// Advanced Featrues \\\

        // Reset default options
        $scope.restoreDefaultOptions = function () {

            sssService.bg._gaq.push(['_trackEvent', 'Options', 'Reset defaults', 'Reset defaults']);

            // ToDo: Try/catch goes here.
            $scope.backup = $scope.localConfig;
            sssService.bg.config = sssService.defaultConfig;

            // FIXME: the following refactors witht the same as $scope.watch and undoLastImport

            localStorage["config"] = JSON.stringify(sssService.bg.config);
            sssService.bg.createMenu();
            $scope.checkIsDirty();
            $scope.localConfig = sssService.bg.config;
            $scope.editRow = null;
            $scope.addAlert("o_resetDefaultSuccess", "success");
            $scope.template = "options/searchEngines.html";
        };

        /// Region: Import & Export \\\

        //Import JSON config
        $scope.importConfig = function () {

            sssService.bg._gaq.push(['_trackEvent', 'Options', 'Import Config', 'Import Config']);

            // ToDo: Try/catch goes here.
            $scope.backup = $scope.localConfig;
            sssService.bg.config = JSON.parse($scope.import);

            // FIXME: the following refactors witht the same as $scope.watch and undoLastImport
            localStorage["config"] = JSON.stringify(sssService.bg.config);
            sssService.bg.createMenu();
            $scope.checkIsDirty();
            $scope.localConfig = sssService.bg.config;
            $scope.editRow = null;
            $scope.addAlert("o_importSuccesfull", "success");
            $scope.template = "options/searchEngines.html";

        };

        //Undo last import 
        $scope.undoLastImport = function () {
            sssService.bg._gaq.push(['_trackEvent', 'Options', 'Undo Import', 'Undo Import']);

            // ToDo: implement Try/Catch here
            sssService.bg.config = $scope.backup;
            $scope.backup = null;
            $scope.addAlert("o_restoreSuccesfull", "success");

            // FIXME: the following refactors witht the same as $scope.watch and importConfig()

            localStorage["config"] = JSON.stringify(sssService.bg.config);
            sssService.bg.createMenu();
            $scope.checkIsDirty();
            $scope.localConfig = sssService.bg.config;
            $scope.editRow = null;
            $scope.template = "options/searchEngines.html";
        };

        /// Endregion \\\

        // Region: ALERTS
        // FUTURE: get this out of here

        $scope.alerts = [];
        $scope.confirms = [];

        $scope.addAlert = function (msg, msgType) {
            if (typeof msgType == "undefined")
                msgType = "danger";
            $scope.alerts.push({
                type: msgType,
                msg: sssService.i18n(msg)
            });
        };

        $scope.closeAlert = function (index) {
            $scope.alerts = [];
        };

        $scope.closeConfirm = function (index) {
            $scope.confirms.splice(index, 1);
        };

        $scope.addConfirm = function (msg, yesAction) {
            $scope.alerts = [];
            $scope.confirms.push({
                msg: sssService.i18n(msg),
                action: yesAction
            });
            $scope.test = "confirm";
        }

        $scope.yesConfirm = function (yesAction, index) {
            $scope.confirms.splice(index, 1);
            yesAction();
        }

        // Endregion
 }])