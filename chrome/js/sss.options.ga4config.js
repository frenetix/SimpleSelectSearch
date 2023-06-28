// window.dataLayer = window.dataLayer || [];
// function gtag() { dataLayer.push(arguments); }
// gtag('js', new Date());

// gtag('config', 'G-T03678Q4HK');


const GA_ENDPOINT = "https://www.google-analytics.com/mp/collect";
const MEASUREMENT_ID = `G-T03678Q4HK`;
const API_SECRET = `01WmHl46QECjIBiKPmRqNg`;
const DEFAULT_ENGAGEMENT_TIME_IN_MSEC = 100;
const SESSION_EXPIRATION_IN_MIN = 30;

// Keeps track of sessionID

function getOrCreateSessionId() {
    // Store session in memory storage
    let {sessionData} = {}

    try {
        sessionData  = JSON.parse(localStorage['sessionData'])
    }
    catch {
        // console.log("it ididnt work")
    }
    // console.log("sessionData", sessionData)
    // Check if session exists and is still valid
    const currentTimeInMs = Date.now();
    if (sessionData && sessionData.timestamp) {
        // Calculate how long ago the session was last updated
        const durationInMin = (currentTimeInMs - sessionData.timestamp) / 60000;
        // Check if last update lays past the session expiration threshold
        if (durationInMin > SESSION_EXPIRATION_IN_MIN) {
            // Delete old session id to start a new session
            sessionData = null;
            // console.log("expiring session");
        } else {
            // Update timestamp to keep session alive
            sessionData.timestamp = currentTimeInMs;
            localStorage['sessionData'] = JSON.stringify(sessionData);
            // console.log("keeping session alive");
        }
    }
    if (!sessionData) {
        // Create and store a new session
        sessionData = {
            session_id: currentTimeInMs.toString(),
            timestamp: currentTimeInMs.toString(),
        };
        localStorage['sessionData'] = JSON.stringify(sessionData);
        // console.log("creating a new session");
    }
    return sessionData.session_id;
}

// Creates new ID
function newAnalyticsClientID() {
    const newID = self.crypto.randomUUID();
    localStorage['analytics_client_id'] = newID;
    return newID;
}

const analytics_client_id = localStorage['analytics_client_id'] || newAnalyticsClientID();


window.addEventListener("load", () => {
    fetch(
        `${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
    {
      method: "POST",
      body: JSON.stringify({
        client_id: analytics_client_id,
        events: [
          {
            name: "page_view",
            params: {
              session_id: getOrCreateSessionId(),
              engagement_time_msec: DEFAULT_ENGAGEMENT_TIME_IN_MSEC,
              page_title: document.title,
              page_location: document.location.pathname
            },
          },
        ],
      }),
    })
  });