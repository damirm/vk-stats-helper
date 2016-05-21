var input = document.getElementById('csv');
var btn = document.getElementById('btn');
var template = Hogan.compile(document.getElementById('template').innerText);
var resultContainer = document.getElementById('results');
var dragClass = 'loading';

input.addEventListener('change', onFileSelected, false);
document.addEventListener('dragenter', onDragEnter, false);
document.addEventListener('dragover', function (e) { e.preventDefault(); }, false);
document.addEventListener('drop', onDrop, false);

function onFileSelected(e) {
    parseFiles(arrayify(e.target.files));
}

function onDragEnter(e) {
    btn.classList.add(dragClass);
}

function onDrop(e) {
    e.preventDefault();
    btn.classList.remove(dragClass);
    parseFiles(arrayify(e.dataTransfer.files));
}

function parseFiles(files) {
    files.forEach(function (file) {
        parse(file);
    });
}

function parse(file) {
    var results = Object.create(null);
    var i = 0;

    Papa.parse(file, {
        step: function (result, parser) {
            var row = result.data.pop();
            var criteria = row[1];
            var param1 = row[2];
            var param2 = row[3];
            var val = Number(row[4]);
            var key = [criteria, param1, param2].filter(identity).join(':');

            if (i++ == 0 || !key) {
                return false;
            }

            if (typeof results[key] === 'undefined') {
                results[key] = 0;
            }

            results[key] += val;
        },
        complete: function (result, parser) {
            render(results, file.name);
        }
    });
}

function render(results, name) {
    resultContainer.innerHTML = template.render({
        results: sortByCriteria(transformResults(results)),
        name: name
    });
}

function transformResults(results) {
    var transformed = [];

    for (var key in results) {
        transformed.push({
            criteria: key,
            count: results[key]
        });
    }

    return transformed;
}

function sortByCriteria(results) {
    return results.sort(function (a, b) {
        return a.criteria.localeCompare(b.criteria);
    });
}

function identity(val) {
    return val;
}

function arrayify(list) {
    return Array.prototype.slice.call(list, 0, 1);
}
