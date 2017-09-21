exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://localhost/chef-pages';
exports.PORT = process.env.PORT || 8080;

exports.SERVER_URL = 'https://sleepy-ravine-11904.herokuapp.com/recipes/' || 'http://localhost:8080/recipes/'