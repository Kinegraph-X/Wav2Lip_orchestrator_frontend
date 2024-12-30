const {statuses, workers} = require('../constants/constants')

class UIManager {
    datasets = {
        statuses : {},
        workers : {}
    }
    logDOMElements = {}
    buttonRefreshStreams = {}
    constructor() {
        Object.keys(workers).forEach(function(workerName) {
            this.datasets.workers[workerName] = null
        }, this)
        Object.keys(statuses).forEach(function(status) {
            this.datasets.workers[status] = null
        }, this)
    }

    handleError(intervalID, workerName, originButtonGroup) {
        originButtonGroup.streams.statusFeedback.value = statuses.stopped
        this.filterStatuses(this.datasets.statuses, workerName, statuses.error)
        clearInterval(intervalID)
    }

    acquireDatasets(type, datasets) {
        for (let entry in datasets) {
            const dataset = datasets[entry]
            this.datasets[type][entry] = dataset
        }
    }

    acquireButtonRefreshStreams(worker, stream) {
        this.buttonRefreshStreams[worker] = stream;
    }

    acquireLogElement(worker, element) {
        this.logDOMElements[worker] = element;
    }
    
    updateScroll(worker){
        this.logDOMElements[worker].scrollTop = this.logDOMElements[worker].scrollHeight;
    }

    updateButtonState(worker, status) {
        this.buttonRefreshStreams[worker].value = status
    }

    filterStatuses(from, newStatus) {
        const self = this;
        Object.keys(this.datasets.statuses).forEach(function(status) {
            const dataset = self.datasets.statuses[status];
            const oldValues = dataset.slice();
            
            const workerExists = oldValues.findObjectByValue('text', from)
    
            if (workerExists && status === newStatus) {
                // return
            }
            else if (workerExists && status !== newStatus) {
                let newValues = oldValues.filter((val) => val.text !== from);
                dataset.resetLength();
                newValues = newValues.map((val) => dataset.newItem(val.text));
                dataset.pushApply(newValues);
            }
            if (!workerExists && status === newStatus) {
                dataset.push(dataset.newItem(from));
            }
        })
    }
}

module.exports = new UIManager()