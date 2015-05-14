let express = require('express'),
    http = require('http'),
    path = require('path'),
    app = express(),
    publicDir = path.resolve(path.join('build','public')),
    config = require('../../config');

console.log(`Express serving public directory '${publicDir}'.`);

app.get('/', (req, res) => res.sendFile(path.join(publicDir, 'index.html')));

app.use(express.static(publicDir, { maxAge:24*60*60*1000 }));

var server = app.listen(config.DEVLOPEMENT_PORT,()=>{
    console.log(`Express server listening on port ${server.address().port}.`);
});