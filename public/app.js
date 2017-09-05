const SERVER_URL = 'localHost:8080/recipes' 

let state = {
    request: 'get'
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
            '<span>' + 
            '<button class="put-button">Put</button>' + 
            '<button class="delete-button">Delete</button>' + 
            '</span>'
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

$('#get-form').ajaxForm({
    url: 'SERVER_URL',
    dataType: 'json',
    success: displaySearchRecipes(res);
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
