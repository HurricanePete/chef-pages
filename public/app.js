'use strict';

var SERVER_URL = 'https://sleepy-ravine-11904.herokuapp.com/recipes/';
var API_URL = 'https://sleepy-ravine-11904.herokuapp.com/edamam/';

if (window.location.host === 'localhost:8080') {
    SERVER_URL = 'http://localhost:8080/recipes/';
    API_URL = 'http://localhost:8080/edamam/';
}

var state = {
    request: 'get',
    previousPage: null,
    history: null,
    search: 'edamam',
    putId: null,
    edamamPostObject: null,
    ingredientsCount: 1,
    booksCount: 1,
    categoriesCount: 1,
    edamamFrom: 0,
    edamamTo: 15
};

//polyfill to replace includes for IE compatibility
function doesContain(array, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].indexOf(value) !== -1) {
            return true;
        } else {
            return false;
        }
    }
}

if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

function setSearch(term) {
    state.search = term;
}

function setReturn() {
    state.previousPage = state.request;
}

function edamamResultsNav(direction) {
    if (direction === 'add') {
        state.edamamTo += 15;
        state.edamamFrom += 15;
    } else if (direction === 'minus') {
        state.edamamTo -= 15;
        state.edamamFrom -= 15;
    }
}

function addCount(item) {
    state[item + 'Count']++;
}

function minusCount(item) {
    state[item + 'Count']--;
}

function minusCountHandler(target) {
    if (target.closest('ul').attr("id") === 'ingredients') {
        minusCount('ingredients');
    } else if (target.closest('ul').attr("id") === 'books') {
        minusCount('books');
    } else if (target.closest('ul').attr("id") === 'categories') {
        minusCount('categories');
    }
}

function resetCounts() {
    state.ingredientsCount = 1;
    state.booksCount = 1;
    state.categoriesCount = 1;
}

function zeroCounts() {
    state.ingredientsCount = 0;
    state.booksCount = 0;
    state.categoriesCount = 0;
}

//extra line hides the submit button if no ingredient inputs are present
function ingredientsCountCheck(target) {
    var INGREDIENTS_MESSAGE_TEMPLATE = 'Must have at least one ingredient in order to submit';
    if (target.closest('ul').find('span.empty-ingredients').text() === INGREDIENTS_MESSAGE_TEMPLATE) {
        return;
    } else if (state.ingredientsCount < 1) {
        target.closest('ul').append('<li class="message"><span class="empty empty-ingredients">' + INGREDIENTS_MESSAGE_TEMPLATE + '</span>' + '<i class="fa fa-plus-circle fa-lg ingredients-adder" aria-hidden="true"></i></li>');
        target.closest('form').find('button.post-submit').addClass('hidden');
        target.closest('form').find('button.put-submit').addClass('hidden');
    }
}

function booksCountCheck(target) {
    var BOOKS_MESSAGE_TEMPLATE = 'Press the Add icon to add books';
    if (target.closest('ul').find('span.empty-books').text() === BOOKS_MESSAGE_TEMPLATE) {
        return;
    } else if (state.booksCount < 1) {
        target.closest('li').before('<li class="message"><span class="empty empty-books">' + BOOKS_MESSAGE_TEMPLATE + '</span>' + '<i class="fa fa-plus-circle fa-lg books-adder" aria-hidden="true"></i></li>');
    }
}

function categoriesCountCheck(target) {
    var CATEGORIES_MESSAGE_TEMPLATE = 'Press the Add icon to add category tags';
    if (target.closest('ul').find('span.empty-categories').text() === CATEGORIES_MESSAGE_TEMPLATE) {
        return;
    } else if (state.categoriesCount < 1) {
        target.closest('li').before('<li class="message"><span class="empty empty-categories">' + CATEGORIES_MESSAGE_TEMPLATE + '</span>' + '<i class="fa fa-plus-circle fa-lg categories-adder" aria-hidden="true"></i><li>');
    }
}

