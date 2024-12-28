const {workers} = require('../constants/constants')

class ApiInterpreter {
    datasets = {
        status : null,
        worker : {}
    }
    constructor() {
        Object.keys(workers).forEach(function(workerName) {
            this.datasets.worker[workerName] = null
        }, this)
        
    }

    acquireDatasets(type, datasets) {
        for (let entry in datasets) {
            const dataset = datasets[entry]
            this.datasets[type][entry] = dataset
        }
    }

    async interpretResponse(from, response) {
        const headers = response.headers
        let content;
        if (headers.get('content-type') === 'application/json') {
            content = await response.json()
        }
        if (typeof content !== 'undefined') {
            if (content.type) {
                const dataset = this.datasets.worker[from]
                const messageType = content.type.toLowerCase()
                // console.log(messageType, 'status', messageType === 'status');
                if (messageType === 'success') {
                    const item = dataset.newItem(content.message)
                    dataset.push(item)
                    return true;
                }
                else if (messageType === 'info') {
                    console.log(content.message)
                    // dataset.push(message.message)
                }
                else if (messageType === 'status') {
                    // console.log(content.message_stack);
                    const items = []
                    content.message_stack.forEach(function(message) {
                        items.push(dataset.newItem('MANUAL STATUS CHECK - ' + message))
                    })
                    dataset.pushApply(items)
                }
                else if (messageType === 'end_status') {
                    const item = dataset.newItem(content.message)
                    dataset.push(item)
                    const items = []
                    content.message_stack.forEach(function(message) {
                        items.push(dataset.newItem('FINAL STATUS CHECK - ' + message))
                    })
                    dataset.pushApply(items)
                    return true;
                }
                else if (messageType === 'error') {
                    const item = dataset.newItem(content.message)
                    dataset.push(item)
                    return false;
                }
            }
        }
    }
}

module.exports = new ApiInterpreter()