/**
 * SCORM 1.2 LMS RTE (Run-Time Environment) shim.
 *
 * Loaded in the TOP window (see index.html <head>), never inside the SCORM
 * content iframe itself. Per the SCORM 1.2 API-discovery algorithm, content
 * running in the iframe walks up window.parent looking for a `.API` object —
 * it finds this one. All LMSXxx methods return STRINGS ('true'/'false' or an
 * error-code string), never booleans, per spec.
 *
 * Security note: this file deliberately does NOT hold or expose any auth
 * token on `window`. Because the SCORM iframe is same-origin (content is
 * served from /media/ on our own domain) with allow-same-origin set, any
 * value placed on this window is readable by the SCORM package's own script
 * content. LMSCommit/LMSFinish instead dispatch a DOM CustomEvent that the
 * React app (SCORMPlayerPage.tsx) listens for and performs the actual
 * authenticated POST from its own module scope, using the app's existing
 * axios instance — the token never leaves that scope.
 */
(function () {
  var session = { assignmentId: null, scormModuleId: null };
  var initialized = false;
  var lastError = "0";

  var cmi = {
    core: {
      lesson_status: "not attempted",
      score: { raw: "", min: "", max: "" },
      session_time: "00:00:00",
      exit: "",
    },
    suspend_data: "",
  };

  var ERROR_STRINGS = {
    "0": "No error",
    "101": "General exception",
    "201": "Invalid argument error",
    "301": "Not initialized",
    "401": "Not implemented error",
  };

  function getByPath(obj, path) {
    var parts = path.split(".");
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null || typeof cur !== "object") return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function setByPath(obj, path, value) {
    var parts = path.split(".");
    var cur = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      var key = parts[i];
      if (cur[key] == null || typeof cur[key] !== "object") cur[key] = {};
      cur = cur[key];
    }
    cur[parts[parts.length - 1]] = value;
  }

  // completion_status choices on the backend: passed|failed|incomplete|not_attempted
  function mapLessonStatus(status) {
    switch (status) {
      case "passed":
        return "passed";
      case "failed":
        return "failed";
      case "completed":
        return "passed";
      case "incomplete":
        return "incomplete";
      case "browsed":
      case "not attempted":
      default:
        return "not_attempted";
    }
  }

  function dispatchCommit() {
    var scoreRaw = cmi.core.score.raw;
    var payload = {
      scorm_module: session.scormModuleId,
      assignment: session.assignmentId,
      score: scoreRaw !== "" && !isNaN(parseFloat(scoreRaw)) ? parseFloat(scoreRaw) : null,
      completion_status: mapLessonStatus(cmi.core.lesson_status),
      raw_data: JSON.parse(JSON.stringify(cmi)),
    };
    window.dispatchEvent(new CustomEvent("scorm:commit", { detail: payload }));
  }

  window.initSCORMSession = function (assignmentId, scormModuleId) {
    session.assignmentId = assignmentId;
    session.scormModuleId = scormModuleId;
  };

  window.API = {
    LMSInitialize: function () {
      initialized = true;
      lastError = "0";
      return "true";
    },
    LMSFinish: function () {
      if (!initialized) {
        lastError = "301";
        return "false";
      }
      dispatchCommit();
      initialized = false;
      lastError = "0";
      return "true";
    },
    LMSGetValue: function (element) {
      if (!initialized) {
        lastError = "301";
        return "";
      }
      var value = getByPath(cmi, element);
      lastError = "0";
      return value === undefined || value === null ? "" : String(value);
    },
    LMSSetValue: function (element, value) {
      if (!initialized) {
        lastError = "301";
        return "false";
      }
      setByPath(cmi, element, value);
      lastError = "0";
      return "true";
    },
    LMSCommit: function () {
      if (!initialized) {
        lastError = "301";
        return "false";
      }
      dispatchCommit();
      lastError = "0";
      return "true";
    },
    LMSGetLastError: function () {
      return lastError;
    },
    LMSGetErrorString: function (code) {
      return ERROR_STRINGS[code] || "Unknown error";
    },
    LMSGetDiagnostic: function (code) {
      return "SCORM 1.2 shim — code " + code;
    },
  };
})();
