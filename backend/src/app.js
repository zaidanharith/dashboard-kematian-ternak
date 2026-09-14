const dns = require('dns');
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

const express = require('express');
const apiRoutes = require('./routes/api');
const internalRoutes = require('./routes/internal.routes');

const app = express();

app.use(express.json());
app.use('/api', apiRoutes);
app.use('/internal', internalRoutes);

module.exports = app;
