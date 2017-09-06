const SERVER_URL = 'http://localhost:8080/recipes/' 

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

function displayRecipes(data) {
    if (Array.isArray(data)) {
        data.forEach(function(item) {
            $('.js-results').append(
            '<div>' +
            '<p class="js-id hidden">' + item.id + '</p>' +
            '<p>' + item.name + '</p>' +
            '<p>' + item.link + '</p>' +
            '<ul>' + ingredientsList(item.ingredients) + '</ul>' +
            '<p>' + item.prep + '</p>' +
            '<p>' + item.notes + '</p>' +
            '<span>' + 
            '<button class="put-button">Put</button>' + 
            '<button class="delete-button">Delete</button>' + 
            '</span>' +
            '</div>');
        })
    }
    else {
        $('.js-results').append(
            '<div>' +
            '<p class="js-id hidden">' + data.id + '</p>' +
            '<p>' + data.name + '</p>' +
            '<p>' + data.link + '</p>' +
            '<ul>' + ingredientsList(data.ingredients) + '</ul>' +
            '<p>' + data.prep + '</p>' +
            '<p>' + data.notes + '</p>' +
            '<span>' + 
            '<button class="put-button">Put</button>' + 
            '<button class="delete-button">Delete</button>' + 
            '</span>' +
            '</div>');
    }
};

function inputAdder(target, type, name, id) {
    target.before(
        `<input type="${type}" name="${name}" id="${id}">`
        );
}

function requestToggle(state, target) {
    if (state.request === 'get') {
        target.find('div.js-post').addClass('hidden');
        target.find('div.js-get').removeClass('hidden');
    }
    else if (state.request === 'post') {
        target.find('div.js-post').removeClass('hidden');
        target.find('div.js-get').addClass('hidden');
        target.find('button.post-submit').removeClass('hidden');
        target.find('button.put-submit').addClass('hidden');
    }
    else if (state.request === 'put') {
        target.find('div.js-post').removeClass('hidden');
        target.find('div.js-get').addClass('hidden');
        target.find('button.post-submit').addClass('hidden');
        target.find('button.put-submit').removeClass('hidden');
    }
}

function formToArry(target, submitValue) {
    target.each(function() {
        submitValue.push($(this).val());
    })
}

function populateForm(data) {

}

$('button.ingredient-adder').click(function(event) {
    event.preventDefault();
    inputAdder($(this), 'text', 'ingredients', 'ingredients');
})

$('button.book-adder').click(function(event) {
    event.preventDefault();
    inputAdder($(this), 'number', 'books', 'books');
})

$('button.category-adder').click(function(event) {
    event.preventDefault();
    inputAdder($(this), 'text', 'categories', 'categ');
})

$('button.search-submit').click(function(event) {
    event.preventDefault();
    $(this).closest('body').find('.js-results').empty();
    $.ajax({url: SERVER_URL, success: displayRecipes});
})

$('button.post-submit').click(function(event) {
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
    formToArry($('fieldset.book-field').find('input'), data.filters.bookIds);
    formToArry($('fieldset.category-field').find('input'), data.filters.categories);
    formToArry($('fieldset.ingredients-field').find('input'), data.ingredients);
    console.log(data);
    const settings = {
        url: SERVER_URL,
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: displayRecipes
    }
    $.post(settings);
})

$('div.js-results').on('click', '.delete-button', function(event) {
    event.preventDefault();
    let id = $('div.js-results').find(this).closest('div').find('p:first').text();
    const settings = {
        url: SERVER_URL + id,
        type: 'delete'
    };
    return new Promise ((resolve, reject) => {
        $.ajax(settings);
        resolve($('div.js-results').find(this).closest('div').remove());
        reject(function(err) {
            console.log(err)
        });
    });
})

$('div.js-results').on('click', '.put-button', function(event) {
    event.preventDefault();
    state.request = "put";
    requestToggle(state, $('body'));
    let id = $('div.js-results').find(this).closest('div').find('p:first').text();
    const settings = {
        url: SERVER_URL + id,
        type: 'get',
//        success: populateForm
    };
    return new Promise ((resolve, reject) => {
        $.ajax(settings);
        resolve($('div.js-results').find(this).closest('div').remove());
        reject(function(err) {
            console.log(err)
        });
    });
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
