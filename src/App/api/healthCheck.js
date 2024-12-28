const {api_url, endpoints, workers} = require('../constants/constants') 

class HealthCheck {
    statusPath = endpoints['status']
    datasets = {
        status : null,
        worker : {}
    }

    constructor() {
        Object.keys(workers).forEach(function(workerName) {
            this.datasets.worker[workerName] = null
        }, this)
    }
    // Here we're supposed to have received the response from the server, and be sure it's a success
    startupCheck(workerName) {
        const self = this;
        let i = 0, max  = 7
        const checkInterval = setInterval(function() {
            self.specificStatusRequest(workerName).then(async function(response) {
                const headers = response.headers
                if (response && response.ok) {
                    let content;
                    if (headers.get('content-type') === 'application/json') {
                        content = await response.json();
                    }
                    if (typeof content !== 'undefined') {
                        const dataset = self.datasets.worker[workerName];
                        const items = [];
                        content.message_stack.forEach(function(message) {
                            items.push(dataset.newItem(message));
                        })
                        dataset.pushApply(items);
                    }
                }
            })
            if (i >= max)
                clearInterval(checkInterval)
            i++
        }, 1000)
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
        });
    }

    acquireDatasets(type, datasets) {
        for (let entry in datasets) {
            const dataset = datasets[entry]
            this.datasets[type][entry] = dataset
        }
    }
}

module.exports = new HealthCheck()