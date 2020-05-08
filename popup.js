let changeAssistantState = document.getElementById("CSAssistantSwitch");
let refreshState = document.getElementById("AutoRefreshSwitch");

chrome.storage.sync.get("enabled", function(data) {
	changeAssistantState.checked = data.enabled;
});

chrome.storage.sync.get("refresh", function(data) {
	refreshState.checked = data.refresh;
});

changeAssistantState.onclick = function () {
	let state = changeAssistantState.checked;
	
	if (state) {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.executeScript(
				tabs[0].id,
				{allFrames: true, frameId: 0, code: "runAssistant()"});
		});
	} else {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.executeScript(
				tabs[0].id,
				{allFrames: true, frameId: 0, code: "disableAssistant();"});
		});
	}
	
	changeAssistantState.checked = state;
	
	chrome.storage.sync.set({enabled: state}, function() {
		console.log("UDit Client Services Assistant has been " + (state ? "enabled" : "disabled"));
	});
};

refreshState.onclick = function () {
	let state = refreshState.checked;
	
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.executeScript(
			tabs[0].id,
			{allFrames: true, frameId: 0, code: "CSAssistantAutoRefresh = " + (state ? "true" : "false") + ";"});
	});
	
	refreshState.checked = state;
	
	chrome.storage.sync.set({refresh: state}, function() {
		console.log("AutoRefresh has been " + (state ? "enabled" : "disabled"));
	});
};