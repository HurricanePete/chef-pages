var state = {
    filter: "all",
    searchTerm: null
}

var MOCK_RECIPES = {
    "recipes": [
        {
            "id": "1111111",
            "filters": {
                "userId": "1111111",
                "bookIds": ["1111111", "2222222"], 
                "categories": ["healthy", "quick"]
            },
            "name": "Delicious Donuts",
            "link": "www.eatingwell.com",
            "ingredients": ["eggs", "sugar", "love"],
            "prep": "Do some baking",
            "notes": "These shouldn't be marked as healthy"
        },
        {
            "id": "2222222",
            "filters": {
                "userId": "1111111",
                "bookIds": ["2222222", "3333333"], 
                "categories": ["quick"]
            },
            "name": "Eggsy Eggs",
            "link": "www.easyeggs.com",
            "ingredients": ["eggs", "eggs", "eggs"],
            "prep": "Boil some of them, fry some more, and eat the rest raw",
            "notes": "Consuming raw or undercooked foods can cause health problems"
        },
        {
            "id": "3333333",
            "filters": {
                "userId": "2222222",
                "bookIds": ["1111111", "3333333"], 
                "categories": ["quick", "comfort"]
            },
            "name": "Noodles",
            "link": "www.oodlesofnoodles.com",
            "ingredients": ["noodles"],
            "prep": "Bring water to a boil and boil the noodles for awhile",
            "notes": "So easy that a space-man could do it"
        },
        {
            "id": "4444444",
            "filters": {
                "userId": "3333333",
                "bookIds": ["4444444"], 
                "categories": ["comfort", "protein heavy"]
            },
            "name": "Steak Galore",
            "link": "www.greatbigsteaks.com",
            "ingredients": ["cow", "pepper"],
            "prep": "Grill that sucker until it's the way you like it",
            "notes": "You can never have too much pepper"
        }
    ]
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

//function getAllRecipes(callbackFn) {
//    setTimeout(function(){callbackFn(MOCK_RECIPES)}, 100);
//}

//function getSearchRecipes(callbackFn, state) {
//    setTimeout(function(){callbackFn(handleSearches())}, 100);
//}

function ingredientsList(list) {
    let htmlList = ""
    list.forEach(function(item) {
        htmlList += '<li>' + item + '</li>';
    });
    return htmlList;
}

function displayAllRecipes(data) {
    data.recipes.forEach(function(item){
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

function stateHandler(state) {
    if (state.filter === "all") {
        $(displayAllRecipes(MOCK_RECIPES));
    }
    else {
        $(displaySearchRecipes(handleSearches(state)));
    }
}

$('button.search-submit').click(function(event){
    event.preventDefault();
    $('.js-results').empty();
    state.filter = $('#filter').val();
    state.searchTerm = $('#search').val();
    stateHandler(state);

})
