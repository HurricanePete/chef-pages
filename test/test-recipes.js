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
	return bookIds[Math.floor(Math.random() * bookIds.length)];
}

function generateCategories() {
	const categories = ['quick', 'protein', 'vegetarian', 'comfort'];
	return categories[Math.floor(Math.random() * categories.length)];
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

describe('GET endpoint', function() {
	before(function() {
		return runServer();
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

	it('should return all recipes on GET', function() {
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