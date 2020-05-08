let iframeDoc = null;

const DAY = 86400000;
const HOUR = 3600000;
const MIN = 60000;
const SEC = 1000;

const TIMEFRAME_RED = 7 * DAY;
const TIMEFRAME_YELLOW = 3 * DAY;

try {
	iframe = document.getElementById("appDesktop");
	iframeWin = iframe.contentWindow || iframe;
	iframeDoc = iframe.contentDocument || iframeWin.document;
} catch {
	iframeDoc = document;
}

// ASSISTANT
sleep(5 * SEC).then(() => {
	buildRefreshers();
	iframeDoc.getElementById("btnRefresh").href = "javascript: window.location.reload()";
	
	chrome.storage.sync.get("enabled", function (data) {
		if (data.enabled) runAssistant();
	});
	
});

// AUTO-REFRESHING
let CSAssistantAutoRefresh = true;

chrome.storage.sync.get("refresh", function (data) {
	CSAssistantAutoRefresh = data.refresh
});

sleep(10 * MIN).then(() => {
	setInterval(refresh, 10 * MIN);
	
	function refresh() {
		let onDesktop = iframeDoc.getElementById("lblDesktops");
		if (onDesktop) onDesktop = onDesktop.offsetParent;
		
		if (CSAssistantAutoRefresh && onDesktop) {
			window.location.reload();
		}
	}
});

// FUNCTIONS
function buildRefreshers() {
	let queueRefreshers = iframeDoc.getElementsByClassName("refreshAnchor");
	let queueSorters = iframeDoc.getElementsByClassName("sort-link");
	let refreshList = [queueRefreshers, queueSorters];
	
	for (let i = 0; i < refreshList.length; i++) {
		for (let j = 0; j < refreshList[i].length; j++) {
			refreshList[i][j].onclick = function () {
				refresher(3 * SEC);
			};
		}
	}
}

function refresher(time) {
	chrome.storage.sync.get("enabled", async function (data) {
		await sleep(time);
		
		if (data.enabled) runAssistant();
		
		buildRefreshers()
	});
}

function runAssistant() {
	let queues = iframeDoc.getElementsByClassName("desktop-module");
	
	// Using a foreach causes issues when destructuring the objects
	for (let i = 0; i < queues.length; i++) {
		let tableHead = queues[i].children[1].children[0].children[0].children[0];
		let table = queues[i].children[1].children[0].children[1];
		
		runColorCode(tableHead, table)
	}
}

function runColorCode(tableHead, table) {
	let statusCol, modifiedCol;
	
	if (tableHead === undefined) return;
	
	for (let i = 0; i < tableHead.children.length; i++) {
		let colHeader = tableHead.children[i].getElementsByTagName("a")[0].innerText;
		if (colHeader.includes("Status")) {
			statusCol = i;
		} else if (colHeader.includes("Modified")) {
			modifiedCol = i;
		}
	}
	
	for (let i = 0; i < table.children.length; i++) {
		let row = table.children[i];
		let status = row.children[statusCol].innerText;
		let timestampString = row.children[modifiedCol].innerText;
		let timeArray = timestampString.substring(4,).split(" ");
		let date = timeArray[0].split("/");
		let time = timeArray[1].split(":");

		if (timeArray[2] === "PM") time[0] = (parseInt(time[0]) + 12).toString();

		let ticketTime = new Date(parseInt(date[2]) + 2000, parseInt(date[0]) - 1, parseInt(date[1]), parseInt(time[0]), parseInt(time[1]), 0, 0);
		let timeNow = new Date(Date.now());
		let timeDif = timeNow - ticketTime;
		
		if (status === "New") {
			row.classList.add("CSAssistant_New");
		} else if (timeDif > TIMEFRAME_RED) {
			row.classList.add("CSAssistant_Danger");
		} else if (timeDif >= TIMEFRAME_YELLOW) {
			row.classList.add("CSAssistant_Warning");
		}
	}
}

function disableAssistant() {
	let CSAssistant = [".CSAssistant_Danger", ".CSAssistant_Warning", ".CSAssistant_Safe", ".CSAssistant_OnHold", ".CSAssistant_New"];
	
	for (let i = 0; i < CSAssistant.length; i++) {
		let list = document.querySelectorAll(CSAssistant[i]);
		
		for (let j = 0; j < list.length; j++) {
			list[j].classList.remove(CSAssistant[i].substring(1));
		}
	}
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}