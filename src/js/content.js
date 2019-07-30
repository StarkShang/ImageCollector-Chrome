//content script
let selectedImage = null;  // 右键点击对话框
let selectedLabels = [];    // 选择的标签

function showElement() {
    $("#harvest-mask").css("visibility", "visible");
    $("#harvest-panel").css("visibility", "visible");
}

function hideElement() {
    $("#harvest-mask").css("visibility", "hidden");
    $("#harvest-panel").css("visibility", "hidden");
}

function toggleLabelNodeSelection(labelNode) {
    const index = selectedLabels.indexOf(labelNode);
    if (index > -1) {
        selectedLabels.splice(index, 1);
        labelNode.classList.remove("selected-label");
    }
    else {
        selectedLabels.push(labelNode);
        labelNode.classList.add("selected-label");
    }
}

function appendLabelNode(label) {
    const labelNode = document.createElement("span");
    labelNode.textContent = label.name;
    labelNode.setAttribute("data-id", label.id);
    labelNode.className += "label";
    labelNode.onclick = () => toggleLabelNodeSelection(labelNode);
    $("#label-container").append(labelNode);
}

document.addEventListener("mousedown", (event) => {
    //right click
    if(event.button == 2) {
        selectedImage = event.target;
    }
}, true);

/**
 * 接受后台消息
 */
const messagePort = chrome.runtime.connect({name: "harvest"});
messagePort.onMessage.addListener(msg => {
    switch (msg.cmd) {
        case "show-panel":
            const labels = msg.data;
            $("#label-container").empty();
            labels.forEach(label => appendLabelNode(label));
            showElement();
            break;
        case "add-label":
            const label = msg.data;
            appendLabelNode(label);
            $("#add-label-input").val("");
            break;
        case "collect-image":
            hideElement();
            break;
    }
});

/**
 * 通知后台创建label
 */
function addLabel() {
    const labelName = $("#add-label-input").val();
    messagePort.postMessage({
        cmd: "add-label",
        data: labelName
    });
}

/**
 * 通知后台采集图片
 */
function collectImage() {
    if (messagePort && selectedImage) {
        labelIds = selectedLabels.map(label => label.dataset.id).sort();
        messagePort.postMessage({
            cmd: "collect-image",
            data: {
                uri: selectedImage.src,
                labels: labelIds
            }
        })
    }
}

/**
 * 页面DOM完全加载完成后添加采集UI
 */
$(() => {
    const styleNode = document.createElement("style");
    styleNode.textContent = `
        .label {
            display: inline-block;
            background-color: grey;
            line-height: 1.5em;
            margin: 0 0.25em 0.5em;
            padding: 0 0.5em;
            border-radius: 0.75em;
            color: white;
            cursor: pointer;
        }
        .selected-label {
            background-color: #2ed573;
        }`;

    const maskNode = document.createElement("div");
    maskNode.id = "harvest-mask";
    maskNode.onclick = hideElement;
    maskNode.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: rgba(0,0,0,0.5);
        z-index: 999999;
        visibility: hidden;`;
    
    const panelNode = document.createElement("div");
    panelNode.id = "harvest-panel";
    panelNode.style.cssText = `
        width: 300px;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        background-color: white;
        border-radius: 5px;
        z-index: 9999999;
        visibility: hidden;`;
    panelNode.innerHTML = `
        <h4 style="margin:0 0 0.5em">请选择标签</h4>
        <section style="display:flex;margin-bottom:1em;">
            <input id="add-label-input" style="border:none;border-bottom:solid 1px black;padding:0;outline:none;flex:1;" type="text">
            <div id="add-label-button" style="margin-left:1em;cursor:pointer">添加</div>
        </section>
        <section id="label-container" style="display: flex; flex-wrap: wrap;"></section>
        <section style="display: flex;">
            <div id="collect-button" style="margin-left:auto;cursor:pointer;">采集</div>
            <div id="cancel-button" style="margin-left:1em;cursor:pointer;">取消</div>
        </section>`;

    document.head.appendChild(styleNode);
    document.body.appendChild(maskNode);
    document.body.appendChild(panelNode);
    document.getElementById("cancel-button").onclick = hideElement;
    document.getElementById("collect-button").onclick = collectImage;
    document.getElementById("add-label-button").onclick = addLabel;
});
