require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

const {router} = require('./edamam');

const {DATABASE_URL, PORT} = require('./config');
const {Recipe} = require('./models');

const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());
app.use(express.static('public'));

app.use('/edamam/', router);

mongoose.Promise = global.Promise;

app.get('/recipes', (req, res) => {
	Recipe
	.find()
	.exec()
	.then(recipes => {
		res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
		res.setHeader("Pragma", "no-cache");
		res.setHeader("Expires", "0");
		res.json(recipes.map(recipe => recipe.recipeRepr()));
	}) 
	.catch(err => {
		console.error(err);
		res.status(500).json({error: 'Something went wrong'});
	});
});

app.get('/recipes/:id', (req, res) => {
	Recipe
	.findById(req.params.id)
	.exec()
	.then(recipe => {
		res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
		res.setHeader("Pragma", "no-cache");
		res.setHeader("Expires", "0");
		res.json(recipe.recipeRepr())
	})
	.catch(err => {
		console.error(err);
		res.status(500).json({error: 'Something went wrong'});
	});
});

app.post('/recipes', (req, res) => {
	const requiredFields = ['name', 'ingredients', 'prep'];
	for (let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`
			console.error(message);
			return res.status(400).send(message);
		}
	}

	Recipe
	.create({
		filters: {
			userId: req.body.filters.userId,
			bookIds: req.body.filters.bookIds,
			categories: req.body.filters.categories
		},
		name: req.body.name,
		link: req.body.link,
		ingredients: req.body.ingredients,
		prep: req.body.prep,
		notes: req.body.notes
	})
	.then(recipe => res.status(201).json(recipe.recipeRepr()))
	.catch(err => {
		console.error(err);
		res.status(500).json({error: 'Something went wrong'});
	});
});

app.delete('/recipes/:id', (req, res) => {
	Recipe
	.findByIdAndRemove(req.params.id)
	.exec()
	.then(() => {
		res.status(204).json({message: 'success'});
	})
	.catch(err => {
		console.error(err);
		res.status(500).json({error: 'Something went wrong'});
	});
});

app.put('/recipes/:id', (req, res) => {
	if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    	res.status(400).json({
    		error: 'Request path id and request body id values must match'
    	});
  	}
	const updated = {};
	const updateableFields = ['filters', 'name', 'link', 'ingredients', 'prep', 'notes'];
	updateableFields.forEach(field => {
		if (field in req.body) {
			updated[field] = req.body[field];
		}
	});

	Recipe
	.findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
	.exec()
	.then(updatedPost => res.status(201).json(updatedPost.recipeRepr()))
	.catch(err => res.status(500).json({message: 'Something went wrong'}));
});

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {runServer, app, closeServer};
