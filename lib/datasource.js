var loki = require("lokijs");

var collectionName = 'abtests';

var DataStore = function (options) {
    this.dbfile = options.dbFile;

    // TODO: Check if file present, of so, load DB from file
    this.lokiDb = new loki(options.dbFile);
    this.conn = this.lokiDb.addCollection(collectionName);
}

DataStore.prototype.getConnection = function () {
    return this.conn;
};

DataStore.prototype.saveState = function (cb) {
    this.lokiDb.save(this.dbFile, cb);
};

DataStore.prototype.loadState = function (cb) {
    var me = this;
    this.lokiDb.loadDatabase(this.dbFile, cb);
};

/**
 * Updates existing db item or creates new item in db if passed object not previously in db
 * @param testObj
 * @returns the passed object
 */
DataStore.prototype.upsert = function (testObj) {
    var o =  this.find({ testID: testObj.testID });
    if(o.length > 0) {
        return this.conn.update(testObj);
    } else {
        return this.conn.insert(testObj);
    }

    //return o;
};

/**
 * Find by db native id. Returns object or null
 * @param id
 * @returns {*}
 */
DataStore.prototype.get = function (id) {
    return this.conn.get(id);
};

/**
 * Returns result Array or empty Array
 * @param query
 * @returns {*}
 */
DataStore.prototype.find = function (query) {
    return this.conn.find(query);
};

/**
 * Returns first entry in result array or null
 * @param query
 * @returns {*}
 */
DataStore.prototype.findOne = function (query) {
    var res = this.find(query);
    if(res.length > 0)
        return res[0];
    else
        return null;
};


module.exports = DataStore;