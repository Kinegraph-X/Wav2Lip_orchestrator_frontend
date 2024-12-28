/**
 * Entry point of the App, you should not have to edit this file
 * @author KingraphX (aka E_B_U_n19)
 * @thanks to @SteveDev76 @ArcureDev & @Gulhe_le_GuJ for their very kind and thoroughful testing and insights during their Twitch livestreams
 */

const {appConstants, App} = require('formantjs');

(function () {
	appConstants.launch({
		UIDPrefix : 'Wav2Lip_orchestrator_frontend'
	});
	
	// this.Wav2Lip_orchestrator_frontendLauncher = require('src/App/launcher/app');
	App.componentTypes.CompositorComponent.createAppLevelExtendedComponent();
}).call(window);

module.exports = require('src/App/launcher/app')