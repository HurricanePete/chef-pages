require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const {app, runServer, closeServer} = require('../server');
const {Recipe} = require('../models');
const {DATABASE_URL} = require('../config');

const should = chai.should();

chai.use(chaiHttp);

function trueFalse() {
	return Boolean(Math.round(Math.random()))
}

function seedRecipeData() {
	console.info('seeding recipe data');
	const seedData = [];
	for (let i=1; i<=10; i++) {
		seedData.push(generateRecipeData());
	}
	return Recipe.insertMany(seedData);
}

function generateName() {
	const names = ['Exciting Eggs', 'Powerful Pasta', 'Fantastic French Toast', 'Titillating Thai Noodles'];
	return names[Math.floor(Math.random() * names.length)];
}

function generateIngredients() {
	const ingredients = ['Eggs', 'Chicken', 'Pork', 'Noodles', 'Frogs', 'curry'];
	let ingredientList = [];
	for (i=0; i<2; i++) {
		ingredientList.push(ingredients[Math.floor(Math.random() * ingredients.length)]);
	}
	return ingredientList;
}

function generatePrep() {
	const preps = [
		'Do some baking',
		'Boil some of them, fry some more, and eat the rest raw',
		'Bring water to a boil and boil the noodles for awhile',
		'Grill that sucker until it\'s the way you like it'
	]
	return preps[Math.floor(Math.random() * preps.length)];
}

function generateLink() {
	const links = [
		'www.eatingwell.com', 
		'www.ilovemeatballs.com', 
		'www.savyspaghetti.com', 
		'www.froglegs.com',
		'www.tinythai.com'
		];
	return links[Math.floor(Math.random() * links.length)];
}

function generateBooks() {
	const bookIds = [1111111, 2222222, 3333333];
	return [bookIds[Math.floor(Math.random() * bookIds.length)]];
}

function generateCategories() {
	const categories = ['quick', 'protein', 'vegetarian', 'comfort'];
	return [categories[Math.floor(Math.random() * categories.length)]];
}

function generateUser() {
	const userIds = [9999999, 8888888, 7777777];
	return userIds[Math.floor(Math.random() * userIds.length)];
}

function generateNotes() {
	const notes = [
		'This is a test note',
		'This is another test notes',
		'Testing, testing, testing',
		'The most delicious thing in the world!'
	];
	return notes[Math.floor(Math.random() * notes.length)];

}

function generateRecipeData() {
	return {
		filters: {
			userId: generateUser(),
			bookIds: generateBooks(),
			categories: generateCategories()
		},
		name: generateName(),
		link: generateLink(),
		ingredients: generateIngredients(),
		prep: generatePrep(),
		notes: generateNotes()
	}
}

function tearDownDb() {
	console.warn('Deleting database');
	return mongoose.connection.dropDatabase();
}

describe('Chef Pages', function() {
	before(function() {
		return runServer();
	});
	after(function() {
		return closeServer()
	});

	it('should return static assets', function() {
		return chai.request(app)
		.get('/')
		.then(function(res) {
			res.should.be.html;
			res.should.have.status(200);
		});
	});
});


