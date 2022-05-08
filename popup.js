// Check Browser
function Browser() {
    if (navigator.userAgent.indexOf("Chrome") !== -1) {
        return chrome;
    }
    if (navigator.userAgent.indexOf("Firefox") !== -1) {
        return browser;
    }
}

// Update Popup
function updatePopup() {
    Browser().storage.local.get(
        ["type", "isConnected", "ipAddress"],
        function (result) {
            // isConnected
            if (result.isConnected) {
                document.getElementById("connected").style.display = "block";
                document.getElementById("disconnected").style.display = "none";
            } else {
                document.getElementById("connected").style.display = "none";
                document.getElementById("disconnected").style.display = "block";
            }

            // type
            setType(result.type);

            // ipAddress
            setIpAddress(result.ipAddress || "");

            // set button color
            setConnectBtn(result);
        }
    );
}

Browser().runtime.onMessage.addListener(() => {
    updatePopup();
});

const checkbox = document.getElementById("checkbox");
const formSection = document.getElementById("form-section");

function checkChecbox(bool) {
    if (bool.checked) {
        formSection.style.display = "flex";
    } else {
        formSection.style.display = "none";
    }
}

checkbox.addEventListener("click", (event) => {
    checkChecbox(event.target);
    sendCheckboxData(event.target);
});

function sendCheckboxData(type) {
    if (!type.checked) {
        Browser().storage.local.get("type", function (result) {
            if (result.type !== "local") {
                Browser().runtime.sendMessage({ type: "local" });
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", updatePopup);

const ipInput = document.getElementById("ipInput");
const connectBtn = document.getElementById("connectBtn");

connectBtn.addEventListener("click", function (e) {
    const ipAddress = ipInput.value;
    if (!ipAddress) {
        ipInput.style.borderColor = "red";
        return;
    }
    handleConnectBtn(ipAddress);
});

function setType(type) {
    if (type === "wifi") {
        checkbox.checked = true;
    } else {
        checkbox.checked = false;
    }
    checkChecbox(checkbox);
}

function setIpAddress(ipAddress) {
    ipInput.value = ipAddress;
}

function handleConnectBtn(ipAddress) {
    Browser().storage.local.get(["isConnected", "type"], function (result) {
        if (result.isConnected && result.type === "wifi") {
        } else {
            Browser().runtime.sendMessage({ ipAddress, type: "wifi" });
        }
    });
}

function setConnectBtn(result) {
    if (result.isConnected && result.type === "wifi") {
        connectBtn.style.backgroundColor = "#27AE60";
        connectBtn.innerHTML = "Connected";
    } else {
        connectBtn.style.backgroundColor = "#8828ff";
        connectBtn.innerHTML = "Connect";
    }
}
