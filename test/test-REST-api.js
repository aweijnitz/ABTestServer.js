var should = require('should');
var util = require('util');
var request = require('superagent');


var appConf = require('../conf/appConfig-unitTests.json');
var log4js = require('log4js');
log4js.configure('./conf/log4js-unitTests.json');
var logger = log4js.getLogger('TEST');

var app = require('../app')(appConf, log4js);


describe('Basic API', function () {

    var server = null;

    var port = ((appConf.server.port || process.env.PORT) || 8080);
    var baseURL = 'http://127.0.0.1:' + port + '/tests';

    var variantName0 = '0';
    var variantName1 = '1';
    var variant0url = function (testID) {
        return baseURL + '/view/' + testID + '/' + variantName0;
    };
    var variant1url = function (testID) {
        return baseURL + '/view/' + testID + '/' + variantName1;
    };

    var test1url = function (testID) {
        return baseURL + '/' + testID;
    };
    var convert0url = function (testID) {
        return baseURL + '/convert/' + testID + '/' + variantName0;
    };
    var convert1url = function (testID) {
        return baseURL + '/convert/' + testID + '/' + variantName1;
    };

    // Test helper
    var newObj = function newObj(cb) {
        return (request
            .put(baseURL)
            .end(function (res) {
                cb(res.body.testID);
            }));
    };

    // start a test server
    before(function () {
        server = app.listen(app.get('port'), function () {
            //logger.info('Server listening on port ' + server.address().port);
        });
    });

    after(function () {
        server.close();
    });

    it('Should return empty object when GETting a non-existent test', function (done) {
        request
            .get(test1url())
            .end(function (res) {
                //  console.log(util.inspect(res.body));
                (res.status).should.equal(404);
                res.body.should.be.empty;
                done();
            });
    });

    it('Should return testID when PUTing to ' + baseURL, function (done) {
        request
            .put(baseURL)
            .end(function (res) {
                //console.log(util.inspect(res.body));
                (res.status).should.equal(200);
                res.body.testID.should.be.ok;
                done();
            });
    });


    it('Should return test object with status when GETting a existent test', function (done) {
        newObj(function (testId) {

            request
                .post(variant1url(testId))
                .end(function (res) {
                    (res.status).should.equal(200);

                    request
                        .post(variant1url(testId))
                        .end(function (res) {
                            (res.status).should.equal(200);

                            request
                                .post(convert1url(testId))
                                .end(function (res) {
                                    (res.status).should.equal(200);

                                    request
                                        .get(test1url(testId))
                                        .end(function (res) {
                                            // console.log(util.inspect(res.body, { colors: true }));

                                            (res.status).should.equal(200);
                                            (res.body.variantViews[1]).should.equal(2);
                                            (res.body.conversions[1]).should.equal(1);

                                            (res.body.stats.isSignificant).should.be.false;
                                            (res.body.stats.isSignificantForB).should.be.false;
                                            (res.body.stats.isSignificantForA).should.be.false;

                                            done();
                                        });
                                });
                        });
                });
        });

    });


    it('Should add one to view count when POSTing a variant view', function (done) {
        newObj(function (testId) {
            request
                .post(variant0url(testId))
                .end(function (res) {
//                    console.log(util.inspect(res.body) + ' '+testId);

                    (res.status).should.equal(200);
                    res.body.testID.should.equal(testId);
                    (res.body.variantViews[0]).should.equal(1);
                    done();
                });
        });

    });


    it('Should FAIL when trying to add to non-existing test', function (done) {
        var testId = 'failMe';
        request
            .post(variant0url(testId))
            .end(function (res) {

                (res.status).should.equal(404);
                (res.body.error).should.equal(-1);
                done();
            });

    });

    it('Should add one to convert count when POSTing a variant conversion', function (done) {
        newObj(function (testId) {
            request
                .post(convert0url(testId))
                .end(function (res) {
                    (res.status).should.equal(200);
                    res.body.testID.should.equal(testId);
                    (res.body.conversions[0]).should.equal(1);
                    done();
                });
        });
    });


});
