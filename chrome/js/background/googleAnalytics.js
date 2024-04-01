// Starts code for Google Anlytics Meassurement protocol
const MEASUREMENT_ID = `G-T03678Q4HK`;
const API_SECRET = `01WmHl46QECjIBiKPmRqNg`;
const DEFAULT_ENGAGEMENT_TIME_IN_MSEC = 100;
const SESSION_EXPIRATION_IN_MIN = 30;

/**
 * Keeps track of sessionID
 *
 * This function retrieves or creates a session ID for tracking purposes. It checks if a session ID already exists and if it is still valid based on a session expiration threshold. If the session ID is valid, it updates the timestamp to keep the session alive. If the session ID is expired or doesn't exist, it creates a new session ID and stores it in the local storage.
 *
 * @returns {string} The session ID
 */
function getOrCreateSessionId() {
  // Store session in memory storage
  let { sessionData } = {};

  try {
    sessionData = JSON.parse(localStorage["sessionData"]);
  } catch {
    console.log("Failed to parse session data");
  }

  // Check if session exists and is still valid
  const currentTimeInMs = Date.now();
  if (sessionData && sessionData.timestamp) {
    // Calculate how long ago the session was last updated
    const durationInMin = (currentTimeInMs - sessionData.timestamp) / 60000;
    // Check if last update lays past the session expiration threshold
    if (durationInMin > SESSION_EXPIRATION_IN_MIN) {
      // Delete old session id to start a new session
      sessionData = null;
      console.log("Expiring session");
    } else {
      // Update timestamp to keep session alive
      sessionData.timestamp = currentTimeInMs;
      localStorage["sessionData"] = JSON.stringify(sessionData);
      console.log("Keeping session alive");
    }
  }

  if (!sessionData) {
    // Create and store a new session
    sessionData = {
      session_id: currentTimeInMs.toString(),
      timestamp: currentTimeInMs.toString(),
    };
    localStorage["sessionData"] = JSON.stringify(sessionData);
    console.log("Creating a new session");
  }

  return sessionData.session_id;
}

/**
 * Creates a new analytics client ID and stores it in local storage.
 *
 * @returns {string} The newly generated analytics client ID
 */
function newAnalyticsClientID() {
  const newID = self.crypto.randomUUID();
  localStorage["analytics_client_id"] = newID;
  return newID;
}

const analytics_client_id =
  localStorage["analytics_client_id"] || newAnalyticsClientID();

/**
 * Track a custom event using Google Analytics.
 *
 * @param {string} event_name - The name of the event.
 * @param {object} params - Additional parameters for the event.
 */
export function genericTrackingGA(event_name, params) {
  fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
    {
      method: "POST",
      body: JSON.stringify({
        client_id: analytics_client_id,
        events: [
          {
            name: event_name,
            params: {
              session_id: getOrCreateSessionId(),
              engagement_time_msec: DEFAULT_ENGAGEMENT_TIME_IN_MSEC,
              ...params,
            },
          },
        ],
      }),
    }
  );
}
