var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var util = require('util');

var setupServer = function setupServer(appConf, log4js) {
    var logger = log4js.getLogger('app');
    var app = express();

    logger.info('Configuring server ');
    logger.warn('SERVER IN MODE: ' + app.get('env'));
    app.set('port', (appConf.server.port || process.env.PORT) || 8080);
    express.db = new (require('./lib/datasource'))(appConf.db);



    logger.info('Configuring view engine');
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'hjs');
//    app.use(favicon());


    logger.info('Configuring logging engine');
    if (app.get('env') === 'development') {
        var devFormat = ':method :url - Status: :status Content-length: :content-length';
        app.use(log4js.connectLogger(log4js.getLogger("http"), { format: devFormat, level: 'auto' }));
    } else
        app.use(log4js.connectLogger(log4js.getLogger("http"), { level: 'auto' }));


    var webroot = appConf.app.webroot || path.join(__dirname, 'public');
    logger.info('Setting webroot to ' + webroot);
    app.use(express.static(webroot));


    logger.info('Setting application routes');
    var index = require('./routes/index');
    var api = require('./routes/api');
    app.use('/', index);
    app.use('/tests', api);


/// catch 404 and forwarding to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

/// error handlers

// development error handler
// will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

// production error handler
// no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });

    return app;
};


//module.exports = setupServer(appConf, logger);
module.exports = setupServer;