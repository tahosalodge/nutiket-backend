const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const routes = require('routes');
const errorHandlers = require('utils/errorHandlers');
const config = require('./config');

const app = express();
mongoose.connect(config.mongoUrl);

app.use(cors);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', config.port);

app.use('/', routes);
app.use(errorHandlers.notFound);
if (config.env === 'development') {
  app.use(errorHandlers.developmentErrors);
  app.use(morgan('dev'));
}

app.use(errorHandlers.productionErrors);
