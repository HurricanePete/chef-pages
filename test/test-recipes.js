const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('Chef Pages', function() {
	before(function() {
		return runServer();
	});
	after(function() {
		return closeServer()
	});

	it('should return static assets', function() {
		return chai.request('http://localhost:8080')
		.get('/')
		.then(function(res) {
			res.should.be.html;
			res.should.have.status(200);
		});
	});
});