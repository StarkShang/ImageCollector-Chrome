let messagePort = null;

/**
 * 增加label
 * @param {*} labelName
 * @param {*} callback
 */
function createLabel(labelName, callback) {
    http.post("http://localhost:3000/labels",{ name: labelName }, callback);
}

/**
 * 增加图片信息
 * @param {*} meta
 * @param {*} callback
 */
function createImage(meta, callback) {
    http.post("http://localhost:3000/images", meta, callback);
}

/**
 * 触发右键菜单
 * 单击右键 -> 请求server获取labels -> 通知content.js
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (messagePort) {
        http.get("http://localhost:3000/labels", (labels) => {
            messagePort.postMessage({
                cmd: "show-panel",
                data: labels
            });
        });
    }
});

/**
 * 增加右键菜单的选项
 */
chrome.contextMenus.create({
    "id": "harvest",
    "title": "发送到图床",
    "contexts": ["image"]
});

/**
 * 与content.js建立长链接
 */
chrome.runtime.onConnect.addListener((port) => {
    messagePort = port;
    port.onMessage.addListener((msg) => {
        switch (msg.cmd) {
            case "add-label":
                createLabel(msg.data, label => port.postMessage({
                    cmd: msg.cmd,
                    data: label
                }));
                break;
            case "collect-image":
                createImage(msg.data, image => port.postMessage({
                    cmd: msg.cmd,
                    data: image
                }));
                break;
        }
    });
});
