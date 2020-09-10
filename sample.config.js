const path = require('path');

const port = process.env.PORT || 4567;

module.exports = {
	host: `http://localhost${this.port === 80 ? '' : `:${port}`}`,
	port,
	publicDir: path.join(__dirname, 'public'),
	// SQLite database information
	db: {
		path: __dirname,
		filename: 'sqlite.db',
	},
	// Session management options
	session: {
		secret: 'CHANGEME', // Secret for cookies
		table: 'sessions', // The table where session info is stored
	},
};
