let ipAddress = "";
let localhost = "http://localhost:64356";
let socket;

function connectSocket(hostUrl, type, ipAddress) {
    socket = io(hostUrl);
    socketFunction(hostUrl);
    sendData({ type: type ? type : "local", ipAddress });
}

function socketFunction(hostUrl) {
    socket.on("connect", () => {
        setIcon("active");
        sendData({ isConnected: true });

        const Android = /(android)/i.test(navigator.userAgent);

        socket.emit("browserConnected", {
            browser: `${detectBrowser()}${Android ? " Android" : ""}`,
            host: hostUrl ? hostUrl.slice(7, -6) : "",
        });
    });

    socket.on("disconnect", () => {
        setIcon("icon");
        sendData({ isConnected: false });
    });

    socket.on("reload", ({ url }) => {
        reloadFunction(url);
    });
}

connectSocket(localhost);

function reloadFunction(url) {
    Browser().tabs.query({}, (tabs) => {
        const filterTab = tabs.filter((v) => {
            for (const i in url) {
                if (v.url.indexOf(url[i]) !== -1) {
                    return v;
                }
            }
        });
        filterTab.forEach((v) => {
            Browser().tabs.reload(v.id);
        });
    });
}

function setIcon(name) {
    Browser().browserAction.setIcon({
        path: {
            16: `img/${name}16.png`,
            32: `img/${name}32.png`,
            48: `img/${name}48.png`,
            128: `img/${name}128.png`,
        },
    });
}

function Browser() {
    if (navigator.userAgent.indexOf("Chrome") !== -1) {
        return chrome;
    } else if (navigator.userAgent.indexOf("Firefox") !== -1) {
        return browser;
    } else {
        return chrome;
    }
}

function sendData(data) {
    Browser().storage.local.set(data);
    Browser().runtime.sendMessage(data);
}

Browser().runtime.onMessage.addListener((data) => {
    console.log(data);

    if (data.type === "local") {
        socket.disconnect();
        connectSocket(localhost, data.type);
    } else if (data.type === "wifi") {
        socket.disconnect();
        connectSocket(
            `http://${data.ipAddress}:64356`,
            data.type,
            data.ipAddress
        );
    }
});

function detectBrowser() {
    if (
        (navigator.userAgent.indexOf("Opera") ||
            navigator.userAgent.indexOf("OPR")) != -1
    ) {
        return "Opera";
    } else if (navigator.userAgent.indexOf("Chrome") != -1) {
        return "Chrome";
    } else if (navigator.userAgent.indexOf("Safari") != -1) {
        return "Safari";
    } else if (navigator.userAgent.indexOf("Firefox") != -1) {
        return "Firefox";
    } else if (
        navigator.userAgent.indexOf("MSIE") != -1 ||
        !!document.documentMode == true
    ) {
        return "IE"; //crap
    } else {
        return "Unknown";
    }
}
