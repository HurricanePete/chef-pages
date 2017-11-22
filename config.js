exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://localhost/chef-pages';
exports.PORT = process.env.PORT || 8080;
exports.EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
exports.EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;