function countHandler(ingredientsTarget, booksTarget, categoriesTarget) {
    ingredientsCountCheck(ingredientsTarget);
    booksCountCheck(booksTarget);
    categoriesCountCheck(categoriesTarget);
}

function allowPostSubmit(item, target) {
    if (item === 'ingredients' && state.request === 'post') {
        target.closest('form').find('button.post-submit').removeClass('hidden');
    } else if (item === 'ingredients' && state.request === 'put') {
        target.closest('form').find('button.put-submit').removeClass('hidden');
    }
}

function messageRemover(item, target) {
    if (state[item + 'Count'] > 0) {
        //if messageRemover is called for ingredients it will reveal the submit button again
        allowPostSubmit(item, target);
        target.closest('ul').find('li.message').remove();
    }
}

//normalizes text in order to compare inputs to recipe data
function stringToLowerCase(name) {
    return name.toLowerCase();
}

function inputToLowerCase(inputArray) {
    if (Array.isArray(inputArray)) {
        var result = inputArray.map(function (item) {
            if (typeof item === 'number') {
                return item;
            } else if (item === null) {
                return false;
            } else {
                return item.toLowerCase();
            }
        });
        return result;
    } else {
        return;
    }
}

//returns a random recipe if a search returns zero results
function randomOnEmpty(data) {
    return ['empty', data[Math.floor(Math.random() * data.length)]];
}

//lines 25 through 79 create a search function for results when all recipes are returned from the database
function filterAll(input, data) {
    var results = data.filter(function (recipe) {
        var caseName = stringToLowerCase(recipe.name);
        var caseTags = inputToLowerCase(recipe.tags);
        var caseBooks = inputToLowerCase(recipe.books);
        if (doesContain(caseName, input) || doesContain(caseBooks, input) || doesContain(caseTags, input)) {
            return recipe;
        }
    });
    if (results.length < 1) {
        results = randomOnEmpty(data);
    }
    return results;
}

function filterName(input, data) {
    var results = data.filter(function (recipe) {
        if (doesContain(stringToLowerCase(recipe.name), input)) {
            return recipe;
        }
    });
    if (results.length < 1) {
        results = randomOnEmpty(data);
    }
    return results;
}

function filterBook(input, data) {
    var results = data.filter(function (recipe) {
        if (doesContain(inputToLowerCase(recipe.books), input)) {
            return recipe;
        }
    });
    if (results.length < 1) {
        results = randomOnEmpty(data);
    }
    return results;
}

function filterCategory(input, data) {
    var results = data.filter(function (recipe) {
        if (doesContain(inputToLowerCase(recipe.tags), input)) {
            return recipe;
        }
    });
    if (results.length < 1) {
        results = randomOnEmpty(data);
    }
    return results;
}

function resultSwitcher(data) {
    var searchTerm = stringToLowerCase($('#search').val());
    var filter = $('#filter').val();
    switch (filter) {
        case 'all':
            displayRecipes(filterAll(searchTerm, data));
            break;
        case 'name':
            displayRecipes(filterName(searchTerm, data));
            break;
        case 'books':
            displayRecipes(filterBook(searchTerm, data));
            break;
        case 'categories':
            displayRecipes(filterCategory(searchTerm, data));
    }
}

function ingredientsList(list) {
    var htmlList = "";
    list.forEach(function (item) {
        htmlList += '<li>' + item + '</li>';
    });
    return htmlList;
}

function inputAdder(target, type, nameId) {
    target.closest('ul').append('<li class="js-added">' + '<input type="' + type + '"" name="' + nameId + '" id="' + nameId + '">' + '<div class="add-remove"><span><i class="fa fa-minus-circle fa-lg js-input-delete" aria-hidden="true"></i></span>' + '<span><i class="fa fa-plus-circle fa-lg ' + nameId + '-adder" aria-hidden="true"></i></span></div>' + '</li>');
}

