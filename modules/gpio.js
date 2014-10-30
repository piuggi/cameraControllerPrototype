//Module for interfacing and setting up the PI GPIO Pins

var gpio = require('onoff').Gpio;
var exec = require('child_process').exec


function Gpio(options,cb){
  this.options = options
}
