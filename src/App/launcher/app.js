const {App, TemplateFactory} = require('formantjs');
const {endpoints, workers, statuses} = require('../constants/constants');
const constants = require('../constants/constants');
const getWorkerButtonsGroup = require('../templates/workerButtonsGroup');
const getStartAllButton = require('../templates/startAllButtonsGroup');
const getListsTemplates = require('../templates/listTemplate');
const get_column_templates = require('../templates/statusColumnsTemplate');
const get_column_template = require('../templates/actionColumnsTemplate');
const {makeStandardRequest} = require('../api/allButtonsRequests')
const apiInterpreter = require ('../api/apiInterpreter');
const UIManager = require('../UIManager/UIManager');

const innerStyles = require('../innerCSS/innerCSS.css');


/**
 * @factory appName
 * @launcher
 */
module.exports = function(parentView) {
	return {
		init : function (containerSelector) {

			const root = new App.RootView();

			// statuses Lists section
			const listsSectionTemplate = get_column_template('Status');
			listsSectionTemplate.members[1].members = Object.values(get_column_templates(statuses));
			const listsComponent = new App.componentTypes.CompoundComponent(listsSectionTemplate, root.view)

			const statusNames = Object.values(statuses)
			const listDatasets = {}
			Object.values(getListsTemplates(statuses)).forEach(function(listTemplate, key) {
				const list = new App.coreComponents.IteratingComponent(listTemplate.host, listsComponent._children[1]._children[key]._children[1].view, listTemplate.item)
				listDatasets[statusNames[key]] = list.typedSlot
			});
			
			// Buttons section
			
			const endpointNames = Object.keys(endpoints);
			let buttonSectionMembers
			if (location.pathname.includes(constants.admin)) {
				buttonSectionMembers = Object.keys(workers).map(function(worker, key) {
					const workerActionsTemplate = getWorkerButtonsGroup(worker, endpointNames);
					workerActionsTemplate.members.unshift(TemplateFactory.createHostDef({nodeName : 'h4', attributes : [{textContent : worker}]}));
					return workerActionsTemplate
				});
			}
			else {
				const workerActionTemplate = getStartAllButton(Object.values(workers), endpointNames)
				workerActionTemplate.members.unshift(TemplateFactory.createHostDef({nodeName : 'h4', attributes : [{textContent : 'Run Avatar'}]}));
				buttonSectionMembers = [
					workerActionTemplate
				]
			}
			
			const buttonSectionTemplate = get_column_template('Actions');
			buttonSectionTemplate.members[1].members = buttonSectionMembers
			const workerCards = new App.componentTypes.CompoundComponent(buttonSectionTemplate, root.view)

			// Logs Lists section
			const logsSectionTemplate = get_column_template('Logs');
			logsSectionTemplate.members[1].members = Object.values(get_column_templates(workers, 'showButton'));
			const logsComponent = new App.componentTypes.CompoundComponent(logsSectionTemplate, root.view)

			const logListDatasets = {}, listsComponents = []
			const workerNames = Object.values(workers)
			Object.values(getListsTemplates(workers)).forEach(function(listTemplate, key) {
				const wipeButton = logsComponent._children[1]._children[key]._children[0]._children[1];
				const list = new App.coreComponents.IteratingComponent(listTemplate.host, logsComponent._children[1]._children[key]._children[1].view, listTemplate.item);
				listsComponents.push(list)
				wipeButton.addEventListener('clicked_ok', function(e) {list.typedSlot.resetLength()})
				logListDatasets[workerNames[key]] = list.typedSlot
			});


			//  Pass lists to API-responses interpreters
			UIManager.acquireDatasets('statuses', listDatasets)
			UIManager.acquireDatasets('workers', logListDatasets)

			App.renderDOM()

			// SET INITIAL STATE (Things that need the DOM to be rendered to have effect)

			// Acquire scrollable elements to maintain last logs visible
			listsComponents.forEach((listComponent, key) => {
				UIManager.acquireLogElement(workerNames[key], listComponent.view.getMasterNode());
				UIManager.acquireLogElement(workerNames[key], listComponent.view.getMasterNode());
			});
			// Check statuses of all workers at initialization (in case the page has been reloaded on an intermediate state)
			if (location.pathname.includes(constants.admin)) {
				workerCards._children[1]._children.forEach(function(workerCard) { workerCard.streams.statusFeedback.value = statuses['stopped']}); // Set state optimistically at first
				workerCards._children[1]._children.forEach(function(buttonComponent, key) {
					apiInterpreter.appInitCheck(key, buttonComponent);
					UIManager.acquireButtonRefreshStreams(workerNames[key], buttonComponent.streams.statusFeedback);
				})
			}
			else {
				const buttonComponent = workerCards._children[1]._children[0]
				buttonComponent.streams.statusFeedback.value = statuses['stopped'];
				Object.keys(workers).forEach(function(workerName, key) {
					apiInterpreter.appInitCheck(key, buttonComponent);
					UIManager.acquireButtonRefreshStreams(workerName, buttonComponent.streams.statusFeedback);
				});
			}

			// This won't have the expected effect if the user keeps its tab open.
			// But let's implement a clean exit, it may solve some rare unclean exits
			// window.addEventListener("beforeunload", function (e) {
			// 	for (let i = 0, max = workerNames.length; i < max; i++) {
			// 		let workerName = workerNames[i]
			// 		makeStandardRequest.call(self, workerName, endpointNames[1]);
			// 	}
			// 	var confirmationMessage = "\\o/";

			// 	e.returnValue = confirmationMessage; // Gecko, Trident, Chrome 34+
			// 	return confirmationMessage; // Gecko, WebKit, Chrome <34
			// });
			
			// inner styles
			const styleElem = document.createElement('style')
			styleElem.innerHTML = innerStyles.default
			root.view.getWrappingNode().prepend(styleElem)
		}
	}
};