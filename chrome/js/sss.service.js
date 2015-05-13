angular.module('sss', ['ngAnimate','ui.sortable','ngSanitize', 'ui.bootstrap', 'ui.utils']).service('bgPage', function() {
	//return chrome.extension.getBackgroundPage(); 
	var service = this;

	function applyLocalization(tempConfig) {
		var languageFound = false;
		for (i in service.amazonSites){
			if (window.navigator.language.toLowerCase()==service.amazonSites[i].language) { 
				tempConfig.searchEngines.splice(tempConfig.searchEngines.length,0,JSON.parse('{"name": "'+ service.amazonSites[i].name +'", "url": "'+ service.amazonSites[i].url +'"}'));
				languageFound = true;
			}
		}
		if (!languageFound) {
			tempConfig.searchEngines.splice(tempConfig.searchEngines.length,0,JSON.parse('{"name": "'+ service.amazonSites[0].name +'", "url": "'+ service.amazonSites[0].url +'"}'));
			tempConfig.searchEngines.splice(tempConfig.searchEngines.length,0,JSON.parse('{"name": "'+ service.amazonSites[1].name +'", "url": "'+ service.amazonSites[1].url +'"}'));
		}
		return tempConfig;
	}

	/*	service.init = function..*/
	service.defaultConfig = {
		"newTab":true,
		"newTabSelected":true,
		"newTabPosition":"Last",
		"trackGA":true,
		"searchEngines" : [
		{"name":"Youtube","url":"http://www.youtube.com/results?search_query=%s&aq=f","incognito":false,"plus":false},
		{"name":"IMDB","url":"http://www.imdb.com/find?q=%s&s=all","incognito":false,"plus":true},
		{"name":"Wikipedia","url":"http://en.wikipedia.org/w/index.php?title=Special:Search&search=%s","incognito":false,"plus":false}
		]
	};

	service.amazonSites = [
	{"language":"en-us","name":"Amazon","url":"http://www.amazon.com/gp/search?ie=UTF8&keywords=%s&tag=sisese-20&index=aps&linkCode=ur2&camp=1789&creative=9325","type":"Comerce","language":"English"},
	{"language":"en-us","name":"Amazon Kindle","url":"http://www.amazon.com/gp/search?ie=UTF8&keywords=%s&tag=sisese-20&index=digital-text&linkCode=ur2&camp=1789&creative=9325","type":"Comerce","language":"English"},
	{"language":"de-de","name":"Amazon DE","url":"http://www.amazon.de/gp/search?ie=UTF8&keywords=%s&tag=sisese0b-21&index=aps&linkCode=ur2&camp=1638&creative=6742","type":"Comerce","language":"English"},
	{"language":"es-es","name":"Amazon ES","url":"http://www.amazon.es/gp/search?ie=UTF8&keywords=%s&tag=sisese0c-21&index=aps&linkCode=ur2&camp=3626&creative=24790","type":"Comerce","language":"English"},
	{"language":"it","name":"Amazon IT","url":"http://www.amazon.it/gp/search?ie=UTF8&keywords=%s&tag=sisese07-21&index=aps&linkCode=ur2&camp=3370&creative=23322","type":"Comerce","language":"English"},
	{"language":"en-us","name":"Amazon Mp3","url":"http://www.amazon.com/gp/search?ie=UTF8&keywords=%s&tag=sisese-20&index=digital-music&linkCode=ur2&camp=1789&creative=9325","type":"Comerce","language":"English"},
	{"language":"en-us","name":"Amazon Music","url":"http://www.amazon.com/gp/search?ie=UTF8&keywords=%s&tag=sisese-20&index=music&linkCode=ur2&camp=1789&creative=9325","type":"Comerce","language":"English"},
	{"language":"en-gb","name":"Amazon UK","url":"http://www.amazon.co.uk/gp/search?ie=UTF8&keywords=%s&tag=sisese-21&index=aps&linkCode=ur2&camp=1634&creative=6738","type":"Comerce","language":"English"},
	{"language":"en-ca","name":"Amazon Canada","url":"http://www.amazon.ca/gp/search?ie=UTF8&camp=15121&creative=330641&index=aps&keywords=%s&linkCode=ur2&tag=sisese0b-20","type":"Comerce","language":"English"}
	];

	service.bg = chrome.extension.getBackgroundPage();

	if (typeof localStorage["config"] == "undefined") {
		service.bg.config = applyLocalization(service.defaultConfig);
		localStorage["config"] = JSON.stringify(service.bg.config);
		service.bg.createMenu();
	}

	localStorage['newOptionsSeen'] = service.bg.currVersion; 

	//bg.config = initializeConfig(localStorage["config"], defaultConfig);

})