describe('Chef Pages API resource', function() {
	before(function() {
		return runServer(DATABASE_URL);
	});
	beforeEach(function() {
		return seedRecipeData();
	});
	afterEach(function() {
		return tearDownDb();
	});
	after(function() {
		return closeServer()
	});

	describe('GET endpoint', function() {
		it('should return all recipes', function() {
			let res;
			return chai.request(app)
			.get('/recipes')
			.then(function(_res) {
				res = _res;
				res.should.have.status(200);
				res.body.should.have.length.of.at.least(1);
				return Recipe.count()
			})
			.then(function(count) {
				res.body.length.should.equal(count);
			});
		});

		it('should return recipes with the correct fields', function() {
			let resRecipes;
			return chai.request(app)
			.get('/recipes')
			.then(function(res) {
				res.should.have.status(200);
				res.should.be.json;
				res.body.should.be.a('array');
				res.body.should.have.length.of.at.least(1);
				res.body.forEach(function(recipe) {
					recipe.should.be.a('object');
					recipe.should.include.keys('name', 'ingredients', 'prep', 'link', 'books', 'tags', 'notes');
				});
				resRecipes = res.body[0];
				return Recipe.findById(resRecipes.id);
			})
			.then(function(recipe) {
				resRecipes.id.should.equal(recipe.id);
				resRecipes.name.should.equal(recipe.name);
				resRecipes.ingredients.should.deep.equal(recipe.ingredients);
				resRecipes.prep.should.equal(recipe.prep);
				resRecipes.link.should.equal(recipe.link);
				resRecipes.books.should.deep.equal(recipe.filters.bookIds);
				resRecipes.tags.should.deep.equal(recipe.filters.categories);
				resRecipes.notes.should.equal(recipe.notes);
			})
		})
	});

	describe('POST enpoint', function() {
		it('should add a recipe with the correct fields', function() {
			const newRecipe = generateRecipeData();
			return chai.request(app)
			.post('/recipes')
			.send(newRecipe)
			.then(function(res) {
				res.should.have.status(201);
				res.should.be.json;
				res.body.should.be.a('object');
				res.body.should.include.keys('name', 'ingredients', 'prep', 'link', 'books', 'tags', 'notes');
				res.body.should.not.be.null;
				res.body.name.should.equal(newRecipe.name);
				res.body.ingredients.should.deep.equal(newRecipe.ingredients);
				res.body.prep.should.equal(newRecipe.prep);
				res.body.link.should.equal(newRecipe.link);
				res.body.books.should.deep.equal(newRecipe.filters.bookIds);
				res.body.tags.should.deep.equal(newRecipe.filters.categories);
				res.body.notes.should.equal(newRecipe.notes);
			})
		})
	})

	describe('DELETE endpoint', function() {
		it('should delete recipe with the supplied id', function() {
			let recipe;
			return Recipe
				.findOne()
				.exec()
				.then(function(_rec) {
					recipe = _rec;
					return chai.request(app)
					.delete(`/recipes/${recipe.id}`);
				})
				.then(function(res) {
					res.should.have.status(204)
					return Recipe.findById(recipe.id).exec();
				})
				.then(function(_rec) {
					should.not.exist(_rec);
				});
		});
	});

	describe('PUT endpoint', function() {
		it('should update a recipe correctly', function() {
			const updateData = {
				filters: {
					bookIds: [1357900],
					categories: ['New category']
				},
				name: 'Testing Recipe',
				link: 'www.tesrecipes.com',
				ingredients: ['These', 'Are', 'My', 'Test', 'Ingredients'],
				prep: 'Combine ingredients into a sentance',
				notes: 'Note updates!'
			}
			return Recipe
				.findOne()
				.exec()
				.then(function(recipe) {
					updateData.id = recipe.id
					return chai.request(app)
					.put(`/recipes/${recipe.id}`)
					.send(updateData);
				})
				.then(function(res) {
					res.should.have.status(201);
					return Recipe.findById(updateData.id).exec();
				})
				.then(function(rec) {
					rec.name.should.equal(updateData.name);
					rec.ingredients.should.deep.equal(updateData.ingredients);
					rec.prep.should.equal(updateData.prep);
					rec.link.should.equal(updateData.link);
					rec.filters.bookIds.should.deep.equal(updateData.filters.bookIds);
					rec.filters.categories.should.deep.equal(updateData.filters.categories);
					rec.notes.should.equal(updateData.notes);
				});
		});
	});

});

describe('Edamam proxy server', function() {
	before(function() {
		return runServer(DATABASE_URL);
	});
	after(function() {
		return closeServer()
	});

	describe('POST endpoint for search', function() {
		it('should return some recipes', function() {
			const searchTerm = 'chicken';
			let res;
			return chai.request(app)
			.post('/edamam/')
			.set('Content-Type', 'application/json')
			.send(JSON.stringify({
				'search': searchTerm,
				'from': 0,
				'to': 5
			}))
			.then(function(res) {
				const parse = JSON.parse(res.text);
				res.should.have.status(200);
				parse.should.be.a('object');
				parse.should.not.be.null;
				parse.q.should.equal(searchTerm);
			})
		});
	});

	describe('POST endpoint for single recipe', function() {
		it('should return a single recipes', function() {
			const searchSite = 'http://www.edamam.com/ontologies/edamam.owl#recipe_7bf4a371c6884d809682a72808da7dc2';
			let res;
			return chai.request(app)
			.post('/edamam/single')
			.set('Content-Type', 'application/json')
			.send(JSON.stringify({
				'singleUrl': searchSite
			}))
			.then(function(res) {
				const parse = JSON.parse(res.text);
				res.should.have.status(200);
				parse.should.be.a('array');
				parse.should.have.length.of.at.least(1);
				parse[0].uri.should.equal(searchSite);				
			})
		});
	});
});