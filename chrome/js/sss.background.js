const { genericTrackingGA } = require("./background/googleAnalytics.js");

var MENU_OPTIONS_MESSAGE =
  "Hey there! For more than a decade, I've been keeping this extension free and running on pure love for coding. A small token of appreciation (like a coffee!) would surely give this hobbyist developer a nice boost. ☕️🙌💻"; //" (new stuff!)"; // used only once, for options menu, but I get to change it every release so I left it up here.
var CONTEXT = "selection"; // used for context menues

var config = {}; // main stuff here

/**
 * Tracks the Google Analytics event for search menu.
 *
 * @param {number} idSE - The ID of the search engine.
 */
function trackGA(idSE) {
  const params = {
    search_engine_name: config.searchEngines[idSE].name,
    search_engine_url: config.searchEngines[idSE].url,
  };
  genericTrackingGA("search_menu", params);
}

/**
 * Tracks the initialization of the background script.
 */
genericTrackingGA("background_init", {
  start_date: new Date(),
  browser_language: navigator.language || navigator.userLanguage,
});

/**
 * Generates the actual search URL combining the selected text with the search engine config.
 * Fixes issues like special characters in the search string and replaces placeholders with the selected text.
 *
 * @param {number} idSE - The ID of the search engine.
 * @param {object} info - The selected text information.
 * @returns {string} The generated search URL.
 */
function createURL(idSE, info) {
  var selectedText = encodeURIComponent(info.selectionText);
  if (config.searchEngines[idSE].plus) {
    selectedText = selectedText.replace(/%20/g, "+");
  }
  return config.searchEngines[idSE].url
    .replace(/%s/g, selectedText)
    .replace(/%S/g, selectedText);
}

/**
 * Performs a generic search based on the selected text and the search engine configuration.
 *
 * @param {object} info - The selected text information.
 * @param {object} tab - The current tab.
 * @param {number} idSE - The ID of the search engine.
 */
function genericSearch(info, tab, idSE) {
  var urlSE = createURL(idSE, info);
  if (config.searchEngines[idSE].incognito) {
    chrome.windows.create({
      url: urlSE,
      incognito: true,
    });
  } else if (config.newTab) {
    searchOnNewTab(urlSE, tab);
  } else {
    chrome.tabs.update(tab.id, {
      url: urlSE,
    });
  }
  trackGA(idSE);
}

/**
 * Opens the options.html page in a new tab.
 */
function openOptions() {
  chrome.tabs.create({
    url: "options.html",
  });
}

/**
 * Enables or disables the "Open in new tab" feature.
 */
function checkOnNewTab() {
  config.newTab = !config.newTab;
  localStorage["config"] = JSON.stringify(config);
}

/**
 * Opens the search results in a new tab.
 *
 * @param {string} urlSE - The URL of the search results.
 * @param {object} tab - The current tab.
 */
function searchOnNewTab(urlSE, tab) {
  var newTab = {};
  if (tab.id > -1) {
    newTab = {
      url: urlSE,
      openerTabId: tab.id,
    };
  } else {
    newTab = {
      url: urlSE,
    };
  }
  if (config.newTabPosition === "First") {
    newTab.index = 0;
  } else if (config.newTabPosition === "Next") {
    newTab.index = tab.index + 1;
  } else if (config.newTabPosition === "Previous") {
    newTab.index = tab.index;
  }
  newTab.active = config.newTabSelected;
  chrome.tabs.create(newTab);
}

/**
 * Performs a bulk search based on the selected text and the search engine configuration.
 *
 * @param {object} info - The selected text information.
 * @param {object} tab - The current tab.
 * @param {number} group - The group ID.
 */
function bulkSearch(info, tab, group) {
  var urlArray = [];
  for (var i = 0; i < config.searchEngines.length; i++) {
    if (
      typeof group !== "undefined" &&
      group === config.searchEngines[i].group
    ) {
      if (config.searchEverywhereGroupsNewWindow) {
        urlArray.push(createURL(i, info));
      } else {
        searchOnNewTab(createURL(i, info), tab);
      }
      trackGA(i);
    } else if (typeof group === "undefined") {
      if (config.searchEverywhereGroupsNewWindow) {
        urlArray.push(createURL(i, info));
      } else {
        searchOnNewTab(createURL(i, info), tab);
      }
      trackGA(i);
    }
  }
  if (config.searchEverywhereGroupsNewWindow) {
    chrome.windows.create({
      url: urlArray,
    });
  }
}

/**
 * Creates the context menu items for the extension.
 */
