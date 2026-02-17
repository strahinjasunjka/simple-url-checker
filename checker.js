const form= document.querySelector('#urlForm');
const urlInput = form.elements.namedItem('url');
const statusDiv = document.getElementById('statusLabel');
const messageDiv = document.getElementById('messageLabel');

urlInput.addEventListener('input', validate);

//Average typing speed is around 0.3s per character
const THROTTLE_DELAY = 300; // milliseconds
const SERVER_CHECK_DELAY = 200; // milliseconds


function validate(e) {
    let taget = e.target;
    if(isValidURL(urlInput.value)) {
        statusDiv.textContent = 'Valid URL';
        statusDiv.classList.add('valid');
        statusDiv.classList.remove('invalid');
        throttledServerCheck(urlInput.value);
       
    } else {
        statusDiv.textContent = 'Invalid URL';
        statusDiv.classList.add('invalid');
        statusDiv.classList.remove('valid');
        messageDiv.textContent = 'Enter valid URL';
    }
}

// Using built-in URL constructor instead of regex which is less readable and complex
function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

//Advanced throttle that ensures the last call is executed after the delay, even if multiple calls are made during the delay period
var throttleAdvanced = function (func, delay) {
    let isThrottled = false;
    let nextArgs = null;
    let nextContext = null;

    return function (...args) {
        if (isThrottled) {
            nextArgs = args;
            nextContext = this;
            return;
        }

        func.apply(this, args);
        isThrottled = true;

        const helper = () => {
            if (nextArgs) {
                func.apply(nextContext, nextArgs);
                nextArgs = null;
                nextContext = null;
                setTimeout(helper, delay);
            } else {
                isThrottled = false;
            }
        };

        setTimeout(helper, delay);
    };
};

//Simple mock of server check, returns "Folder" if url ends with "/", "File" if it ends with a file extension, and null otherwise
function serverCheck(url) {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (url.endsWith("/")) {
                resolve("Folder");
            } 
            else if (/\.[a-zA-Z0-9]+$/.test(url)) {
                resolve("File");
            } 
            else {
                resolve(null);
            }
        }, SERVER_CHECK_DELAY);
    });
}

//Throttled version of serverCheck to avoid that too many server requests are done all the time
const throttledServerCheck = throttleAdvanced(async (url) => {
    try {
        const result = await serverCheck(url);

        if (result) {
            messageDiv.textContent = result;
        } else {
            messageDiv.textContent = "Not found";
        }

    } catch (error) {
        messageDiv.textContent = "Error";
    }
}, THROTTLE_DELAY);


