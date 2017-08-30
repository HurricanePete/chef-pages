const mongoose = require('mongoose');

const recipeSchema = mongoose.Schema({
  filters: {
    userId: Number,
    bookIds: [Number], 
    categories: [String]
  },
  name: {type: String, required: true},
  link: String,
  ingredients: {type: [String], required: true},
  prep: {type: String, required: true},
  notes: String
});

recipeSchema.methods.recipeRepr = function() {
  return {
    id: this._id,
    name: this.name,
    ingredients: this.ingredients,
    prep: this.prep,
    link: this.link,
    books: this.filters.bookIds,
    tags: this.filters.categories,
    notes: this.notes
  };
};

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = {Recipe};