function createMenu() {
  chrome.contextMenus.removeAll(); // reset menu
  var SELength = config.searchEngines.length;
  var title = i18n("bg_searchStringOn"); // title for SSS menu

  if (SELength > 1) {
    // checks if there's more than one link, else show on root
    var id = chrome.contextMenus.create({
      title: title,
      contexts: [CONTEXT],
      onclick: (function (idSE) {
        return function (info, tab) {
          genericSearch(info, tab, idSE);
        };
      })(0),
    });

    // Creates menu groups, if there's any
    var nestGroups = config.searchEngines.some(
      (engine) => engine.group && engine.group.trim() !== ""
    );
    var groups = [];

    if (nestGroups) {
      var groups = [
        ...new Set(
          config.searchEngines
            .map((engine) => engine.group && engine.group.trim())
            .filter((group) => group !== "" && group !== undefined)
        ),
      ];
      groups.forEach((group) => {
        var child = chrome.contextMenus.create({
          title: group,
          parentId: id,
          id: group,
          contexts: [CONTEXT],
          onclick: (function (idSE) {
            return function (info, tab) {
              genericSearch(info, tab, idSE);
            };
          })(0),
        });
      });
    }

    for (var i = 0; i < SELength; i++) {
      var child = chrome.contextMenus.create({
        title:
          config.searchEngines[i].name +
          (config.searchEngines[i].incognito ? " (i)" : ""),
        parentId:
          nestGroups && config.searchEngines[i].group
            ? config.searchEngines[i].group
            : id,
        contexts: [CONTEXT],
        onclick: (function (idSE) {
          return function (info, tab) {
            genericSearch(info, tab, idSE);
          };
        })(i),
      });
    }

    // separator
    createMenuSeparator(id, CONTEXT);

    // search everywhere
    if (config.searchEverywhere)
      createMenuChild(i18n("bg_searchEverywhere"), id, bulkSearch);

    // separator
    createMenuSeparator(id, CONTEXT);

    // check new tab
    createMenuChild(i18n("bg_openOnNewTab"), id, checkOnNewTab, config.newTab);

    // options
    var optionsText = i18n("bg_options");
    if (newOptionsSeen != currVersion) optionsText += MENU_OPTIONS_MESSAGE;

    createMenuChild(optionsText, id, openOptions);

    // group search everywhere
    if (config.searchEverywhereGroups) {
      for (var i = 0; i < groups.length; i++) {
        // separator
        createMenuSeparator(groups[i], CONTEXT);

        // search everywhere
        var id = chrome.contextMenus.create({
          title: i18n("bg_searchEverywhere"),
          parentId: groups[i],
          contexts: [CONTEXT],
          onclick: (function (group) {
            return function (info, tab) {
              bulkSearch(info, tab, group);
            };
          })(groups[i]),
        });
      }
    }
  } else {
    title = title + " ";
    for (var i = 0; i < config.searchEngines.length; i++) {
      var id = chrome.contextMenus.create({
        title: title + config.searchEngines[i].name,
        contexts: [CONTEXT],
        onclick: (function (idSE) {
          return function (info, tab) {
            genericSearch(info, tab, idSE);
          };
        })(i),
      });
    }
  }
}

/**
 * Creates a separator menu item for the context menu.
 *
 * @param {number} id - The ID of the parent menu item.
 * @param {string} context - The context for the menu item.
 */
function createMenuSeparator(id, context) {
  chrome.contextMenus.create({
    type: "separator",
    parentId: id,
    contexts: [context],
  });
}

/**
 * Creates a child menu item for the context menu.
 *
 * @param {string} title - The title of the menu item.
 * @param {number} id - The ID of the parent menu item.
 * @param {function} onclick - The function to be called when the menu item is clicked.
 * @param {boolean} checked - The initial checked state of the menu item (optional).
 */
function createMenuChild(title, id, onclick, checked) {
  if (typeof checked === "undefined") {
    var id = chrome.contextMenus.create({
      title: title,
      parentId: id,
      contexts: [CONTEXT],
      onclick: onclick,
    });
  } else {
    var id = chrome.contextMenus.create({
      title: title,
      parentId: id,
      type: "checkbox",
      checked: checked,
      contexts: [CONTEXT],
      onclick: onclick,
    });
  }
}

/**
 * Retrieves the localized message for the given key using the Chrome i18n API.
 *
 * @param {string} key - The key of the message.
 * @returns {string} The localized message.
 */
function i18n(key) {
  return chrome.i18n.getMessage(key);
}

/**
 * Retrieves the version of the extension.
 *
 * @returns {string} The version number.
 */
function getVersion() {
  var details = chrome.app.getDetails();
  return details.version;
}

// Check if the version has changed.
var currVersion = getVersion();
var prevVersion = localStorage["version"];
var newOptionsSeen = localStorage["newOptionsSeen"];

if (currVersion != prevVersion) {
  localStorage["version"] = currVersion;
  if (prevVersion != "0.7.2") openOptions(); // DON'T SHOW IF COMING FROM 0.7.2
  const config = JSON.parse(localStorage["config"]);
  const searchEnginesConfig = config.searchEngines.reduce(
    (acc, val) => {
      acc.incognito = +val.incognito;
      acc.total++;
      if (val.group) {
        acc.group++;
      }
      return acc;
    },
    {
      incognito: 0,
      group: 0,
      total: 0,
    }
  );

  const trackConfig = {
    ...config,
    searchEngines: searchEnginesConfig,
  };

  // _gaq.push(['_trackEvent', 'Config', 'Config', JSON.stringify(trackConfig)]); OLD
  // gtag('event', 'Config', {
  //     'Config': JSON.stringify(trackConfig)
  // });
  genericTrackingGA("config", { Config: JSON.stringify(trackConfig) });
}

if (typeof localStorage["config"] == "undefined") {
  openOptions();
} else {
  config = JSON.parse(localStorage["config"]);

  createMenu(); // Initialize menu
}

/**
 * Checks if all search engine groups are empty.
 *
 * @returns {boolean} True if all search engine groups are empty, false otherwise.
 */
function allEmptyGroups() {
  return config.searchEngines.every((engine) => engine.group === "none");
}
