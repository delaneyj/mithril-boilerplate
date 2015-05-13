let css = require('../stylus/app.styl'),
    AppMount = require('./app.js');

var appDiv = document.createElement('div');
appDiv.id = 'app';
document.body.appendChild(appDiv);
AppMount(appDiv);