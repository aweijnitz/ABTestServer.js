var express = require('express');
var stat = require('../lib/statmath.js');

var router = express.Router();

var db = express.db;
if(db == null || typeof db == 'undefined')
    console.log("NO DB");

// Make empty new AB test object, with given test id
var newTest = function (testID) {
    return { testID: testID, variantViews: [0, 0], conversions: [0 ,0] }
};

// Fetch test object from DB
var getObj = function getObj(id) {
    return db.findOne({ testID: id });
};

// View +1 on given variant. Lazily defines new test object and add first count, if no test found in DB
var incView = function(testID, variant) {
    var o =  getObj(testID);
    if(!o)
        o = newTest(testID);
    o.variantViews[variant]++;
    db.upsert(o);
    return o;
};


// Conversion +1 on given variant. Lazily defines new test object and add first count, if no test found in DB
var incConversion = function(testID, variant) {
    var o =  getObj(testID);
    if(!o)
        o = newTest(testID);
    o.conversions[variant]++;
    db.upsert(o);
    return o;
};


/* GET test status. */
router.get('/:testid?', function(req, res) {
    var id = req.params.testid; // can be undefined, then all running tests listed
    var o = getObj(id);
    if(!!o) {
        o.stats = {
            isSignificant: stat.isSignificant(o),
            isSignificantForA: stat.isSignificantForA(o),
            isSignificantForB: stat.isSignificantForB(o),
            changePercent: stat.changePercent(o),
            probabilityOfB: stat.probabilityOfB(o)
        };
    }
    id ? res.send(o).end() : res.send({}).end();
});


/* POST increase count on a given test variant [0 or 1]. */
router.post('/view/:testid/:variant', function(req, res) {
    res.send(incView(req.params.testid, req.params.variant)).end()
});


/* POST increase conversion count for a test variant. */
router.post('/convert/:testid/:variant', function(req, res) {
    res.send(incConversion(req.params.testid, req.params.variant)).end()
});



module.exports = router;
