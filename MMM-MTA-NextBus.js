/* global Module */

/* Magic Mirror
 * Module: MMM-MTA-NextBus
 *
 * By 
 * MIT Licensed.
 */

Module.register("MMM-MTA-NextBus", {
	defaults: {
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
		this.loaded = false;

		this.sendSocketNotification("CONFIG", this.config);

		

		// Schedule update timer.
		/*this.getData();
		setInterval(function() {
			self.updateDom();
		}, this.config.updateInterval);
		*/
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

		// Data from helper
		/*if (this.dataNotification) {
			var wrapperDataNotification = document.createElement("div");
			// translations  + datanotification
			wrapperDataNotification.innerHTML =  this.translate("UPDATE") + ": " + this.dataNotification.date;

			wrapper.appendChild(wrapperDataNotification);
		}*/
		return wrapper;
	},

	getScripts: function() {
		return [];
	},

	getStyles: function () {
		return [
			"MMM-MTA-NextBus.css",
		];
	},

	// Load translations files
	getTranslations: function() {
		//FIXME: This can be load a one file javascript definition
		return {
			en: "translations/en.json",
			es: "translations/es.json"
		};
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
		
		return result;
	},

	getArrivalEstimateForDateString: function(dateString, refDate) {
		var d = new Date(dateString);
		
		var mins = Math.floor((d - refDate) / 60 / 1000);
		
		return mins + ' minute' + ((Math.abs(mins) === 1) ? '' : 's');
	},

	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		if (notification === "DATA") {
			this.processData(payload);
		} else if (notification === "ERROR") {
			self.updateDom(self.config.animationSpeed);
		} 
		else if (notification === "MMM-MTA-NextBus-NOTIFICATION_TEST") {
			// set dataNotification
			this.dataNotification = payload;
			this.updateDom();
		}
	},
});
