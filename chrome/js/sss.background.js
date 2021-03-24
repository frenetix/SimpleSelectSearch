var MENU_OPTIONS_MESSAGE = " (new stuff!)"; // used only once, for options menu, but I get to change it every release so I left it up here.
var CONTEXT = "selection"; // used for context menues

var config = {}; // main stuff here

// Region: Google Analytics stuff

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-23660432-1']);
_gaq.push(['_trackPageview']);

(function () {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    //ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'https://www') + '.google-analytics.com/ga.js';
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();

//Tracks google analytics
function trackGA(idSE) {
    if (config.trackGA) {
        _gaq.push(['_trackEvent', 'Search Click', config.searchEngines[idSE].name, config.searchEngines[idSE].url]);
    } else {
        _gaq.push(['_trackEvent', 'Search Click', 'Confidential', 'Confidential']);
    }
}

// Endregion


// function generates the actual search URL combining the selected text with the search engine config
//
// fixes stuff like & in search string
// plus vs %20
// replace %s with search string
function createURL(idSE, info) {
    var selectedText = encodeURIComponent(info.selectionText);
    if (config.searchEngines[idSE].plus)
        selectedText = selectedText.replace(/%20/g, "+");
    return config.searchEngines[idSE].url.replace(/%s/g, selectedText).replace(/%S/g, selectedText);
}

// standard search function
function genericSearch(info, tab, idSE) {
    var urlSE = createURL(idSE, info);
    if (config.searchEngines[idSE].incognito) {
        chrome.windows.create({
            "url": urlSE,
            "incognito": true
        });
    } else if (config.newTab) {
        // FUTURE: for "remember an update my created tabs" feature, here I'll store the ID of the created tab and then reuse it with an update. to store the ID of a created tab use a callback function on the tabs.create thing = function(Tab tab) {...};
        searchOnNewTab(urlSE, tab);
    } else {
        chrome.tabs.update(tab.id, {
            "url": urlSE
        });
    }
    trackGA(idSE);
}

// opens options.html
function openOptions() {
    chrome.tabs.create({
        "url": "options.html"
    });
}

// Enables/disables Open in new tab
function checkOnNewTab() {
    config.newTab = !config.newTab;
    localStorage["config"] = JSON.stringify(config);
    // NOTE: do i need to save the whole object?
}

// Open results in new tab
function searchOnNewTab(urlSE, tab) {
    if (tab.id > -1) {
        var newTab = {
            "url": urlSE,
            openerTabId: tab.id
        }
    } else {
        var newTab = {
            "url": urlSE
        }
    };
    if (config.newTabPosition == "First") {
        newTab.index = 0;
    } else if (config.newTabPosition == "Next") {
        newTab.index = tab.index + 1;
    } else if (config.newTabPosition == "Previous") {
        newTab.index = tab.index;
    }
    newTab.active = config.newTabSelected;
    chrome.tabs.create(newTab);
};

// Search everywhere!
// ToDo: if incognito open in incognito
function bulkSearch(info, tab, group) {
    var i;
    for (i = 0; i < config.searchEngines.length; i++) {
        if (typeof group != "undefined") {
            if (group == config.searchEngines[i].group)
                searchOnNewTab(createURL(i, info), tab);
            trackGA(i);
        } else {
            searchOnNewTab(createURL(i, info), tab);
            trackGA(i);
        }
    }
}

// Create menu items
function createMenu() {
    chrome.contextMenus.removeAll(); // reset menu
    var SELength = config.searchEngines.length;
    var title = i18n("bg_searchStringOn"); // title for SSS menu
    if (SELength > 1) { // checks if there's more than one link, else show on root
        var id = chrome.contextMenus.create({
            "title": title,
            "contexts": [CONTEXT],
            "onclick": function (idSE) {
                return function (info, tab) {
                    genericSearch(info, tab, idSE)
                }
            }(0)
        });
        // Creates menu groups, if there's any
        var nestGroups = !allEmptyGroups(),
            groups = []; // Todo: get rid of groups and use flags only
        if (nestGroups) {
            var flags = [],
                i;
            for (i = 0; i < SELength; i++) {
                if (flags[config.searchEngines[i].group])
                    continue;
                flags[config.searchEngines[i].group] = true;
                if (!isEmptyOrNull(config.searchEngines[i].group)) {
                    groups.push(config.searchEngines[i].group);
                    var child = chrome.contextMenus.create({
                        "title": config.searchEngines[i].group,
                        "parentId": id,
                        "id": config.searchEngines[i].group,
                        "contexts": [CONTEXT],
                        "onclick": function (idSE) {
                            return function (info, tab) {
                                genericSearch(info, tab, idSE)
                            }
                        }(0)
                    });
                }
            }
        }

        for (i = 0; i < SELength; i++) {
            var child = chrome.contextMenus.create({
                "title": config.searchEngines[i].name + ((config.searchEngines[i].incognito) ? " (i)" : ""),
                "parentId": nestGroups && config.searchEngines[i].group ? config.searchEngines[i].group : id,
                "contexts": [CONTEXT],
                "onclick": function (idSE) {
                    return function (info, tab) {
                        genericSearch(info, tab, idSE)
                    }
                }(i)
            });
        }

        // separator
        createMenuSeparator(id, CONTEXT);

        //search everywhere
        if (config.searchEverywhere)
            createMenuChild(i18n("bg_searchEverywhere"), id, bulkSearch);

        // separator
        createMenuSeparator(id, CONTEXT);

        // check new tab
        createMenuChild(i18n("bg_openOnNewTab"), id, checkOnNewTab, config.newTab)

        // options
        var optionsText = i18n("bg_options");
        if (newOptionsSeen != currVersion)
            optionsText += MENU_OPTIONS_MESSAGE;

        createMenuChild(optionsText, id, openOptions);

        // group search everywhere

        if (config.searchEverywhereGroups) {
            for (i = 0; i < groups.length; i++) {
                // separator
                createMenuSeparator(groups[i], CONTEXT);
                //search everywhere
                var id = chrome.contextMenus.create({
                    "title": i18n("bg_searchEverywhere"),
                    "parentId": groups[i],
                    "contexts": [CONTEXT],
                    "onclick": function (group) {
                        return function (info, tab) {
                            bulkSearch(info, tab, group)
                        }
                    }(groups[i])
                });
            }
        }

    } else {
        title = title + " ";
        for (i = 0; i < config.searchEngines.length; i++) {
            var id = chrome.contextMenus.create({
                "title": title + config.searchEngines[i].name,
                "contexts": [CONTEXT],
                "onclick": function (idSE) {
                    return function (info, tab) {
                        genericSearch(info, tab, idSE)
                    }
                }(i)
            });
        }
    }
}

// Menu helpers

function createMenuSeparator(id, context) {
    var id = chrome.contextMenus.create({
        "type": "separator",
        "parentId": id,
        "contexts": [context]
    });
}

function createMenuChild(title, id, onclick, checked) {
    if (typeof checked == "undefined") {
        var id = chrome.contextMenus.create({
            "title": title,
            "parentId": id,
            "contexts": [CONTEXT],
            "onclick": onclick
        });
    } else {
        var id = chrome.contextMenus.create({
            "title": title,
            "parentId": id,
            "type": "checkbox",
            "checked": checked,
            "contexts": [CONTEXT],
            "onclick": onclick
        });
    }
}



function i18n(key) {
    return chrome.i18n.getMessage(key);
}


//open Options if first time or updates happened
function getVersion() {
    var details = chrome.app.getDetails();
    return details.version;
}

// Check if the version has changed.
var currVersion = getVersion();
var prevVersion = localStorage['version'];
var newOptionsSeen = localStorage['newOptionsSeen'];

if (currVersion != prevVersion)
    localStorage['version'] = currVersion;


if (typeof localStorage["config"] == 'undefined') {
    openOptions();
} else {
    config = JSON.parse(localStorage["config"]);

    if (typeof config.searchEverywhere == "undefined") {
        config.searchEverywhere = true; // FUTURE: remove after a while, this is as of 0.4 so users won't loose the SearchEverywhere option
        config.searchEverywhereGroups = true;
    }
    createMenu(); // Initialize menu
}

function allEmptyGroups() {
    for (var i = 0; i < config.searchEngines.length; i++) {
        if (config.searchEngines[i].group !== "none") return false;
    }
    return true;
}

function isEmptyOrNull(val) {
    if (typeof val == "undefined")
        return true;
    if (!val)
        return true;
    if (val.trim() === "")
        return true;
}