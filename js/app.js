var input = document.getElementById('csv');
var template = Hogan.compile(document.getElementById('template').innerText);
var resultContainer = document.getElementById('results');

input.addEventListener('change', onFileSelected);

function onFileSelected(e) {
    var files = Array.prototype.slice.call(e.target.files, 0, 1);

    files.forEach(function (file) {
        parse(file);
    });
}

function parse(file) {
    var results = Object.create(null);

    Papa.parse(file, {
        header: true,
        step: function (result, parser) {
            var row = result.data.pop();

            if (!row.Date) {
                return false;
            }

            var criteria = row.Criterion;
            var param1 = row['Parameter 1'];
            var param2 = row['Parameter 2'];
            var val = Number(row.Value);
            var key = [criteria, param1, param2].filter(identity).join(':');

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
