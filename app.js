'use strict';

const Homey = require('homey');
const request = require('request');
const fs = require('fs');

class NotificationApp extends Homey.App {

	onInit() {
		this.log('nfatv is running...');

		this._onFlowActionSendNotification = this._onFlowActionSendNotification.bind(this);

		new Homey.FlowCardAction('send_notification')
			.register()
			.registerRunListener(this._onFlowActionSendNotification);

		new Homey.FlowCardAction('send_image')
			.register()
			.registerRunListener(this._onFlowActionSendNotification);
	}

	async _onFlowActionSendNotification(args) {

		let address = `http://${args.host}:7676`;
		let formData = {
			type: '0',
			title: args.title,
			msg: args.message,
			duration: args.time,
			fontsize: args.fontsize,
			position: args.position,
			width: '0',
			bkgcolor: "#000000",
			transparency: args.transparency,
			offset: '0',
			offsetY: '0',
			interrupt: '0',
			app: "Homey",
			filename: {
				value: fs.createReadStream("./assets/homey.png"),
				options: {
					filename: 'icon.jpg',
					contentType: 'application/octet-stream'
				}
			},
			force: 'true'
		};

		if (args.droptoken != null) {
			let stream = await args.droptoken.getBuffer();
			formData["filename2"] = {
				value: stream,
				options: {
					filename: "image",
					contentType: 'application/octet-stream'
				}
			};
		}

		console.log('sending notification to', address);

		request.post({ url: address, formData: formData }, function optionalCallback(err, httpResponse, body) {
			if (err) {
				console.error('notification failed:', err);
				return false;
			}

			console.log('notification success');
			return true;
		});
	}
}

module.exports = NotificationApp;