function displayListAdder(target, nameId) {
    target.append('<li class="js-added" id="' + nameId + '"></li>');
}

function displayLinkAdder(target, nameId) {
    target.append('<li id="' + nameId + '" class="js-added-link">' + '<button class="js-display-link-button"></button>' + '</li>');
}

function displayLinkHandler(array, target, nameId) {
    if (nameId === "ingredients") {
        displayListAdder(target, nameId);
    } else {
        displayLinkAdder(target, nameId);
    }
}

function formToArray(target, submitValue) {
    if (target.length !== 0) {
        target.each(function () {
            if ($(this).val() === '') {
                return;
            }
            submitValue.push($.trim($(this).val()));
        });
    } else {
        return;
    }
}

//adds and fills the appropriate amount of HTML list elements from result arrays
function formAdditionsHandler(array, type, nameId) {
    if (array === null || array.length === 0 || array[0] === null || array[0] === '') {
        state[nameId + 'Count'] = 0;
    } else if (array.length > 0) {
        var additions = 0;
        for (var i = 1; i <= array.length; i++) {
            inputAdder($('#post-form').find('.' + nameId + '-seed'), type, nameId);
            additions++;
        }

        var _loop = function _loop(_i2) {
            $('ul.' + nameId + '-field').find('input').each(function (item) {
                $(this).val(array[_i2]);
                _i2++;
                addCount(nameId);
            });
            _i = _i2;
        };

        for (var _i = 0; _i <= additions; _i++) {
            _loop(_i);
        }
    }
}

//adds and fills the appropriate amount of HTML list elements from result array for individual recipe display
function displayAdditionsHandler(array, nameId) {
    if (array.length > 0) {
        var additions = 0;
        for (var i = 1; i <= array.length; i++) {
            displayListAdder($('#display').find('.js-display-' + nameId), nameId);
            additions++;
        }

        var _loop2 = function _loop2(_i4) {
            $('ul.js-display-' + nameId).find('li').each(function (item) {
                $(this).text(array[_i4]);
                _i4++;
            });
            _i3 = _i4;
        };

        for (var _i3 = 0; _i3 <= additions; _i3++) {
            _loop2(_i3);
        }
    }
}

//adds and fills the appropriate amount of HTML button elements from result arrays
function displayLinkContentHandler(array, nameId) {
    if (array.length > 0) {
        var additions = 0;
        for (var i = 1; i <= array.length; i++) {
            displayLinkAdder($('#display').find('.js-display-' + nameId), nameId);
            additions++;
        }

        var _loop3 = function _loop3(_i6) {
            $('ul.js-display-' + nameId).find('button').each(function (item) {
                $(this).text(array[_i6]);
                _i6++;
            });
            _i5 = _i6;
        };

        for (var _i5 = 0; _i5 <= additions; _i5++) {
            _loop3(_i5);
        }
    }
}

function clearEmptyLink() {
    if ($('.js-display-link').text() === "") {
        $('.js-display-link').addClass('hidden');
        $('.no-link').removeClass('hidden');
    }
}

function clearEmptyNotes() {
    if ($('.js-display-notes').text() === "") {
        $('.js-display-notes').addClass('hidden');
        $('.no-notes').removeClass('hidden');
    }
}

function clearEmptyBooks() {
    var target = $('.js-display-books').find('button');
    if (target.text() === "") {
        target.addClass('hidden');
        $('.no-books').removeClass('hidden');
    }
}

function clearEmptyCategories() {
    var target = $('.js-display-categories').find('button');
    if (target.text() === "") {
        target.addClass('hidden');
        $('.no-categories').removeClass('hidden');
    }
}

//removes empty html elements from the individual results display and replaces them with a message
function clearEmptyFields() {
    clearEmptyLink();
    clearEmptyNotes();
    clearEmptyBooks();
    clearEmptyCategories();
}

