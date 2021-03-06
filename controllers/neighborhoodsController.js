var db = require('../models');

// GET /api/neighborhoods
//get all neighborhoods
function neighborhoods_index(req, res){
  db.Neighborhood.find({}, function(err, neighborhoods) {
    if(err){
      return console.log("index error: " + err);
    }

    res.json(neighborhoods);
  });
}
// GET /api/neighborhoods/:hoodId
//get one specific neighborhood
function neighborhoods_show(req, res) {
  db.Neighborhood.findOne({_id: req.params.hoodId}, function(err, foundNeighborhood){
    res.json(foundNeighborhood);
  });
}


module.exports = {
  neighborhoods_index: neighborhoods_index,
  neighborhoods_show: neighborhoods_show
}
