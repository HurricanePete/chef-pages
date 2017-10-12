const SERVER_URL = 'https://sleepy-ravine-11904.herokuapp.com/recipes/';

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

//extra line hides the submit button if no ingredient inputs are present
function ingredientsCountCheck(target) {
    const INGREDIENTS_MESSAGE_TEMPLATE = 'Must have at least one ingredient in order to submit';
    if ((target.closest('ul').find('p.empty-ingredients').text()) === INGREDIENTS_MESSAGE_TEMPLATE) {
        return;
    }
    else if (state.ingredientsCount < 1) {
        target.closest('li').before(`<li class="message"><p class="empty-ingredients">${INGREDIENTS_MESSAGE_TEMPLATE}</li></p>`);
        target.closest('form').find('input.post-submit').addClass('hidden');
    }
}

function booksCountCheck(target) {
    const BOOKS_MESSAGE_TEMPLATE = 'Press the Add Books button to add books';
    if ((target.closest('ul').find('p.empty').text()) === BOOKS_MESSAGE_TEMPLATE) {
        return;
    }
    else if (state.booksCount < 1) {
        target.closest('li').before(`<li class="message"><p class="empty">${BOOKS_MESSAGE_TEMPLATE}</li></p>`);
    }
}

function categoriesCountCheck(target) {
    const CATEGORIES_MESSAGE_TEMPLATE = 'Press the Add Categories button to add category tags';
    if ((target.closest('ul').find('p.empty').text()) === CATEGORIES_MESSAGE_TEMPLATE) {
        return;
    }
    else if (state.categoriesCount < 1) {
        target.closest('li').before(`<li class="message"><p class="empty">${CATEGORIES_MESSAGE_TEMPLATE}</p><li>`);
    }
}

function countHandler(ingredientsTarget, booksTarget, categoriesTarget) {
    ingredientsCountCheck(ingredientsTarget);
    booksCountCheck(booksTarget);
    categoriesCountCheck(categoriesTarget);
}

function allowPostSubmit(item, target) {
    if (item === 'ingredients') {
        target.closest('form').find('input.post-submit').removeClass('hidden');
    }
}

