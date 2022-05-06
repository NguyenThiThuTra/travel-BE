const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//Router
const userRoutes = require('./routes/userRoutes');
const homestayRoutes = require('./routes/homestayRoutes');
const roomRoutes = require('./routes/roomRoutes');
const locationRoutes = require('./routes/locationRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const categoryRoutes = require('./routes/categoryRouter');
const commentRoutes = require('./routes/commentRouter');
const favouriteRoutes = require('./routes/favouriteRoutes');
const testRoutes = require('./test/test.router');

const globalErrHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();
const path = require('path');
app.use('/uploads', express.static(__dirname + '/public/uploads'));
//setup
//morgan
app.use(logger('dev'));
//cookieParser
app.use(cookieParser());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Allow Cross-Origin requests
app.use(cors());

// Set security HTTP headers
app.use(helmet());

// Limit request from the same API
const limiter = rateLimit({
  max: 15000,
  windowMs: 60 * 60 * 1000,
  message: 'Too Many Request from this IP, please try again in an hour',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(
  express.json({
    limit: '15kb',
  })
);

// Data sanitization against Nosql query injection
app.use(mongoSanitize());

// Data sanitization against XSS(clean user input from malicious HTML code)
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// render static files
app.get('/', function (req, res) {
  var homePage = path.join(__dirname, 'home.html');
  res.sendFile(homePage);
});
// Routes
app.use('/api/v1/test', testRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/homestays', homestayRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/destinations', destinationRoutes);
app.use('/api/v1/favourites', favouriteRoutes);
app.use('/api/v1/category', categoryRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/payment', paymentRoutes);
//end Routers

// handle undefined Routes
app.use('*', (req, res, next) => {
  const err = new AppError(404, 'fail', 'undefined route');
  next(err, req, res, next);
});

app.use(globalErrHandler);

module.exports = app;
