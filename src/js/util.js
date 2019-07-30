function get(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", chrome.extension.getURL(url), true);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status == 200) {
                callback(JSON.parse(xhr.responseText));
            }
            else {
                console.log(xhr.status);
                console.log(xhr.responseText);
            }
        }
    };
    xhr.send();
}

function post(url, data, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", chrome.extension.getURL(url), true);
    xhr.setRequestHeader("Content-type","application/json");
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                callback(JSON.parse(xhr.responseText));
            }
            else {
                console.log(xhr.status);
                console.log(xhr.responseText);
            }
        }
    };
    xhr.send(JSON.stringify(data));
}

const http = {
    get: get,
    post: post
}