//resets the .hidden elements in order to display individual results normally
function resetEmptyFields() {
    $('.js-display-link').removeClass('hidden');
    $('.no-link').addClass('hidden');
    $('.js-display-notes').removeClass('hidden');
    $('.no-notes').addClass('hidden');
    $('.js-display-books').removeClass('hidden');
    $('.no-books').addClass('hidden');
    $('.js-display-categories').removeClass('hidden');
    $('.no-categories').addClass('hidden');
}

function resetForm(target) {
    target.find('input').val('');
    target.find('textarea').val('');
    target.find('.js-added').remove();
    target.find('.message').remove();
}

function resetDisplay(target) {
    target.find('p').val('');
    target.find('p.js-display-prep').removeClass('choppingboard-error').text('');
    target.find('.js-added').remove();
    target.find('.js-added-link').remove();
    resetEmptyFields();
}

function replaceInitialInputs(target) {
    resetCounts();
    var fields = ['ingredients', 'books', 'categories'];
    for (var i = 0; i < fields.length; i++) {
        inputAdder(target.find('li.' + fields[i] + '-seed'), 'text', fields[i]);
    }
}

//fills the POST form upon selecting the update button
function populateForm(data) {
    resetForm($('.post-form'));
    zeroCounts();
    $('#name').val(data.name);
    $('#link').val(data.link);
    formAdditionsHandler(data['ingredients'], 'text', 'ingredients');
    $('textarea#prep').val(data.prep);
    $('input#notes').val(data.notes);
    formAdditionsHandler(data['books'], 'text', 'books');
    formAdditionsHandler(data['tags'], 'text', 'categories');
    countHandler($('li.ingredients-seed'), $('li.books-seed'), $('li.categories-seed'));
}

//fills the individual results display pane upon selection
function populateDisplay(data) {
    state.putId = data.id;
    resetDisplay($('div.js-display'));
    $('.recipe-id').text(data.id);
    $('.js-display-name').text(data.name);
    $('.js-display-link').text(data.link).attr('href', data.link);
    displayAdditionsHandler(data['ingredients'], 'ingredients');
    $('.js-display-prep').text(data.prep);
    $('.js-display-notes').text(data.notes);
    displayLinkContentHandler(data['books'], 'books');
    displayLinkContentHandler(data['tags'], 'categories');
    clearEmptyFields();
}

function recipePasser(response) {
    $('div.chopping-board-loader').addClass('hidden');
    var prepBlock = response.instructions.join('\r\n\n');
    $('.js-display-prep').removeClass('choppingboard-error');
    $('.js-display-prep').text(prepBlock);
    state.edamamPostObject.prep = prepBlock;
}

function failMessage(response) {
    $('div.chopping-board-loader').addClass('hidden');
    var prepBlock = "We're very sorry, but we were unable to automatically find instructions for this recipe." + " This generally happens when the source website doesn't clearly identify their recipe sections." + "\n\n" + "If you still wish to add this recipe, please manually input these instructions on the next screen using the source link provided.";
    $('.js-display-prep').text(prepBlock);
    $('.js-display-prep').addClass('choppingboard-error');
}

//uses the choppingsboard.recipes api to scrape and parse the directions from the original source website
function recipePrepHandler(source) {
    var settings = {
        method: 'get',
        url: 'https://choppingboard.recipes/api/v0/recipe?key=63dfd3bb758a602be06ef2790d9926e6&q=' + source,
        success: recipePasser,
        error: failMessage
    };
    $.ajax(settings);
}

function populateEdamamDisplay(data) {
    var recipe = {
        uri: data[0].uri,
        name: data[0].label,
        link: data[0].url,
        prep: null,
        notes: null,
        books: null,
        ingredients: data[0].ingredientLines,
        tags: data[0].dietLabels
    };
    recipePrepHandler(data[0].url);
    state.putId = recipe.uri;
    state.edamamPostObject = recipe;
    resetDisplay($('div.js-display'));
    $('.js-display-prep').text('');
    $('.recipe-id').text(recipe.uri);
    $('.js-display-name').text(recipe.name);
    $('.js-display-link').text(recipe.link).attr('href', recipe.link);
    displayAdditionsHandler(recipe.ingredients, 'ingredients');
    displayLinkContentHandler(recipe.tags, 'categories');
    recipe.prep = $('.js-display-prep').html();
    clearEmptyFields();
}

