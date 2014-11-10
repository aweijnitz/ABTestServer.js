var should = require('should');
var util = require('util');

var appConf = require('../conf/appConfig-unitTests.json');
var log4js = require('log4js');
log4js.configure('./conf/log4js-unitTests.json');
// log4js.clearAppenders();
// log4js.restoreConsole();
var logger = log4js.getLogger('TEST');
var app = require('../app')(appConf, log4js);

describe('An empty test', function () {
    var server = null;

    before(function() {
        server = app.listen(app.get('port'), function () {
            logger.info('Server listening on port ' + server.address().port);
        });
    });

    after(function() {
        server.close();
    });

    it('Should test that some function works', function (done) {
        (true).should.be.true;
        done();
    });

    it('Should test each funtionality', function (done) {
        ({ someProp: 'a value'}).should.be.ok;
        done();
    });

});
