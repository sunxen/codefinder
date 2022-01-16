const fs = require('fs');

function parse(file, name) {
    const snippets = [];
    const text = fs.readFileSync(file, 'utf8')
    const json = JSON.parse(text)
    for (const key in json) {
        if (Object.hasOwnProperty.call(json, key)) {
            const item = json[key];
            const body = typeof item.body === 'string'
                ? item.body
                : item.body.join('\n');
            snippets.push(body);
        }
    }
    fs.writeFileSync(`./${name}`, snippets.join('\n\n\n'));
}

parse('.source/es6.json', 'es6/js');
parse('.source/vue.json', 'vue/js');
parse('.source/wxjs.json', 'wx/js');
parse('.source/wxjson.json', 'wx/json');
parse('.source/wxxml.json', 'wx/xml');
parse('.source/angular.json', 'angular/js');
parse('.source/react.json', 'react/js');

console.log('Done');
