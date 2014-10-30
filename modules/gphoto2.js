/*

gphoto2

TODO: add system checks to kill processes per environment

*/

var spawn = require('child_process').spawn
var exec  = require('child_process').exec
var os = require('os')


var tethered={},
    videoStream={}

tethered.connected = false
videoStream.connected = false


function Gphoto2(options,cb){
	this.stuff = 'stuff'
    console.log('gphoto helper starting')

	//if mac osx
	console.log('\n\r'+"Operating System: "+os.platform()+'\n\r')
	var killAll = exec('killall PTPCamera',function (error, stdout, stderr) {
		if(error) console.log(error)
		if(stdout) console.log(stdout)
		if(stderr) console.log(stderr)
		var autoDetect = exec('gphoto2 --auto-detect',function (_error, _stdout, _stderr) {
			if(_error) 	console.log(_error)
			if(_stdout) console.log(_stdout)
			if(_stderr) console.log(_stderr)
			setTimeout(cb,3000) //give some time to detect camera
		})
	})
}

Gphoto2.prototype.liveview = function(cb){
	    if(tethered.connected){
	      tethered.kill('SIGTERM')
	    }

	    if(!videoStream.connected){
    //if mac osx
		var killAll = exec('killall PTPCamera',function (error, stdout, stderr) {
			 if(error) console.log(error)
			 if(stdout) console.log(stdout)
			 if(stderr) console.log(stderr)
		     videoStream = spawn('ffserver',['-f','/etc/ffserver.conf','|','gphoto2', '--capture-movie'])
			 videoStream.connected = true

		     //videoStream.on('error',function())
		     videoStream.stdout.setEncoding('utf8')
		     videoStream.stdout.on('data',function(data){
			      console.log(data)
		     })
		     videoStream.stderr.setEncoding('utf8')
		     videoStream.stderr.on('data', function(data){
			     console.log(data)
		     })
		     videoStream.on('close',function(code,signal){
		          console.log('[ videoStream: '+videoStream.pid+' ] terminated due to receipt of signal '+signal);
		          videoStream.connected = false
		     })

		    cb(null,videoStream)
	      })
	    }else{
	      cb('Warn: Video Stream Already Connected',videoStream)
	    }
	}

Gphoto2.prototype.tether = function(cb){
	    if(videoStream.connected){
	      videoStream.kill('SIGTERM')
	    }
	    if(!tethered.connected){

	      //run conditional check on OS to kill Camera linkers
	      var killAll = exec('killall PTPCamera',function (error, stdout, stderr) {
		      if(error)
		      	console.log(error)

		      if(stdout)
		      	console.log(stdout)

		      if(stderr)
		      	console.log(stderr)


		      tethered = spawn('gphoto2',['--capture-tethered','--force-overwrite'])
		      tethered.connected = true

		      //tethered.on('error',function())
		      tethered.stdout.setEncoding('utf8')
		      tethered.stdout.on('data',tetheredStd)
		      tethered.stderr.setEncoding('utf8')
		      tethered.stderr.on('data',tetheredStd)

		      tethered.on('close',function(code,signal){
		        console.log('[ tethering: '+tethered.pid+' ] ')
		        console.log('Terminated with Signal [ '+signal+' ] Code [ '+code+' ]');
		        tethered.connected = false
		      })

		      cb(null,tethered)
	      })
	    }else{
	      //console.log('[gphoto2][warn] Tether Already Connected')
	      cb('[gphoto2][warn][Warn] Already Tethered to Camera',tethered)
	    }
	}


Gphoto2.prototype.get = function(obj,cb){

}

Gphoto2.prototype.set = function(obj,cb){

}

//handle the tethered stderr and stdout
function tetheredStd(data){
	console.log(data)

	//handle messages
	if( data.indexOf('.jpg')>-1 || data.indexOf('.JPG')>-1 ){
	  if(data.indexOf('Deleting')>-1){
	    console.log('Detected Photo')
	    var s = data.indexOf("'")
	    var e = data.indexOf("'",s+1)
	    //get the filename by finding the first and second '
	    var filename = data.substr(s+1,e-s-1)
	    console.log("Found file: "+filename)
	    //handleFile(filename)
	  }
	}else if(data.indexOf('*** Error')>-1){
	  /*
	  if(!bAttemptedReconnect){ //if we haven't tried reconnecting yet

	    reconnect(function(){
	      bAttemptedReconnect = true;
	    }); //try to reconnect
	  }
      */
	  console.error(data)
	}

}





/*
**
**   Export the Module for Including
**
*/

module.exports = Gphoto2
