var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {

  var gphoto2 = req.app.get('gphoto2')

  gphoto2.tether(function(err,tethered){
    if(err) console.error(err)
  })
  res.jsonp({trigger:true});
});

module.exports = router;
