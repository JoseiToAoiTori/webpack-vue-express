const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const morgan = require('morgan');

const express = require('express'); // Web server
const sirv = require('sirv'); // Static file middleware
const session = require('express-session'); // Session storage middleware
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const log = require('another-logger'); // Logging utility
const config = require('./config');

const sequelize = require('./models').sequelize;

// Routes for non-frontend things
const api = require('./routes/api');
const auth = require('./routes/auth');

const indexPage = fs.readFileSync(path.join(config.publicDir, 'index.html'));

// Define the main application
const app = express({
	// Send the vue application for any route that isn't an API route, rendering a Not Found page if needed.
	onNoMatch: (request, response) => response.end(indexPage),
});

// Set up global middlewares
app.use(
	// Logging
	morgan('dev'),
	// Session storage
	session({
		secret: config.session.secret,
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 72 * 60 * 60 * 1000,
		},
		store: new SequelizeStore({
			db: sequelize,
			checkExpirationInterval: 15 * 60 * 1000, // The interval at which to cleanup expired sessions in milliseconds.
			expiration: 72 * 60 * 60 * 1000, // The maximum age (in milliseconds) of a valid session.
		}),
	}),
	// Static assets
	sirv(config.publicDir, {
		dev: true, // Turn off dev mode in prod
		brotli: true,
	}),
);

// Register the API routes and auth routes
app.use('/api', api);
app.use('/auth', auth);

// Synchronize sequelize models and start the server
sequelize.sync().then(() => {
	if (config.https) {
		// If we're using HTTPS, create an HTTPS server
		const httpsOptions = {
			key: config.https.key,
			cert: config.https.cert,
		};
		const httpsApp = https.createServer(httpsOptions, app.handler);
		httpsApp.listen(config.https.port, () => {
			log.success(`HTTPS listening on port ${config.https.port}`);
		});
		// The HTTP server will just redirect to the HTTPS server
		http.createServer((req, res) => {
			res.writeHead(301, {Location: `https://${req.headers.host}${req.url}`});
			res.end();
		}).listen(config.port, () => {
			log.success(`HTTP redirect listening on port ${config.port}`);
		});
	} else {
		app.listen(config.port, () => {
			log.success(`Listening on port ${config.port}~!`);
		});
	}
});
