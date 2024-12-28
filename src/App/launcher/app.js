const {App, TemplateFactory} = require('formantjs');
const {endpoints, workers, status} = require('../constants/constants')
const get_api_requests = require('../api/api')
const getWorkerButtonsGroup = require('../templates/workerButtonsGroup')
const getListsTemplates = require('../templates/listTemplate')
const get_column_templates = require('../templates/statusColumnsTemplate')
const get_column_template = require('../templates/actionColumnsTemplate')
const apiInterpreter = require ('../api/apiInterpreter')
const healthCheck = require('../api/healthCheck')

const innerStyles = require('../innerCSS/innerCSS.css')

// Object.keys(workers).map(function(worker) {
// 	console.log(Object.values(get_button_templates(worker)))
// })


/**
 * @factory appName
 * @launcher
 */
module.exports = function(parentView) {
	return {
		init : function (containerSelector) {

			const root = new App.RootView();

			// Status Lists section
			const listsSectionTemplate = get_column_template('Status');
			listsSectionTemplate.members[1].members = Object.values(get_column_templates(status));
			const listsComponent = new App.componentTypes.CompoundComponent(listsSectionTemplate, root.view)

			const statusNames = Object.values(status)
			const listDatasets = {}
			Object.values(getListsTemplates(status)).forEach(function(listTemplate, key) {
				const list = new App.coreComponents.IteratingComponent(listTemplate.host, listsComponent._children[1]._children[key]._children[0].view, listTemplate.item)
				listDatasets[statusNames[key]] = list.typedSlot
			});
			
			// Buttons section
			const endpointNames = Object.keys(endpoints)
			const buttonSectionMembers = Object.keys(workers).map(function(worker, key) {
				const requests = get_api_requests(worker)
				const workerActionsTemplate = getWorkerButtonsGroup(worker, endpointNames, requests);
				workerActionsTemplate.members.unshift(TemplateFactory.createHostDef({nodeName : 'h4', attributes : [{textContent : worker}]}));
				return workerActionsTemplate
			});
			
			const buttonSectionTemplate = get_column_template('Actions');
			buttonSectionTemplate.members[1].members = buttonSectionMembers
			const workerCards = new App.componentTypes.CompoundComponent(buttonSectionTemplate, root.view)
			

			// Logs Lists section
			const logsSectionTemplate = get_column_template('Logs');
			logsSectionTemplate.members[1].members = Object.values(get_column_templates(workers));
			const logsComponent = new App.componentTypes.CompoundComponent(logsSectionTemplate, root.view)

			const logListDatasets = {}
			const workerNames = Object.values(workers)
			Object.values(getListsTemplates(workers)).forEach(function(listTemplate, key) {
				const list = new App.coreComponents.IteratingComponent(listTemplate.host, logsComponent._children[1]._children[key]._children[1].view, listTemplate.item)
				logListDatasets[workerNames[key]] = list.typedSlot
			});

			apiInterpreter.acquireDatasets('worker', logListDatasets)
			healthCheck.acquireDatasets('worker', logListDatasets)

			App.renderDOM()
			workerCards._children[1]._children.forEach(function(workerCard) { workerCard.streams.statusFeedback.value = status['stopped']})

			// inner styles
			const styleElem = document.createElement('style')
			styleElem.innerHTML = innerStyles.default
			root.view.getWrappingNode().prepend(styleElem)
		}
	}
};