//populates the search screen with results after search submission
function displayRecipes(data) {
    if (data[0] === 'empty') {
        $('.js-results').append('<div class="no-results"><p>Sorry, your search didn\'t return any results. Here\'s a random recipe to cheer you up.</p></div>' + '<div class="results-frame">' + '<p class="js-id hidden">' + data[1].id + '</p>' + '<h3>' + data[1].name + '</h3>' + '<p><a href="' + data[1].link + '" target="_blank">' + data[1].link + '</a></p>' + '<label for="ingredients">Ingredients</label>' + '<br>' + '<div id="ingredients">' + '<ul class="ingredients-list">' + ingredientsList(data[1].ingredients) + '</ul>' + '</div>' + '</div>');
        return false;
    }
    data.forEach(function (item) {
        $('.js-results').append('<div class="results-frame">' + '<p class="js-id hidden">' + item.id + '</p>' + '<h3>' + item.name + '</h3>' + '<p><a href="' + item.link + '" target="_blank">' + item.link + '</a></p>' + '<label for="ingredients">Ingredients</label>' + '<br>' + '<div id="ingredients">' + '<ul class="ingredients-list">' + ingredientsList(item.ingredients) + '</ul>' + '</div>' + '</div>');
    });
}

function displayEdamam(data) {
    $('div.loader').addClass('hidden');
    if (data['hits'].length === 0) {
        $('.js-results').append('<div class="no-results"><p>Sorry, your search didn\'t return any results.</p></div>');
        return false;
    }
    var verify = data['hits'].filter(function (item) {
        return item.recipe.ingredientLines.length > 1;
    });
    verify.forEach(function (item) {
        $('.js-results').append('<div class="results-frame">' + '<p class="js-id hidden">' + item.recipe.uri + '</p>' + '<h3>' + item.recipe.label + '</h3>' + '<p><a href="' + item.recipe.url + '" target="_blank">' + item.recipe.url + '</a></p>' + '<label for="ingredients">Ingredients</label>' + '<br>' + '<div id="ingredients">' + '<ul class="ingredients-list">' + ingredientsList(item.recipe.ingredientLines) + '</ul>' + '</div>' + '</div>');
    });
    $('div.edamam-nav').removeClass('hidden');
    if (state.edamamFrom > 0) {
        $('button.edamam-prev').removeClass('hidden');
    } else {
        $('button.edamam-prev').addClass('hidden');
    }
}

function displayGet(target) {
    target.find('div.js-get').removeClass('hidden');
    target.find('div.js-post').addClass('hidden');
    target.find('div.js-display').addClass('hidden');
    target.find('section.js-resultWrap').removeClass('hidden');
}

function displayPost(target) {
    target.find('h3.post-title').text('Add A Recipe');
    target.find('div.js-post').removeClass('hidden');
    target.find('div.js-get').addClass('hidden');
    target.find('div.js-display').addClass('hidden');
    target.find('section.js-resultWrap').addClass('hidden');
    target.find('button.post-submit').removeClass('hidden');
    target.find('button.put-submit').addClass('hidden');
}

function displayPut(target) {
    target.find('h3.post-title').text('Edit A Recipe');
    target.find('div.js-post').removeClass('hidden');
    target.find('div.js-get').addClass('hidden');
    target.find('div.js-display').addClass('hidden');
    target.find('button.post-submit').addClass('hidden');
    target.find('button.put-submit').removeClass('hidden');
}

