var express = require('express');
var stat = require('../lib/statmath.js');
var util = require('util');

var router = express.Router();

var db = express.db;
if (db == null || typeof db == 'undefined')
    console.log("NO DB");


var testCounter = 0;

// Make empty new AB test object, with given test id
var newTest = function (testID) {
    return { testID: testID, variantViews: [0, 0], conversions: [0 , 0] }
};


// Create new tst and save. Returns test.
var createTest = function () {
    var tst = newTest(('t' + testCounter++) + (new Date().getTime()));
    db.upsert(tst);
    return tst;
};

// Fetch test object from DB
var getObj = function getObj(id) {
    return db.findOne({ testID: id });
};

// View +1 on given variant. Lazily defines new test object and add first count, if no test found in DB
var incView = function (testID, variant) {
    var o = getObj(testID);
    if (!o)
        o = newTest(testID);
    o.variantViews[variant]++;
    db.update(o);
    return o;
};


// Conversion +1 on given variant. Lazily defines new test object and add first count, if no test found in DB
var incConversion = function (testID, variant) {
    var o = getObj(testID);
    if (!o)
        o = newTest(testID);
    o.conversions[variant]++;
    db.update(o);
    return o;
};


/* GET test status. */
router.get('/:testid?', function (req, res) {
    var id = req.params.testid; // might be undefined, then all running tests listed
    var o = getObj(id);
    if (!!o) {
        o.stats = {
            isSignificant: stat.isSignificant(o),
            isSignificantForA: stat.isSignificantForA(o),
            isSignificantForB: stat.isSignificantForB(o),
            changePercent: stat.changePercent(o),
            probabilityOfB: stat.probabilityOfB(o)
        };
        res.send(o).end();
    }
    else
        res.status(404).send({}).end();

});


router.put('/', function (req, res) {
    res.send({ testID: createTest().testID });
});

/* POST increase count on a given test variant [0 or 1]. */
router.post('/view/:testid/:variant', function (req, res) {
    var o = null;
    try {
        o = incView(req.params.testid, req.params.variant);
        res.send(o).end()
    } catch (err) {
        res.status(404).send({ error: -1, msg: 'No such test ' + req.params.testid}).end();
    }
});


/* POST increase conversion count for a test variant. */
router.post('/convert/:testid/:variant', function (req, res) {
    res.send(incConversion(req.params.testid, req.params.variant)).end()
});


module.exports = router;
