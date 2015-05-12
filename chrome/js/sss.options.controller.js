var bg = chrome.extension.getBackgroundPage(); // Background Page object. ToDo: should this be a service?
localStorage['newOptionsSeen'] = bg.currVersion; // this should not be there. This is used to hide the "New stuff!!" from menu

angular.module('sss', ['ngAnimate','ui.sortable','ngSanitize', 'ui.bootstrap']).controller('sssData', ['$scope', '$http', '$templateCache', '$sce',  
	function($scope, $http, $templateCache, $sce) {

		$scope.localConfig = bg.config; // JSON: User's config. Core.
		$scope.featuredURLs = mydata; // List of featured URLs. ToDo: Review scope issues
		$scope.currentVersion = "Version: " + bg.currVersion;  // String of current version displayed in SideNav. ToDo:refactor name in bg
		$scope.editRow = null; // index used to show INPUT in SearchEngine Table 
		$scope.isDirty = false; // prevents adding multiple null rows
		$scope.backup = null; // used as restore point for import-export.
		$scope.import = localStorage["config"]; //import/export textarea default value
		$scope.loading = false;

		//  Watcher: persists data.
		$scope.$watch('localConfig', function() {

			//ToDo: the following refactors witht the same as importConfig() & undoLastImport()

			localStorage["config"] = JSON.stringify(bg.config);
			bg.createMenu ();
			$scope.checkIsDirty();
			$scope.import = localStorage["config"];
		}, true);


	 	/// My Search Engines \\\

	 	// Function checks if there's any null names in the Search Engines list, and disables adding more Search Engines (isDirty = true)
	 	$scope.checkIsDirty = function () {
	 		for (var member in $scope.localConfig.searchEngines) {
	 			if ($scope.localConfig.searchEngines[member].name == null){
	 				$scope.isDirty = true;
	 				return;
	 			}
	 		}
	 		$scope.isDirty = false;
	 	};

        // sometimes we need to translate with javascript
        $scope.i18nTranslate = function (key) {
        	return chrome.i18n.getMessage(key);
        }

		//  Show/hide delete button
		$scope.hoverIn = function(){
			this.hoverTable = true;
		};
		$scope.hoverOut = function(){
			this.hoverTable = false;
		};

		$scope.safeHTML = function(rawHTML) {
			return $sce.trustAsHtml(rawHTML);
		};

		// Add Search engine to list. 
		// Called both from the + Button and the Featured Search Engines table
		$scope.addSearchEngine = function(featuredOptional) {  
			$scope.inserted = {
				name: featuredOptional === undefined ? null : featuredOptional.x.name,
				url: featuredOptional === undefined ? null : featuredOptional.x.url,
				incognito: false
			};
			$scope.localConfig.searchEngines.push($scope.inserted);
			$scope.editRow = $scope.localConfig.searchEngines.length -1;
			$scope.checkIsDirty();
		};

		// Delete Search engine from list. 
		// ToDo: do I need to show a confirm message?
		$scope.deleteSearchEngine = function (index) {
			bg.config.searchEngines.splice(index,1);
			$scope.editRow = null;
		};

		// Sets row to be edited
		$scope.setEdit = function (index) {
			$scope.editRow = index;
		};

		// Highlighs %s & %S for tables
		// ToDo: not working yet. Sanitize? 
		// https://docs.angularjs.org/api/ng/service/$sce
		$scope.highlightURL = function (url) {
			return	url.replace(/%s/g, "<span class='searchString'>%s</span>")
			.replace(/%S/g, "<span class='searchString'>%S</span>");
		};


		/// Featured Search Engines \\\

		// Sort Feature table code
		$scope.sortType     = 'name'; // set the default sort type
	 	$scope.sortReverse  = false;  // set the default sort order
	 	$scope.searchURL   = '';     // set the default search/filter term


		/// Advanced Featrues \\\

	 	// Display "Reset to defaults" alert code. 

	 	// ToDo: Make a generic alert function.
	 	$scope.displayRestorePopup = false;

	 	// Reset default options
	 	$scope.restoreDefaultOptions = function () {
			// ToDo: messages
			
			bg._gaq.push(['_trackEvent', 'Options', 'Reset defaults', 'Reset defaults']);

	 			//ToDo: Try/catch goes here.
	 			$scope.backup = $scope.localConfig;
	 			//bg.config = null;
	 			bg.config = bg.defaultConfig;
	 			//bg.config = bg.applyLocalization(bg.defaultConfig); // ToDo: add local amazon

	 			//ToDo: the following refactors witht the same as $scope.watch and undoLastImport

	 			localStorage["config"] = JSON.stringify(bg.config);
	 			bg.createMenu ();
	 			$scope.checkIsDirty();
	 			$scope.localConfig = bg.config;
	 			$scope.editRow = null; 

	 			$scope.addAlert(chrome.i18n.getMessage("o_resetDefaultSuccess"), "success");

	 			$scope.template = "options/searchEngines.html";

	 		};


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
	 	

	 	/// Import & Export \\\

	 	//Import JSON config
	 	$scope.importConfig = function () {

	 		bg._gaq.push(['_trackEvent', 'Options', 'Import Config', 'Import Config']);

 			//ToDo: Try/catch goes here.
 			$scope.backup = $scope.localConfig;
 			bg.config = JSON.parse($scope.import);
 			//ToDo: the following refactors witht the same as $scope.watch and undoLastImport

 			localStorage["config"] = JSON.stringify(bg.config);
 			bg.createMenu ();
 			$scope.checkIsDirty();
 			$scope.localConfig = bg.config;
 			$scope.editRow = null; 


 			$scope.addAlert(chrome.i18n.getMessage("o_importSuccesfull"), "success");

 			$scope.template = "options/searchEngines.html";

 		};

	 	//Undo last import 
	 	$scope.undoLastImport = function () {
	 		bg._gaq.push(['_trackEvent', 'Options', 'Undo Import', 'Undo Import']);

			//ToDo: implement Try/Catch here
			bg.config = $scope.backup;
			$scope.backup = null;
			$scope.addAlert(chrome.i18n.getMessage("o_restoreSuccesfull"), "success");

			//ToDo: the following refactors witht the same as $scope.watch and importConfig()

			localStorage["config"] = JSON.stringify(bg.config);
			bg.createMenu ();
			$scope.checkIsDirty();
			$scope.localConfig = bg.config;
			$scope.editRow = null; 
			$scope.template = "options/searchEngines.html";
		};

		$scope.alerts = [];
		$scope.confirms = [];

		$scope.addAlert = function(msg, msgType) {
			if (typeof msgType == "undefined")
				msgType = "danger";
			$scope.alerts.push({type: msgType, msg: msg});
		};

		$scope.closeAlert = function(index) {
			$scope.alerts = [];
		};

		$scope.closeConfirm = function(index) {
			$scope.confirms.splice(index, 1);
		};

		$scope.addConfirm = function(msg, yesAction){
			$scope.alerts = [];
			$scope.confirms.push({msg: chrome.i18n.getMessage(msg), action: yesAction});
		}

		$scope.yesConfirm = function(yesAction, index) {
			$scope.confirms.splice(index, 1);
			yesAction();
		}
	}])


	/* example API call for Crowdin... does not retrieve contributors yet... worthless for now.
		$http({method: 'JSONP', url: 'https://api.crowdin.com/api/project/simpleselectsearch/info?callback=JSON_CALLBACK&key=ab02ea20081020d450697d518d3d7729', cache: $templateCache}).
	 	success(function(data, status) {
	 		$scope.status = status;
	 		$scope.dataCrowdin = data;
	 	}).
	 	error(function(data, status) {
	 		$scope.dataCrowdin = data || "Request failed";
	 		$scope.status = status;
	 	});*/
