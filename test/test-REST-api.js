var should = require('should');
var util = require('util');
var request = require('superagent');


var appConf = require('../conf/appConfig-unitTests.json');
var log4js = require('log4js');
log4js.configure('./conf/log4js-unitTests.json');
// log4js.clearAppenders();
// log4js.restoreConsole();
var logger = log4js.getLogger('TEST');
var app = require('../app')(appConf, log4js);


describe('Basic API', function () {

    var server = null;

    var port = ((appConf.server.port || process.env.PORT) || 8080);
    var baseURL = 'http://127.0.0.1:' + port + '/tests/';

    var testID = 'test213';
    var variantName0 = '0';
    var variantName1 = '1';
    var variant0url = baseURL + 'view/' + testID + '/' + variantName0;
    var variant1url = baseURL + 'view/' + testID + '/' + variantName1;

    var test1url = baseURL + testID;
    var convert0url = baseURL + 'convert/' + testID + '/' + variantName0;
    var convert1url = baseURL + 'convert/' + testID + '/' + variantName1;

    // start a test server
    before(function() {
        server = app.listen(app.get('port'), function () {
            logger.info('Server listening on port ' + server.address().port);
        });
    });

    after(function() {
        server.close();
    });

    it('Should return empty object when GETting a non-existent test', function (done) {
        request
            .get(test1url)
            .end(function (res) {
                //  console.log(util.inspect(res.body));
                (res.status).should.equal(200);
                res.body.should.be.empty;
                done();
            });
    });

    it('Should return test object with status when GETting a existent test', function (done) {

        request
            .post(variant1url)
            .end(function (res) {
                (res.status).should.equal(200);

                request
                    .post(variant1url)
                    .end(function (res) {
                        (res.status).should.equal(200);

                        request
                            .post(convert1url)
                            .end(function (res) {
                                (res.status).should.equal(200);

                                request
                                    .get(test1url)
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


    it('Should add one to view count when POSTing a variant view', function (done) {
        request
            .post(variant0url)
            .end(function (res) {
                (res.status).should.equal(200);
                res.body.testID.should.equal(testID);
                (res.body.variantViews[0]).should.equal(1);
                done();
            });
    });


    it('Should add one to convert count when POSTing a variant conversion', function (done) {
        request
            .post(convert0url)
            .end(function (res) {
                //console.log(util.inspect(res.body));
                (res.status).should.equal(200);
                res.body.testID.should.equal(testID);
                (res.body.conversions[0]).should.equal(1);
                done();
            });
    });


});
