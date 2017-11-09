let SERVER_URL = 'https://sleepy-ravine-11904.herokuapp.com/recipes/'

if (window.location.host === 'localhost:8080') {
    SERVER_URL = 'http://localhost:8080/recipes/'
} 

let state = {
    request: 'get',
    putId: null,
    ingredientsCount: 1,
    booksCount: 1,
    categoriesCount: 1
}

function addCount(item) {
    state[`${item}Count`]++;
}

function minusCount(item) {
    state[`${item}Count`]--;
}

function minusCountHandler(target) {
    if ((target.closest('ul').attr("id")) === 'ingredients') {
        minusCount('ingredients');
    }
    else if ((target.closest('ul').attr("id")) === 'books') {
        minusCount('books');
    }
    else if ((target.closest('ul').attr("id")) === 'categories') {
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
    const INGREDIENTS_MESSAGE_TEMPLATE = 'Must have at least one ingredient in order to submit';
    if ((target.closest('ul').find('span.empty-ingredients').text()) === INGREDIENTS_MESSAGE_TEMPLATE) {
        return;
    }
    else if (state.ingredientsCount < 1) {
        target.closest('ul').append(`<li class="message"><span class="empty empty-ingredients">${INGREDIENTS_MESSAGE_TEMPLATE}</span>` + 
            `<i class="fa fa-plus-circle fa-lg ingredients-adder" aria-hidden="true"></i></li>`);
        target.closest('form').find('button.post-submit').addClass('hidden');
        target.closest('form').find('button.put-submit').addClass('hidden');
    }
}

function booksCountCheck(target) {
    const BOOKS_MESSAGE_TEMPLATE = 'Press the Add icon to add books';
    if ((target.closest('ul').find('span.empty-books').text()) === BOOKS_MESSAGE_TEMPLATE) {
        return;
    }
    else if (state.booksCount < 1) {
        target.closest('li').before(`<li class="message"><span class="empty empty-books">${BOOKS_MESSAGE_TEMPLATE}</span>` + 
            `<i class="fa fa-plus-circle fa-lg books-adder" aria-hidden="true"></i></li>`);
    }
}

function categoriesCountCheck(target) {
    const CATEGORIES_MESSAGE_TEMPLATE = 'Press the Add icon to add category tags';
    if ((target.closest('ul').find('span.empty-categories').text()) === CATEGORIES_MESSAGE_TEMPLATE) {
        return;
    }
    else if (state.categoriesCount < 1) {
        target.closest('li').before(`<li class="message"><span class="empty empty-categories">${CATEGORIES_MESSAGE_TEMPLATE}</span>` +
            `<i class="fa fa-plus-circle fa-lg categories-adder" aria-hidden="true"></i><li>`);
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
    }
    else if (item === 'ingredients' && state.request === 'put') {
        target.closest('form').find('button.put-submit').removeClass('hidden');
    }
}

function messageRemover(item, target) {
    if (state[`${item}Count`] > 0) {
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
        let result = inputArray.map(function(item) {
            return item.toLowerCase();
        })
        return result;
    }
    else {
        return;
    }
}

//lines 25 through 79 create a search function for results when all recipes are returned from the database
function filterAll(input, data) {
    let results = data.filter(function(recipe) {
        let caseName = stringToLowerCase(recipe.name)
        let caseTags  = inputToLowerCase(recipe.tags);
        if (caseName.includes(input) || (recipe.books).includes(input) || (caseTags).includes(input)) {
            return recipe
        }
    })
    return results
}

function filterName(input, data) {
    let results = data.filter(function(recipe) {
        if ((stringToLowerCase(recipe.name)).includes(input)) {
            return recipe
        }
    })
    return results
}

function filterBook(input, data) {
    let results = data.filter(function(recipe) {
        if ((inputToLowerCase(recipe.books)).includes(input)) {
            return recipe
        }
    })
    return results
}

function filterCategory(input, data) {
    let results = data.filter(function(recipe) {
        if ((inputToLowerCase(recipe.tags)).includes(input)) {
            return recipe
        }
    })
    return results
}

function resultSwitcher(data) {
    const searchTerm = stringToLowerCase($('#search').val());
    const filter = $('#filter').val();
    switch(filter) {
        case 'all':
            displayRecipes(filterAll(searchTerm, data));
            break;
        case 'name':
            displayRecipes(filterName(searchTerm, data));
            break;
        case 'book':
            displayRecipes(filterBook(searchTerm, data));
            break;
        case 'categories':
            displayRecipes(filterCategory(searchTerm, data));
    }
}


function ingredientsList(list) {
    let htmlList = ""
    list.forEach(function(item) {
        htmlList += '<li>' + item + '</li>';
    });
    return htmlList;
}

function inputAdder(target, type, nameId) {
    target.closest('ul').append(
        '<li class="js-added">' + 
        `<input type="${type}" name="${nameId}" id="${nameId}">` + 
        '<i class="fa fa-minus-circle fa-lg js-input-delete" aria-hidden="true"></i>' +
        `<i class="fa fa-plus-circle fa-lg ${nameId}-adder" aria-hidden="true"></i>` +
        '</li>'
        );
}

function displayListAdder(target, nameId) {
    target.append(
        `<li class="js-added" id="${nameId}">` + '</li>'
        );
}

function displayLinkAdder(target, nameId) {
    target.append(
        `<li id="${nameId}" class="js-added-link">` +
        '<button class="js-display-link-button"></button>' + 
        '</li>'
        );
}

function displayLinkHandler(array, target, nameId) {
    if (nameId === "ingredients") {
        displayListAdder(target, nameId);
    }
    else {
        displayLinkAdder(target, nameId);
    }
}

function formToArray(target, submitValue) {
    if(target.length !== 0) {
        target.each(function() {
            submitValue.push($(this).val());
        })
    }
    else{
        return
    }
}

//adds and fills the appropriate amount of HTML list elements from result arrays
function formAdditionsHandler(array, type, nameId) {
    if(array.length === 0 || array[0] === null) {
        state[`${nameId}Count`] = 0
    }
    else if(array.length > 0) {
        let additions = 0;
        for (let i=1; i<=array.length; i++) {
            inputAdder(($('#post-form')).find(`.${nameId}-seed`), type, nameId);
            additions++;
        }
        for (let i=0; i<=additions; i++) {
            $(`ul.${nameId}-field`).find('input').each(function(item) {
                $(this).val(array[i]);
                i++;
                addCount(nameId);
            })
        }
    }
}

//adds and fills the appropriate amount of HTML list elements from result array for individual recipe display
function displayAdditionsHandler(array, nameId) {
    if(array.length > 0) {
        let additions = 0;
        for (let i=1; i<=array.length; i++) {
            displayListAdder(($('#display').find(`.js-display-${nameId}`)), nameId);
            additions++;
        }
        for (let i=0; i<=additions; i++) {
            $(`ul.js-display-${nameId}`).find('li').each(function(item) {
                $(this).text(array[i]);
            i++;
            })
        }
    }
}

//adds and fills the appropriate amount of HTML button elements from result arrays
function displayLinkContentHandler(array, nameId) {
    if(array.length > 0) {
        let additions = 0;
        for (let i=1; i<=array.length; i++) {
            displayLinkAdder(($('#display').find(`.js-display-${nameId}`)), nameId)
            additions++;
        }
        for (let i=0; i<=additions; i++) {
            $(`ul.js-display-${nameId}`).find('button').each(function(item) {
                $(this).text(array[i]);
            i++;
            })
        }
    }
}

function clearEmptyLink() {
    if (($('.js-display-link').text()) === "") {
        $('.js-display-link').addClass('hidden');
        $('.no-link').removeClass('hidden');
    }
}

function clearEmptyNotes() {
    if(($('.js-display-notes').text()) === "") {
        $('.js-display-notes').addClass('hidden');
        $('.no-notes').removeClass('hidden');
    }
}

function clearEmptyBooks() {
    let target = $('.js-display-books').find('button');
    if ((target.text()) === "") {
        target.addClass('hidden');
        $('.no-books').removeClass('hidden');
    }
}

function clearEmptyCategories() {
    let target = $('.js-display-categories').find('button');
    if((target.text()) === "") {
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
    let fields = ['ingredients', 'books', 'categories'];
    for (let i=0; i<fields.length; i++) {
        let type;
        if (fields[i] === books) {
            type = 'number';
        }
        else {
            type = 'text';
        }
        inputAdder(target.find(`li.${fields[i]}-seed`), type, fields[i]);
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
    data.forEach(function(item) {
        $('.js-results').append(
            '<div class="results-frame">' +
            '<p class="js-id hidden">' + item.id + '</p>' +
            '<h4>' + item.name + '</h4>' +
            '<p><a href="item.link" target="_blank">' + item.link + '</a></p>' +
            '<label for="ingredients">Ingredients</label>' + '<br>' +
            '<div id="ingredients">' +
            '<ul class="ingredients-list">' + ingredientsList(item.ingredients) + '</ul>' +
            '</div>' +
            '<label for="prep">Preparation</label>' + '<br>' +
            '<p id="prep">' + item.prep + '</p>' +
            '</div>');
    })
}    

function displayGet(target) {
    target.find('div.js-get').removeClass('hidden');
    target.find('div.js-post').addClass('hidden');
    target.find('div.js-display').addClass('hidden');
    target.find('div.js-results').removeClass('hidden');
}

function displayPost(target) {
    target.find('h4.post-title').text('Add a Recipe');
    target.find('div.js-post').removeClass('hidden');
    target.find('div.js-get').addClass('hidden');
    target.find('div.js-display').addClass('hidden');
    target.find('div.js-results').addClass('hidden');
    target.find('button.post-submit').removeClass('hidden');
    target.find('button.put-submit').addClass('hidden');    
}

function displayPut(target) {
    target.find('h4.post-title').text('Edit a Recipe');
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
    }
    else if (state.request === 'post') {
        displayPost(target);
    }
    else if (state.request === 'put') {
        displayPut(target);
    }
    else if (state.request === 'display') {
        displayDisplay(target);
    }
}

$('ul.ingredients-field').on('click', 'i.ingredients-adder', function(event) {
    event.preventDefault();
    addCount('ingredients');
    inputAdder($(this), 'text', 'ingredients');
    messageRemover('ingredients', $(this));
})

$('ul.books-field').on('click', 'i.books-adder', function(event) {
    event.preventDefault();
    addCount('books');
    inputAdder($(this), 'number', 'books');
    messageRemover('books', $(this));
})

$('ul.categories-field').on('click', 'i.categories-adder', function(event) {
    event.preventDefault();
    addCount('categories');
    inputAdder($(this), 'text', 'categories');
    messageRemover('categories', $(this));
})

$('.js-post').on('click', '.js-input-delete', function(event) {
    event.preventDefault();
    minusCountHandler($(this));
    countHandler($('li.ingredients-seed'), $('li.books-seed'), $('li.categories-seed'));
    $(this).closest('li').remove();
})

$('#get-form').submit(function(event) {
    event.preventDefault();
    state.request = 'get';
    stateToggle(state, $('body'));
    $(this).closest('body').find('.js-results').empty();
    $.ajax({url: SERVER_URL, type: 'get', success: resultSwitcher});
})

$('.post-submit').click(function(event) {
    event.preventDefault();
    if($('input#name').val() === '') {
        alert('Recipe must have a name');
        return
    }
    const data = {
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
    }
    formToArray($('ul.books-field').find('input'), data.filters.bookIds);
    formToArray($('ul.categories-field').find('input'), data.filters.categories);
    formToArray($('ul.ingredients-field').find('input'), data.ingredients);
    const settings = {
        url: SERVER_URL,
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: populateDisplay
    }
    state.request = 'display';
    return new Promise ((resolve, reject) => {
        $.post(settings);
        resolve(stateToggle(state, $('body')))
        reject(function(err) {
            console.log(err)
        });
    })
})

$('div.js-display').on('click', '.delete-button', function(event) {
    event.preventDefault();
    let id = $('.recipe-id').text();
    const settings = {
        url: SERVER_URL + id,
        type: 'delete'
    };
    state.request = 'get';
    return new Promise ((resolve, reject) => {
        $.ajax(settings);
        resolve(location.reload());
        reject(function(err) {
            console.log(err)
        });
    });
})

$('div.js-display').on('click', '.put-button', function(event) {
    event.preventDefault();
    state.request = "put";
    stateToggle(state, $('body'));
    let id = $('.recipe-id').text();
    const settings = {
        url: SERVER_URL + id,
        type: 'get',
        success: populateForm
    };
    return new Promise ((resolve, reject) => {
        $.ajax(settings);
        resolve($('div.js-results').find(this).closest('div').remove());
        reject(function(err) {
            console.log(err)
        });
    });
})

$('button.put-submit').click(function(event) {
    event.preventDefault();
    const data = {
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
    }
    formToArray($('ul.books-field').find('input'), data.filters.bookIds);
    formToArray($('ul.categories-field').find('input'), data.filters.categories);
    formToArray($('ul.ingredients-field').find('input'), data.ingredients);
    const settings = {
        url: SERVER_URL + state.putId,
        type: 'put',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: populateDisplay
    };
    state.request = 'display';
    return new Promise ((resolve, reject) => {
        $.ajax(settings);
        resolve(stateToggle(state, $('body')));
        reject(function(err) {
            console.log(err)
        });
    });
    state.putId = null;
})

$('a.js-getButton').click(function(event) {
    location.reload();
    event.preventDefault();
    state.request = 'get';
    $(this).closest('body').find('.js-results').empty();
    stateToggle(state, $('body'));
})

$('a.js-postButton').click(function(event) {
    event.preventDefault();
    resetCounts();
    resetForm($('#post-form'));
    replaceInitialInputs($('body'));
    state.request = 'post';
    stateToggle(state, $('body'));
})

$('div.js-results').on('click', 'div.results-frame', function(event) {
    event.preventDefault();
    resetDisplay($('div.js-display'));
    state.request = 'display';
    stateToggle(state, $('body'));
    let id = $('div.js-results').find(this).closest('div').find('p:first').text();
    state.putId = id;
    const settings = {
        url: SERVER_URL + id,
        type: 'get',
        success: populateDisplay
    };
    $.ajax(settings);
})

$('button.return-button').click(function(event) {
    event.preventDefault();
    state.request = 'get';
    stateToggle(state, $('body'));
    $(this).closest('body').find('.js-results').empty();
    $.ajax({url: SERVER_URL, type: 'get', success: resultSwitcher});
})

$('div.js-display').on('click', 'button.js-display-link-button', function(event) {
    event.preventDefault();
    $(this).closest('body').find('.js-results').empty();
    const search = $(this).text();
    const filter = $(this).closest('li').attr('id');
    state.request = 'get';
    stateToggle(state, $('body'));
    $('#search').val(search);
    $('#filter').val(filter);
    $.ajax({url: SERVER_URL, type: 'get', success: resultSwitcher});
})