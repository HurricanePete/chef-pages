var state = {
    filter: "all",
    searchTerm: null
}

function nameSearch(input) {
    let result = [];
    MOCK_RECIPES.recipes.forEach(function(entry){
        if (entry.name === input) {
            result.push(entry);
        }
    });
    return result;
}

function userSearch(input) {
    let result = [];
    MOCK_RECIPES.recipes.forEach(function(entry){
        if (entry.filters.userId === input) {
            result.push(entry);
        }
    });
    return result;
}

function bookSearch(input) {
    let result = [];
    MOCK_RECIPES.recipes.forEach(function(entry){
        for (var i = 0; i<=entry.filters['bookIds'].length; i++) {
            if (entry.filters.bookIds[i] === input) {
                result.push(entry);
            };
        };
    });
    return result;
}

function categorySearch(input) {
    let result = [];
    MOCK_RECIPES.recipes.forEach(function(entry){
        for (var i = 0; i<=entry.filters['categories'].length; i++) {
            if (entry.filters.categories[i] === input) {
                result.push(entry);
            };
        };
    });
    return result;
}

function handleSearches() {
    switch(state.filter) {
        case "name": return nameSearch(state.searchTerm);
        break;
        case "user": return userSearch(state.searchTerm);
        break;
        case "book": return bookSearch(state.searchTerm);
        break;
        case "category": return categorySearch(state.searchTerm);
        break;
    }
}

function ingredientsList(list) {
    let htmlList = ""
    list.forEach(function(item) {
        htmlList += '<li>' + item + '</li>';
    });
    return htmlList;
}

function displaySearchRecipes(data) {
    data.forEach(function(item){
        $('.js-results').append(
            '<div>' +
            '<p>' + item.name + '</p>' +
            '<p>' + item.link + '</p>' +
            '<ul>' + ingredientsList(item.ingredients) + '</ul>' +
            '<p>' + item.prep + '</p>' +
            '<p>' + item.notes + '</p>' +
            '</div>'+ '<br>'); 
    });
}

function requestToggle(state, target) {
    if (state.request === 'get') {
        target.find('div.js-post').addClass('hidden');
        target.find('div.js-get').removeClass('hidden');
    }
    else if (state.request === 'post') {
        target.find('div.js-post').removeClass('hidden');
        target.find('div.js-get').addClass('hidden');
    };
}

$('button.search-submit').click(function(event) {
    event.preventDefault();
    $('.js-results').empty();
})

$('button.js-getButton').click(function(event) {
    event.preventDefault();
    state.request = 'get';
    requestToggle(state, $('body'));
})

$('button.js-postButton').click(function(event) {
    event.preventDefault();
    state.request = 'post';
    requestToggle(state, $('body'));
})
