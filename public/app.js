const SERVER_URL = 'http://localhost:8080/recipes/' 

let state = {
    request: 'get',
    putId: null
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
            '<div class="results-frame">' +
            '<p class="js-id hidden">' + item.id + '</p>' +
            '<p>' + item.name + '</p>' +
            '<a href="#">' + item.link + '</a>' +
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
            '<div class="results-frame">' +
            '<p class="js-id hidden">' + data.id + '</p>' +
            '<p>' + data.name + '</p>' +
            '<a href="#">' + data.link + '</a>' +
            '<ul>' + ingredientsList(data.ingredients) + '</ul>' +
            '<p>' + data.prep + '</p>' +
            '<p>' + data.notes + '</p>' +
            '<span>' + 
            '<button class="put-button">Put</button>' + 
            '<button class="delete-button">Delete</button>' + 
            '</span>' +
            '</div>');
    }
}

function inputAdder(target, type, nameId) {
    target.before(
        '<span class="js-added">' + 
        `<input type="${type}" name="${nameId}" id="${nameId}">` + 
        '<button class="js-input-delete">X</button>' + 
        '</span>'
        );
}

function stateToggle(state, target) {
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

//sanity check with Dominic
function formAdditionsHandler(array, type, nameId) {
    let additions = 0;
    if (array.length > 1) {
        for (let i=1; i<=array.length; i++) {
            inputAdder(($('#post-form')).find(`.${nameId}-adder`), type, nameId);
            additions++;
        }
    }
    for (let i=0; i<=additions; i) {
        $(`fieldset.${nameId}-field`).find('input').each(function(item) {
            $(this).val(array[i]);
            i++;
        })
    }
}

function resetForm(target) {
    target.find('.ingredients-field').find('span').remove();
    target.find('.books-field').find('span').remove();
    target.find('.categories-field').find('span').remove();
    target.find('input').val('');
}

function populateForm(data) {
    $('body').find('#post-form').find('#name').val(data.name);
    $('body').find('#post-form').find('#link').val(data.link);
    $('body').find('#post-form').find('#ingredients').val(data.ingredients[0]);
    formAdditionsHandler(data['ingredients'], 'text', 'ingredients');
    $('body').find('form#post-form').find('input#prep').val(data.prep);
    $('body').find('form#post-form').find('input#notes').val(data.notes);
    formAdditionsHandler(data['books'], 'number', 'books');
    formAdditionsHandler(data['tags'], 'text', 'categories');
}

function filterAll(input, data) {
    results = data.filter(function(recipe) {
        if (recipe['name'].includes(input) || recipe['books'].includes(input) || recipe['tags'].includes(input)) {
            return recipe
        }
    })
    return results
}

function filterName(input, data) {
    results = data.filter(function(recipe) {
        if (recipe['name'].includes(input)) {
            return recipe
        }
    })
    return results
}

function filterBook(input, data) {
    results = data.filter(function(recipe) {
        if (recipe['books'].includes(input)) {
            return recipe
        }
    })
    return results
}

function filterCategory(input, data) {
    results = data.filter(function(recipe) {
        if (recipe['tags'].includes(input)) {
            return recipe
        }
    })
    return results
}

function resultSwitcher(data) {
    const searchTerm = $('#search').val();
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
        case 'category':
            displayRecipes(filterCategory(searchTerm, data));
    }

}

$('button.ingredients-adder').click(function(event) {
    event.preventDefault();
    inputAdder($(this), 'text', 'ingredients');
})

$('button.books-adder').click(function(event) {
    event.preventDefault();
    inputAdder($(this), 'number', 'books');
})

$('button.categories-adder').click(function(event) {
    event.preventDefault();
    inputAdder($(this), 'text', 'categories');
})

$('body').on('click', '.js-input-delete', function(event) {
    event.preventDefault();
    $(this).closest('span.js-added').remove();
})

$('button.search-submit').click(function(event) {
    event.preventDefault();
    $(this).closest('body').find('.js-results').empty();
    $.ajax({url: SERVER_URL, success: resultSwitcher});
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
    formToArry($('fieldset.books-field').find('input'), data.filters.bookIds);
    formToArry($('fieldset.categories-field').find('input'), data.filters.categories);
    formToArry($('fieldset.ingredients-field').find('input'), data.ingredients);
    const settings = {
        url: SERVER_URL,
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: displayRecipes
    }
    return new Promise ((resolve, reject) => {
        $.post(settings);
        resolve(resetForm($('#post-form')))
        reject(function(err) {
            console.log(err)
        });
    });
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
    stateToggle(state, $('body'));
    let id = $('div.js-results').find(this).closest('div').find('p:first').text();
    state.putId = id;
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
    formToArry($('fieldset.books-field').find('input'), data.filters.bookIds);
    formToArry($('fieldset.categories-field').find('input'), data.filters.categories);
    formToArry($('fieldset.ingredients-field').find('input'), data.ingredients);
    const settings = {
        url: SERVER_URL + state.putId,
        type: 'put',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: displayRecipes
    };
    return new Promise ((resolve, reject) => {
        $.ajax(settings);
        resolve(resetForm($('#post-form')));
        reject(function(err) {
            console.log(err)
        });
    });
    state.putId = null;
    state.request = 'post';
    stateToggle(state, $('body'));
})

$('button.js-getButton').click(function(event) {
    event.preventDefault();
    state.request = 'get';
    stateToggle(state, $('body'));
})

$('button.js-postButton').click(function(event) {
    event.preventDefault();
    resetForm($('#post-form'));
    state.request = 'post';
    stateToggle(state, $('body'));
})
