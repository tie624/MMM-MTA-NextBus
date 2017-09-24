/* Magic Mirror
 * Node Helper: MMM-MTA-NextBus
 *
 * By 
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");

module.exports = NodeHelper.create({

	// Override socketNotificationReceived method.

	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */
	socketNotificationReceived: function(notification, payload) {
		if (notification === "MMM-MTA-NextBus-NOTIFICATION_TEST") {
			console.log("Working notification system. Notification:", notification, "payload: ", payload);
			// Send notification
			this.sendNotificationTest(this.anotherFunction()); //Is possible send objects :)
		}
	},

	// Example function send notification test
	sendNotificationTest: function(payload) {
		this.sendSocketNotification("MMM-MTA-NextBus-NOTIFICATION_TEST", payload);
	},

	// this you can create extra routes for your module
	extraRoutes: function() {
		var self = this;
		this.expressApp.get("/MMM-MTA-NextBus/extra_route", function(req, res) {
			// call another function
			values = self.anotherFunction();
			res.send(values);
		});
	},

	// Test another function
	anotherFunction: function() {
		return {date: new Date()};
	},

/*
	 * getData
	 * function example return data and show it in the module wrapper
	 * get a URL request
	 *
	 */
	getData: function() {
		var self = this;

		var urlApi = "http://bustime.mta.info/api/siri/stop-monitoring.json?key=" + 
			self.config.apiKey + "&version=2&OperatorRef=MTA&MonitoringRef=" + 
			self.config.busStopCode;
		//var urlApi = "https://jsonplaceholder.typicode.com/posts/1";
		var retry = true;

		var dataRequest = new XMLHttpRequest();
		dataRequest.open("GET", urlApi, true);
		dataRequest.onreadystatechange = function() {
			console.log(this.readyState);
			if (this.readyState === 4) {
				console.log(this.status);
				if (this.status === 200) {
					self.processData(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.updateDom(self.config.animationSpeed);
					Log.error(self.name, this.status);
					retry = false;
				} else {
					Log.error(self.name, "Could not load data.");
				}
				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		dataRequest.send();
	},

	processActionNextBus: function(response) {
		
		var result = '';
		
		var serviceDelivery = response.Siri.ServiceDelivery;
		var updateTimestampReference = new Date(serviceDelivery.ResponseTimestamp);
		
		//console.log(updateTimestampReference);
		
		// array of buses
		var visits = serviceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit;
		var visitsCount = Math.min(visits.length, this.config.maxEntries);
		
		for (var i = 0; i < visitsCount; i++) {
			var journey = visits[i].MonitoredVehicleJourney;
			var line = journey.PublishedLineName[0]; 
			
			if (i === 0) {
				result += 'The next bus is ';
			} else {
				result += ' The following bus is ';
			}
			
			var destinationName = journey.DestinationName[0];
			if (destinationName.startsWith('LIMITED')) {
				line += ' LIMITED';
			}
			
			result += line + ', ';
			
			var monitoredCall = journey.MonitoredCall;
			// var expectedArrivalTime = new Date(monitoredCall.ExpectedArrivalTime);
			if (monitoredCall.ExpectedArrivalTime) {
				var mins = getArrivalEstimateForDateString(monitoredCall.ExpectedArrivalTime, updateTimestampReference);
				result += mins + ', ';
			}
			
			
			var distance = monitoredCall.ArrivalProximityText;
			result += distance + '.';
		}
		
		return result;
	},

	getArrivalEstimateForDateString: function(dateString, refDate) {
		var d = new Date(dateString);
		
		var mins = Math.floor((d - refDate) / 60 / 1000);
		
		return mins + ' minute' + ((Math.abs(mins) === 1) ? '' : 's');
	}

});
