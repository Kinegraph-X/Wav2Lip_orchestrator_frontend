const {api_url, endpoints, workers, statuses, successTriggers} = require('../constants/constants')
const UIManager = require('../UIManager/UIManager');

class ApiInterpreter {
    statusPath = endpoints.status

    constructor() {

    }

    async interpretResponse(from, response) {
        const headers = response.headers
        let content;
        if (headers.get('content-type') === 'application/json') {
            content = await response.json()
        }
        if (typeof content !== 'undefined') {
            if (content.type) {
                const dataset = UIManager.datasets.workers[from]
                const messageType = content.type.toLowerCase()
                
                if (messageType === 'success') {
                    dataset.push(dataset.newItem(content.message))
                    return true;
                }
                else if (messageType === 'info') {
                    dataset.push(dataset.newItem(content.message));
                }
                else if (messageType === 'status') {
                    const items = []
                    content.message_stack.forEach(function(message) {
                        items.push(dataset.newItem('MANUAL STATUS CHECK - ' + message))
                    })
                    dataset.pushApply(items);
                    UIManager.updateScroll(from);

                    // Propagate state on action buttons
                    const newStatus = this.getStatusFromMessage(content.status);
                    UIManager.updateButtonState(workerName, newStatus);
                    UIManager.filterStatuses(from, newStatus);
                }
                else if (messageType === 'end_status') {
                    // message is the success message, but may not : display and don't rely on
                    dataset.push(dataset.newItem(content.message));

                    const items = [];
                    let isSuccessTrigger = false;
                    content.message_stack.forEach(function(message) {
                        if (successTriggers[from].indexOf(message.slice(22).trim()) !== -1)
                            isSuccessTrigger = true;
                        items.push(dataset.newItem('FINAL STATUS CHECK - ' + message));
                    })
                    dataset.pushApply(items);
                    
                    let newStatus;
                    if (isSuccessTrigger) {
                        newStatus = statuses.stopped;
                        UIManager.filterStatuses(from, newStatus);
                        UIManager.updateButtonState(from, newStatus);
                    }

                    return isSuccessTrigger;
                }
                else if (messageType === 'error') {
                    dataset.push(dataset.newItem(content.message));
                    return false;
                }
            }
        }
    }

    // Here we're supposed to have received the response from the server, and be sure it's a success
    startupCheck(workerName) {
        const self = this;
        let i = 0, max  = 14
        const checkInterval = setInterval(function() {
            self.specificStatusRequest(workerName).then(async function(response) {
                const headers = response.headers
                if (response && response.ok) {
                    let content;
                    if (headers.get('content-type') === 'application/json') {
                        content = await response.json();
                    }
                    if (typeof content !== 'undefined') {
                        const dataset = UIManager.datasets.workers[workerName];
                        const items = [];
                        let isSuccessTrigger = false;
                        content.message_stack.forEach(function(message) {
                            if (successTriggers[workerName].indexOf(message.slice(22).trim()) !== -1)
                                isSuccessTrigger = true;
                            items.push(dataset.newItem(message));
                            if (/ERROR/i.test(message)) {
                                self.handleError(checkInterval, workerName)
                            }
                        })
                        dataset.pushApply(items);
                        UIManager.updateScroll(workerName);

                        if (/ERROR/i.test(content.status)) {
                            self.handleError(checkInterval, workerName)
                        }
                        else if (isSuccessTrigger) {
                            const newStatus = statuses.running
                            UIManager.filterStatuses(workerName, newStatus);
                            UIManager.updateButtonState(workerName, newStatus);
                        }
                        
                    }
                }
            })
            if (i >= max)
                clearInterval(checkInterval)
            i++
        }, 1000)
    }

    appInitCheck(key, originButtonGroup) {
        const self = this;
        const workerName = Object.keys(workers)[key];
        self.specificStatusRequest(workerName).then(async function(response) {
            const headers = response.headers
            if (response && response.ok) {
                let content;
                if (headers.get('content-type') === 'application/json') {
                    content = await response.json();
                }
                if (typeof content !== 'undefined') {
                    let newStatus;
                    if (/ERROR/i.test(content.status)) {
                        self.handleError(0, workerName, originButtonGroup)
                    }
                    else {
                        if (/running/i.test(content.status)) {
                            newStatus = statuses.running
                        }
                        else if (/stopped/i.test(content.status)) {
                            newStatus = statuses.stopped
                        }
                        UIManager.filterStatuses(workerName, newStatus)
                        UIManager.updateButtonState(workerName, newStatus);
                    }
                }
            }
        })
    }

    specificStatusRequest(workerName) {
        return fetch(api_url + this.statusPath, {
            method: 'POST',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'name' : workerName
            })
        }).catch(function(error) {
            console.error(error)
        });
    }

    handleError(intervalID, workerName) {
        UIManager.updateButtonState(workerName, statuses.stopped);
        UIManager.filterStatuses(workerName, statuses.error)
        clearInterval(intervalID)
    }

    getStatusFromMessage(status) {
        let newStatus;
        if (/ERROR/.test(status))
            newStatus = statuses.error;
        else if (/running/.test(status))
            newStatus = statuses.running;
        else if (/stopped/.test(status))
            newStatus = statuses.stopped;
        return newStatus;
    }
}

module.exports = new ApiInterpreter()