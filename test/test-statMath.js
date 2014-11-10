var should = require('should');
var util = require('util');
var stat = require('../lib/statmath.js');


describe('Statistical functions', function () {


    it('Should show significance. Variant B better. A: 100:1000 B: 700:1000', function (done) {
        var testResult = {
            testID: 'abtest',
            variantViews: [1000, 1000],
            conversions: [100, 700]
        };

        //(stat.isSignificantDebugInfo(testResult)).should.be.true;
        (stat.isSignificant(testResult)).should.be.true;
        (stat.isSignificantForA(testResult)).should.be.false;
        (stat.isSignificantForB(testResult)).should.be.true;

        done();
    });


    it('Should show significance. Variant A better. A: 700:1000 B: 100:1000', function (done) {
        var testResult = {
            testID: 'abtest',
            variantViews: [1000, 1000],
            conversions: [700, 100]
        };

        //(stat.isSignificantDebugInfo(testResult)).should.be.true;
        (stat.isSignificant(testResult)).should.be.true;
        (stat.isSignificantForA(testResult)).should.be.true;
        (stat.isSignificantForB(testResult)).should.be.false;

        done();
    });


    it('Should show NO significance for A: 100:1000 B: 100:1000', function (done) {
        var testResult = {
            testID: 'abtest',
            variantViews: [1000, 1000],
            conversions: [100, 100]
        };

        //(stat.isSignificantDebugInfo(testResult)).should.be.false;
        (stat.isSignificant(testResult)).should.be.false;
        (stat.isSignificantForA(testResult)).should.be.false;
        (stat.isSignificantForB(testResult)).should.be.false;

        done();
    });

    it('Should show variant B probability around 92% for A: 100:1000 B: 120:1000', function (done) {
        var testResult = {
            testID: 'abtest',
            variantViews: [1000, 1000],
            conversions: [100, 120]
        };

        //(stat.isSignificantDebugInfo(testResult)).should.be.false;
        (stat.isSignificant(testResult)).should.be.false;
        (stat.probabilityOfB(testResult)).should.be.approximately(0.923, 0.1);
        done();
    });

    it('Should show variant B probability around 41% for A: 500:1000 B: 495:1000', function (done) {
        var testResult = {
            testID: 'abtest',
            variantViews: [1000, 1000],
            conversions: [500, 495]
        };

        //(stat.isSignificantDebugInfo(testResult)).should.be.false;
        (stat.isSignificant(testResult)).should.be.false;
        (stat.probabilityOfB(testResult)).should.be.approximately(0.4115, 0.1);

        done();
    });


});