function displayDisplay(target) {
    target.find('div.js-post').addClass('hidden');
    target.find('div.js-get').addClass('hidden');
    target.find('div.js-display').removeClass('hidden');
    target.find('section.js-resultWrap').addClass('hidden');
    if (state.search === "edamam") {
        target.find('button.edamam-add').removeClass('hidden');
        target.find('button.put-button').addClass('hidden');
        target.find('button.delete-button').addClass('hidden');
    } else {
        target.find('button.edamam-add').addClass('hidden');
        target.find('button.put-button').removeClass('hidden');
        target.find('button.delete-button').removeClass('hidden');
    }
}

//handles DOM rendering by hiding and revealing elements as users navigate the app
function stateToggle(state, target) {
    $('div.message').addClass('hidden');
    if (state.request === 'get') {
        displayGet(target);
    } else if (state.request === 'post') {
        displayPost(target);
    } else if (state.request === 'put') {
        displayPut(target);
    } else if (state.request === 'display') {
        displayDisplay(target);
    }
}

function afterDelete() {
    stateToggle(state, $('body'));
    $('div.message').removeClass('hidden');
    $('div.message').find('p:first').text('Recipe Deleted!');
}

function afterPost() {
    stateToggle(state, $('body'));
    $('div.message').removeClass('hidden');
    $('div.message').find('p:first').text('Recipe Added!');
}

$(document).ready(function (event) {
    if (document.cookie === 'landing-page=false') {
        $('section.landing').addClass('hidden');
    } else {
        $('section.landing').removeClass('hidden');
    }
});

$('a.landing-dismiss').click(function (event) {
    event.preventDefault();
    $('section.landing').addClass('hidden');
    document.cookie = "landing-page=false";
});

$('button.local').click(function (event) {
    event.preventDefault();
    setSearch('local');
    setReturn();
    state.request = 'get';
    stateToggle(state, $('body'));
    $('section.js-resultWrap').addClass('hidden');
    $('.js-results').empty();
    $('legend').html("Search " + "<span>Chef Pages</span>" + " For Recipes");
    $('select.filter').removeClass('hidden');
    $('input.search').attr('placeholder', 'You can filter your search with the dropdown');
});

$('button.edamam').click(function (event) {
    event.preventDefault();
    setSearch('edamam');
    setReturn();
    state.request = 'get';
    stateToggle(state, $('body'));
    $('section.js-resultWrap').addClass('hidden');
    $('.js-results').empty();
    $('legend').html("Search " + "<span>the Web</span>" + " For Recipes");
    $('select.filter').addClass('hidden');
    $('input.search').attr('placeholder', 'Powered by Edamam');
});

$('ul.ingredients-field').on('click', 'i.ingredients-adder', function (event) {
    event.preventDefault();
    addCount('ingredients');
    inputAdder($(this), 'text', 'ingredients');
    messageRemover('ingredients', $(this));
});

$('ul.books-field').on('click', 'i.books-adder', function (event) {
    event.preventDefault();
    addCount('books');
    inputAdder($(this), 'text', 'books');
    messageRemover('books', $(this));
});

$('ul.categories-field').on('click', 'i.categories-adder', function (event) {
    event.preventDefault();
    addCount('categories');
    inputAdder($(this), 'text', 'categories');
    messageRemover('categories', $(this));
});

$('.js-post').on('click', '.js-input-delete', function (event) {
    event.preventDefault();
    minusCountHandler($(this));
    countHandler($('li.ingredients-seed'), $('li.books-seed'), $('li.categories-seed'));
    $(this).closest('li').remove();
});

