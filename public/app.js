'use strict';

var SERVER_URL = 'https://sleepy-ravine-11904.herokuapp.com/recipes/';

if (window.location.host === 'localhost:8080') {
    SERVER_URL = 'http://localhost:8080/recipes/';
}

var state = {
    request: 'get',
    previousPage: null,
    history: null,
    putId: null,
    ingredientsCount: 1,
    booksCount: 1,
    categoriesCount: 1

    //polyfill to replace includes for IE compatibility
};function doesContain(array, value) {
    if (array.indexOf(value) === -1) {
        return false;
    } else {
        return true;
    }
}

function setReturn() {
    state.previousPage = state.request;
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
            return item.toLowerCase();
        });
        return result;
    } else {
        return;
    }
}

//returns a random recipe if a search returns zero results
function randomOnEmpty(data) {
    return ['empty', data[Math.floor(Math.random() * (data.length + 1))]];
}

//lines 25 through 79 create a search function for results when all recipes are returned from the database
function filterAll(input, data) {
    var results = data.filter(function (recipe) {
        var caseName = stringToLowerCase(recipe.name);
        var caseTags = inputToLowerCase(recipe.tags);
        if (doesContain(caseName, input) || doesContain(recipe.books, input) || doesContain(caseTags, input)) {
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
        if (doesContain(recipe.books, parseInt(input, 10))) {
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
    if (array.length === 0 || array[0] === null || array[0] === '') {
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
    target.find('.js-added').remove();
    target.find('.js-added-link').remove();
    resetEmptyFields();
}

function replaceInitialInputs(target) {
    resetCounts();
    var fields = ['ingredients', 'books', 'categories'];
    for (var i = 0; i < fields.length; i++) {
        var type = void 0;
        if (fields[i] === books) {
            type = 'number';
        } else {
            type = 'text';
        }
        inputAdder(target.find('li.' + fields[i] + '-seed'), type, fields[i]);
    }
}

//fills the POST form upon selecting the update button
function populateForm(data) {
    resetForm($('.post-form'));
    zeroCounts();
    $('#name').val(data.name);
    $('#link').val(data.link);
    //$('#ingredients').val(data.ingredients[0]);
    formAdditionsHandler(data['ingredients'], 'text', 'ingredients');
    $('textarea#prep').val(data.prep);
    $('input#notes').val(data.notes);
    formAdditionsHandler(data['books'], 'number', 'books');
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

//populates the search screen with results after search submission
function displayRecipes(data) {
    if (data[0] === 'empty') {
        $('.js-results').append('<div class="no-results"><p>Sorry, your search didn\'t return any results. Here\'s a random recipe to cheer you up.</p></div>' + '<div class="results-frame">' + '<p class="js-id hidden">' + data[1].id + '</p>' + '<h3>' + data[1].name + '</h3>' + '<p><a href="' + data[1].link + '" target="_blank">' + data[1].link + '</a></p>' + '<label for="ingredients">Ingredients</label>' + '<br>' + '<div id="ingredients">' + '<ul class="ingredients-list">' + ingredientsList(data[1].ingredients) + '</ul>' + '</div>' + '<label for="prep">Preparation</label>' + '<br>' + '<p id="prep">' + data[1].prep + '</p>' + '</div>');
        return false;
    }
    data.forEach(function (item) {
        $('.js-results').append('<div class="results-frame">' + '<p class="js-id hidden">' + item.id + '</p>' + '<h3>' + item.name + '</h3>' + '<p><a href="' + item.link + '" target="_blank">' + item.link + '</a></p>' + '<label for="ingredients">Ingredients</label>' + '<br>' + '<div id="ingredients">' + '<ul class="ingredients-list">' + ingredientsList(item.ingredients) + '</ul>' + '</div>' + '<label for="prep">Preparation</label>' + '<br>' + '<p id="prep">' + item.prep + '</p>' + '</div>');
    });
}

function displayGet(target) {
    target.find('div.js-get').removeClass('hidden');
    target.find('div.js-post').addClass('hidden');
    target.find('div.js-display').addClass('hidden');
    target.find('div.js-results').removeClass('hidden');
}

function displayPost(target) {
    target.find('h3.post-title').text('Add A Recipe');
    target.find('div.js-post').removeClass('hidden');
    target.find('div.js-get').addClass('hidden');
    target.find('div.js-display').addClass('hidden');
    target.find('div.js-results').addClass('hidden');
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
    target.find('div.js-results').addClass('hidden');
}

//handles DOM rendering by hiding and revealing elements as users navigate the app
function stateToggle(state, target) {
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

$('ul.ingredients-field').on('click', 'i.ingredients-adder', function (event) {
    event.preventDefault();
    addCount('ingredients');
    inputAdder($(this), 'text', 'ingredients');
    messageRemover('ingredients', $(this));
});

$('ul.books-field').on('click', 'i.books-adder', function (event) {
    event.preventDefault();
    addCount('books');
    inputAdder($(this), 'number', 'books');
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
    $(this).closest('body').find('.js-results').empty();
    $.ajax({ url: SERVER_URL, type: 'get', success: resultSwitcher });
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
        resolve(stateToggle(state, $('body')));
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
        resolve(location.reload());
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
    $(this).closest('body').find('.js-results').empty();
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
    var settings = {
        url: SERVER_URL + id,
        type: 'get',
        success: populateDisplay
    };
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
    $(this).closest('body').find('.js-results').empty();
    var search = $(this).text();
    var filter = $(this).closest('li').attr('id');
    setReturn();
    state.request = 'get';
    stateToggle(state, $('body'));
    $('#search').val(search);
    $('#filter').val(filter);
    $.ajax({ url: SERVER_URL, type: 'get', success: resultSwitcher });
});