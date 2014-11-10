var should = require('should');
var util = require('util');


describe('datasource', function () {

    var db = new (require('../lib/datasource.js'))({dbFile: null});


    it('Should create new object in db if previously not present (upsert -> insert)', function () {
        var obj = {a: 'a', testID: '0'};
        var o = db.upsert(obj);
        o.should.have.property.id;

    });


    it('Should update  object in db if previously present (upsert -> update)', function () {
        var obj = {b: 'b', testID: '1'};
        var v0 = db.upsert(obj);            // Commit new object
        v0.b = 'c';                         // Modify it
        db.upsert(v0);                      // Commit
        var check = db.findOne({testID: '1'});
        check.c = 'new item';               // Modify it
        db.upsert(check);                   // Commit
        check = db.findOne({testID: '1'});
        (check.c).should.be.ok;             // Verify
    });

    it('Should return empty array for non-existent objects (find)', function () {
        var query = { testID: 'x'};
        db.find(query).should.be.empty;
    });

    it('Should return obj array for existent objects (find)', function () {
        var obj = {b: 'b', testID: '11'};
        var v0 = db.upsert(obj);            // Commit new object
        var query = { testID: '11'};
        (db.find(query).length).should.equal(1)
    });

    it('Should return null for non-existent objects (findOne)', function () {
        var query = { testID: 'x'};
        (db.findOne(query) == null).should.be.true;
    });

    it('Should return object, given a native id (get)', function () {
        var obj = {b: 'b', testID: '111'};
        var o0 = db.upsert(obj);            // Commit new object
        var o1 = db.get(o0.id);
        o1.should.equal.o0;
    });

    it('Should return null, given a native non-existent id (get)', function () {
        (db.get(1234) == null).should.be.true;
    });


});