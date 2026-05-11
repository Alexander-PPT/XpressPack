const EventEmitter = require('events');

class ShipmentEventEmitter extends EventEmitter {}

module.exports = new ShipmentEventEmitter();
