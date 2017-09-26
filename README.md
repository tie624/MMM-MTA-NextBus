# MMM-MTA-NextBus

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/). It tells you when the next bus arrives at your bus stop. This is for people that live in New York City.

## Installation
Navigate into your MagicMirror's `modules` folder and execute git clone `https://github.com/tie624/MMM-MTA-NextBus.git`.

## Using the module

To use this module, add the following configuration block to the modules array in the `config/config.js` file:
```js
var config = {
    modules: [
        {
            module: 'MMM-MTA-NextBus',
            position: "bottom_right",   // This can be any of the regions.
            config: {
                // See below for configurable options
            }
        }
    ]
}
```

## Configuration options

| Option           | Description
|----------------- |-----------
| `apiKey`         | *Required* Your MTA Bus Time API key. If you don't have one, you can request one [here](http://spreadsheets.google.com/viewform?hl=en&formkey=dG9kcGIxRFpSS0NhQWM4UjA0V0VkNGc6MQ#gid=0).<br><br> **Type:** `string` <br> **Default value:** `none`
| `busStopCode`    | *Required* The 6 digit bus stop code to monitor. You can get it from your bus stop or find it [here](http://bustime.mta.info/).<br><br> **Type:** `string` <br> **Default value:** `none`
| `timeFormat`     | *Optional* Use 12 or 24 hour format. <br><br> **Possible values:** `12` or `24` <br> **Default value:** uses value of _config.timeFormat_
| `maxEntries`     | *Optional* The maximum number of buses to display. <br><br> **Possible values:** `1` to `10` <br> **Default value:** `5`
| `updateInterval` | *Optional* How often to check for the next bus. <br><br> **Type:** `int`<br> **Default value:** `60000` milliseconds (1 minute)