function messageRemover(item, target) {
    if (state[`${item}Count`] > 0) {
        target.closest('ul').find('li.message').remove();
//if messageRemover is called for ingredients it will reveal the submit button again
        allowPostSubmit(item, target);
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
    let required = "";
    if (nameId === 'ingredients') {
        required = "required";
    }
    target.closest('li').before(
        '<li class="js-added">' + 
        `<input type="${type}" name="${nameId}" id="${nameId}"/>` + 
        '<i class="fa fa-minus-circle fa-lg js-input-delete" aria-hidden="true"></i>' +
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

function formToArry(target, submitValue) {
    target.each(function() {
        submitValue.push($(this).val());
    })
}

//adds and fills the appropriate amount of HTML list elements from result arrays
function formAdditionsHandler(array, type, nameId) {
    let additions = 0;
    if (array.length > 1) {
        for (let i=2; i<=array.length; i++) {
            inputAdder(($('#post-form')).find(`.${nameId}-adder`), type, nameId);
            additions++;
        }
    }
    for (let i=0; i<=additions; i) {
        $(`ul.${nameId}-field`).find('input').each(function(item) {
            $(this).val(array[i]);
            i++;
        })
    }
}

//adds and fills the appropriate amount of HTML list elements from result array for individual recipe display
function displayAdditionsHandler(array, nameId) {
    let additions = 0;
    for (let i=1; i<=array.length; i++) {
        displayListAdder(($('#display').find(`.js-display-${nameId}`)), nameId);
        additions++;
    }
    for (let i=0; i<=additions; i) {
        $(`ul.js-display-${nameId}`).find('li').each(function(item) {
            $(this).text(array[i]);
        i++;
        })
    }
}

//adds and fills the appropriate amount of HTML button elements from result arrays
function displayLinkContentHandler(array, nameId) {
    let additions = 0;
    for (let i=1; i<=array.length; i++) {
        displayLinkAdder(($('#display').find(`.js-display-${nameId}`)), nameId)
        additions++;
    }
    for (let i=0; i<=additions; i) {
        $(`ul.js-display-${nameId}`).find('button').each(function(item) {
            $(this).text(array[i]);
        i++;
        })
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
    target.find('.ingredients-field').find('.js-added').remove();
    target.find('.books-field').find('.js-added').remove();
    target.find('.categories-field').find('.js-added').remove();
    target.find('input').not('input[type="submit"]').val('');
    target.find('textarea').val('');
}

//replaces first inputs for ingredients, books, and categories after they are cleared by reset
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
        inputAdder(target.find(`button.${fields[i]}-adder`), type, fields[i]);
    }
}

function resetDisplay(target) {
    target.find('p').val('');
    target.find('.js-added').remove();
    target.find('.js-added-link').remove();
    resetEmptyFields();
}

//fills the POST form upon selecting the update button
function populateForm(data) {
    resetForm($('#post-form'));
    replaceInitialInputs($('body'));
    $('#name').val(data.name);
    $('#link').val(data.link);
    $('#ingredients').val(data.ingredients[0]);
    formAdditionsHandler(data['ingredients'], 'text', 'ingredients');
    $('textarea#prep').val(data.prep);
    $('input#notes').val(data.notes);
    formAdditionsHandler(data['books'], 'number', 'books');
    formAdditionsHandler(data['tags'], 'text', 'categories');
}

//fills the individual results display pane upon selection
function populateDisplay(data) {
    state.putId = data.id;
    resetDisplay($('div.js-display'));
    $('.recipe-id').text(data.id);
    $('.js-display-name').text(data.name);
    $('.js-display-link').text(data.link);
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
            '<p><a href="#">' + item.link + '</a></p>' +
            '<label for="ingredients">Ingredients</label>' + '<br>' +
            '<div id="ingredients">' +
            '<ul class="ingredients-list">' + ingredientsList(item.ingredients) + '</ul>' +
            '</div>' +
            '<label for="prep">Preparation</label>' + '<br>' +
            '<p id="prep">' + item.prep + '</p>' +
            '<label for="notes">Notes</label>' + '<br>' +
            '<p id="notes">' + item.notes + '</p>' +
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
    target.find('div.js-post').removeClass('hidden');
    target.find('div.js-get').addClass('hidden');
    target.find('div.js-display').addClass('hidden');
    target.find('div.js-results').addClass('hidden');
    target.find('input.post-submit').removeClass('hidden');
    target.find('input.put-submit').addClass('hidden');    
}

function displayPut(target) {
    target.find('div.js-post').removeClass('hidden');
    target.find('div.js-get').addClass('hidden');
    target.find('div.js-display').addClass('hidden');
    target.find('input.post-submit').addClass('hidden');
    target.find('input.put-submit').removeClass('hidden');   
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

$('button.ingredients-adder').click(function(event) {
    event.preventDefault();
    addCount('ingredients');
    messageRemover('ingredients', $('button.ingredients-adder'));
    inputAdder($(this), 'text', 'ingredients');
})

$('button.books-adder').click(function(event) {
    event.preventDefault();
    addCount('books');
    messageRemover('books', $('button.books-adder'));
    inputAdder($(this), 'number', 'books');
})

$('button.categories-adder').click(function(event) {
    event.preventDefault();
    addCount('categories');
    messageRemover('categories', $('button.categories-adder'));
    inputAdder($(this), 'text', 'categories');
})

$('body').on('click', '.js-input-delete', function(event) {
    event.preventDefault();
    minusCountHandler($(this));
    //if (state.ingredientsCount < 1) {
      //  state.ingredientsCount++;
        //alert('Cannot have zero ingredients');
        //return;
    //}
    $(this).closest('li.js-added').remove();
    countHandler($('button.ingredients-adder'), $('button.books-adder'), $('button.categories-adder'));
})

$('#get-form').submit(function(event) {
    event.preventDefault();
    state.request = 'get';
    stateToggle(state, $('body'));
    $(this).closest('body').find('.js-results').empty();
    $.ajax({url: SERVER_URL, type: 'get', success: resultSwitcher});
})

$('input.post-submit').click(function(event) {
    event.preventDefault();
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
    formToArry($('ul.books-field').find('input'), data.filters.bookIds);
    formToArry($('ul.categories-field').find('input'), data.filters.categories);
    formToArry($('ul.ingredients-field').find('input'), data.ingredients);
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

$('input.put-submit').click(function(event) {
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
    formToArry($('ul.books-field').find('input'), data.filters.bookIds);
    formToArry($('ul.categories-field').find('input'), data.filters.categories);
    formToArry($('ul.ingredients-field').find('input'), data.ingredients);
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