$('#get-form').submit(function (event) {
    event.preventDefault();
    setReturn();
    state.request = 'get';
    stateToggle(state, $('body'));
    $('.js-results').empty();
    var settings = void 0;
    if (state.search === 'local') {
        settings = {
            url: SERVER_URL,
            type: 'get',
            success: resultSwitcher
        };
        $('div.edamam-nav').addClass('hidden');
    } else if (state.search === 'edamam') {
        settings = {
            url: API_URL,
            type: 'post',
            data: JSON.stringify({
                "search": stringToLowerCase($('#search').val()),
                "from": state.edamamFrom,
                "to": state.edamamTo
            }),
            contentType: 'application/json',
            dataType: 'json',
            success: displayEdamam
        };
        $('div.edamam-nav').addClass('hidden');
        $('div.loader').removeClass('hidden');
    }
    $.ajax(settings);
});

$('.edamam-search').submit(function (event) {
    event.preventDefault();
    setReturn();
    state.request = 'get';
    stateToggle(state, $('body'));
    $('.js-results').empty();
});

$('.post-submit').click(function (event) {
    event.preventDefault();
    if ($('input#name').val() === '') {
        alert('Recipe must have a name');
        return;
    }
    var data = {
        "filters": {
            "userId": 1111111,
            "bookIds": [],
            "categories": []
        },
        "name": $('#name').val(),
        "link": $('#link').val(),
        "ingredients": [],
        "prep": $('#prep').val(),
        "notes": $('#notes').val()
    };
    formToArray($('ul.books-field').find('input'), data.filters.bookIds);
    formToArray($('ul.categories-field').find('input'), data.filters.categories);
    formToArray($('ul.ingredients-field').find('input'), data.ingredients);
    var settings = {
        url: SERVER_URL,
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: populateDisplay
    };
    setReturn();
    state.request = 'display';
    return new Promise(function (resolve, reject) {
        $.post(settings);
        resolve(afterPost());
        reject(function (err) {
            console.log(err);
        });
    });
});

$('div.js-display').on('click', '.delete-button', function (event) {
    event.preventDefault();
    var id = $('.recipe-id').text();
    var settings = {
        url: SERVER_URL + id,
        type: 'delete'
    };
    setReturn();
    state.request = 'get';
    return new Promise(function (resolve, reject) {
        $.ajax(settings);
        resolve(afterDelete());
        reject(function (err) {
            console.log(err);
        });
    });
});

$('div.js-display').on('click', '.put-button', function (event) {
    event.preventDefault();
    setReturn();
    state.request = "put";
    stateToggle(state, $('body'));
    var id = $('.recipe-id').text();
    var settings = {
        url: SERVER_URL + id,
        type: 'get',
        success: populateForm
    };
    return new Promise(function (resolve, reject) {
        $.ajax(settings);
        resolve($('div.js-results').find(this).closest('div').remove());
        reject(function (err) {
            console.log(err);
        });
    });
});

$('button.put-submit').click(function (event) {
    event.preventDefault();
    var data = {
        "id": state.putId,
        "filters": {
            "userId": 1111111,
            "bookIds": [],
            "categories": []
        },
        "name": $('#name').val(),
        "link": $('#link').val(),
        "ingredients": [],
        "prep": $('#prep').val(),
        "notes": $('#notes').val()
    };
    formToArray($('ul.books-field').find('input'), data.filters.bookIds);
    formToArray($('ul.categories-field').find('input'), data.filters.categories);
    formToArray($('ul.ingredients-field').find('input'), data.ingredients);
    var settings = {
        url: SERVER_URL + state.putId,
        type: 'put',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: populateDisplay
    };
    setReturn();
    state.request = 'display';
    return new Promise(function (resolve, reject) {
        $.ajax(settings);
        resolve(stateToggle(state, $('body')));
        reject(function (err) {
            console.log(err);
        });
    });
    state.putId = null;
});

$('a.js-getButton').click(function (event) {
    location.reload();
    event.preventDefault();
    setReturn();
    state.request = 'get';
    $('.js-results').empty();
    stateToggle(state, $('body'));
});

$('a.js-postButton').click(function (event) {
    event.preventDefault();
    resetCounts();
    resetForm($('#post-form'));
    replaceInitialInputs($('body'));
    setReturn();
    state.request = 'post';
    stateToggle(state, $('body'));
});

