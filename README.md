# chef-pages
Fullstack Capstone project for Thinkful - create, manage, and view user-made cookbooks and recipes

## Table of Contents

- [API Docs](#API_Docs)
- [Screenshots](#screenshots)
- [Summary](#summary)
- [Technologies](#technologies)

## API Docs

The RESTful API serves five endpoints:

- A GET request to /recipes will return a list ofr all existing recipes in the database
- A GET request to /recipes/:recipeID will return an individual recipe with the matching ID if it exists
- A POST request to /recipes will add a recipe to the database with the supplied information and return the created recipe
- A PUT request to /recipes/:recipeID will edit an existing recipe with the matching ID and return the updated recipe
- A DELETE request to /recipes/:recipeID will delete an individual recipe with the matching ID if it exists

## Screenshots 

![Home Screen](/public/images/search-screenshot.jpg "Home Screen")

![Results](/public/images/results-frame-screenshot.jpg "Results Screen")

![Post](/public/images/create-screenshot.jpg "Create Recipe Screen")

## Summary

Chef Pages is an app that allows users to explore, create, store, and edit recipes on a shared database. From the initial screen, users can search the database of recipes and filters results by name, categories (custom, user supplied filters), and by book number (a feature that will eventually be in place to allow users to compile collections of recipes). Upon selecting a recipe from the search results, users can then edit/update and delete it. Finally, upon selecting the 'Create Recipe' button, users can add their own recipes to the shared database. In the 'Create Recipe' form, name, ingredients, and prep are all required fields. The notes, books, and categories fields are optional. Users can also choose to supply a URL to an original recipe if it came from elsewhere on the internet.

## Technologies

- HTML
- CSS
- JavaScript
- jQuery
- Node.js
