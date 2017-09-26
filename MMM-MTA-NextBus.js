/* global Module */

/* Magic Mirror
 * Module: MMM-MTA-NextBus
 *
 * By 
 * MIT Licensed.
 */

Module.register("MMM-MTA-NextBus", {
	defaults: {
		timeFormat: config.timeFormat,
		maxEntries: 5,
		updateInterval: 60000,
		retryDelay: 5000
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		var self = this;
		var dataRequest = null;
		var dataNotification = null;

		//Flag for check if module is loaded
		//this.loaded = false;
		console.log(this.config.timeFormat);
		this.sendSocketNotification("CONFIG", this.config);

		// Schedule update timer.
		setInterval(function() {
			self.sendSocketNotification("GET_DATA");
		}, this.config.updateInterval);
		
	},	

	getDom: function() {
		var self = this;

		// create element wrapper for show into the module
		var wrapper = document.createElement("div");
		// If this.dataRequest is not empty
		if (this.dataRequest) {
			this.dataRequest.forEach(function(data, i) {
				var wrapperDataRequest = document.createElement("div");
				
				wrapperDataRequest.innerHTML = data;
				wrapperDataRequest.className = "small";
	
				wrapper.appendChild(wrapperDataRequest);
			});

			
		}
		
		return wrapper;
	},

	getScripts: function() {
		return ["moment.js"];
	},

	getStyles: function () {
		return [
			"MMM-MTA-NextBus.css",
		];
	},

	processData: function(data) {
		var self = this;
		this.dataRequest = self.processActionNextBus(data);
		self.updateDom(self.config.animationSpeed);
		//if (this.loaded === false) {  ; }
		//this.loaded = true;

		// the data if load
		// send notification to helper
		//this.sendSocketNotification("MMM-MTA-NextBus-NOTIFICATION_TEST", data);
	},

	processActionNextBus: function(response) {
		
		var result = [];
		
		var serviceDelivery = response.Siri.ServiceDelivery;
		var updateTimestampReference = new Date(serviceDelivery.ResponseTimestamp);
		
		//console.log(updateTimestampReference);
		
		// array of buses
		var visits = serviceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit;
		var visitsCount = Math.min(visits.length, this.config.maxEntries);
		
		for (var i = 0; i < visitsCount; i++) {
			r = '';

			var journey = visits[i].MonitoredVehicleJourney;
			var line = journey.PublishedLineName[0]; 
			
			var destinationName = journey.DestinationName[0];
			if (destinationName.startsWith('LIMITED')) {
				line += ' LIMITED';
			}
			
			r += line + ', ';
			
			var monitoredCall = journey.MonitoredCall;
			// var expectedArrivalTime = new Date(monitoredCall.ExpectedArrivalTime);
			if (monitoredCall.ExpectedArrivalTime) {
				var mins = this.getArrivalEstimateForDateString(monitoredCall.ExpectedArrivalTime, updateTimestampReference);
				r += mins + ', ';
			}
			
			
			var distance = monitoredCall.ArrivalProximityText;
			r += distance;

			result.push(r);
		}



		result.push('Last Updated: ' + this.formatTimeString(updateTimestampReference));
		
		return result;
	},

	getArrivalEstimateForDateString: function(dateString, refDate) {
		var d = new Date(dateString);
		
		var mins = Math.floor((d - refDate) / 60 / 1000);
		
		return mins + ' minute' + ((Math.abs(mins) === 1) ? '' : 's');
	},

	formatTimeString: function(date) {
		var m = moment(date);

		var hourSymbol = "HH";
		var periodSymbol = "";

		if (this.config.timeFormat !== 24) {
			hourSymbol = "h";
			periodSymbol = " A";
		}

		var format = hourSymbol + ":mm" + periodSymbol;

		return m.format(format);
	},

	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		if (notification === "DATA") {
			this.processData(payload);
		} else if (notification === "ERROR") {
			self.updateDom(self.config.animationSpeed);
		} 
	},
});