$('div.js-results').on('click', 'div.results-frame', function (event) {
    event.preventDefault();
    resetDisplay($('div.js-display'));
    setReturn();
    state.request = 'display';
    stateToggle(state, $('body'));
    var id = $('div.js-results').find(this).closest('div').find('p:first').text();
    state.putId = id;
    var settings = void 0;
    if (state.search === 'local') {
        settings = {
            url: SERVER_URL + id,
            type: 'get',
            success: populateDisplay
        };
    } else if (state.search === 'edamam') {
        settings = {
            url: API_URL + 'single',
            type: 'post',
            data: JSON.stringify({
                "singleUrl": state.putId
            }),
            contentType: 'application/json',
            dataType: 'json',
            success: populateEdamamDisplay
        };
        $('div.chopping-board-loader').removeClass('hidden');
    }
    $.ajax(settings);
});

$('button.return-button').click(function (event) {
    event.preventDefault();
    state.history = state.request;
    if (state.request === 'display' && state.history === 'display') {
        state.previousPage = 'get';
    } else if (state.previousPage === 'put' && state.history === 'post') {
        state.previousPage = 'display';
    }
    state.request = state.previousPage;
    state.previousPage = state.history;
    stateToggle(state, $('body'));
});

$('div.js-display').on('click', 'button.js-display-link-button', function (event) {
    event.preventDefault();
    $('.js-results').empty();
    var search = $(this).text();
    var filter = $(this).closest('li').attr('id');
    setReturn();
    state.request = 'get';
    stateToggle(state, $('body'));
    $('#search').val(search);
    $('#filter').val(filter);
    $.ajax({ url: SERVER_URL, type: 'get', success: resultSwitcher });
});

$('button.dropbtn').click(function (event) {
    event.preventDefault();
    $('div.dropdown-content').toggleClass('hidden');
});

// Close the dropdown menu if the user clicks outside of it
window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {
        $('div.dropdown-content').addClass('hidden');
    }
};

$('button.edamam-add').click(function (event) {
    event.preventDefault();
    populateForm(state.edamamPostObject);
    setReturn();
    state.request = 'post';
    stateToggle(state, $('body'));
});

$('span.logo').click(function (event) {
    location.reload();
});

$('button.edamam-prev').click(function (event) {
    event.preventDefault();
    $('.js-results').empty();
    edamamResultsNav('minus');
    var settings = {
        url: API_URL,
        type: 'post',
        data: JSON.stringify({
            "search": stringToLowerCase($('#search').val()),
            "from": state.edamamFrom,
            "to": state.edamamTo
        }),
        contentType: 'application/json',
        dataType: 'json',
        success: displayEdamam
    };
    $('div.edamam-nav').addClass('hidden');
    $('div.loader').removeClass('hidden');
    if (state.edamamFrom > 0) {
        $('button.edamam-prev').removeClass('hidden');
    } else {
        $('button.edamam-prev').addClass('hidden');
    }
    $.ajax(settings);
});

$('button.edamam-next').click(function (event) {
    event.preventDefault();
    $('.js-results').empty();
    edamamResultsNav('add');
    var settings = {
        url: API_URL,
        type: 'post',
        data: JSON.stringify({
            "search": stringToLowerCase($('#search').val()),
            "from": state.edamamFrom,
            "to": state.edamamTo
        }),
        contentType: 'application/json',
        dataType: 'json',
        success: displayEdamam
    };
    $('div.edamam-nav').addClass('hidden');
    $('div.loader').removeClass('hidden');
    if (state.edamamFrom > 0) {
        $('button.edamam-prev').removeClass('hidden');
    } else {
        $('button.edamam-prev').addClass('hidden');
    }
    $.ajax(settings);
});

$('div.message').click(function (event) {
    event.preventDefault();
    $('div.message').addClass('hidden');
});