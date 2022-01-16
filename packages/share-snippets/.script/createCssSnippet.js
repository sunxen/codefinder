const fs = require('fs');
const json = require('../.source/css.json')

const reProperty = /^([a-z-]+)(?:\s*:\s*([^\n\r;]+?);*)?$/;
const snippets = [];

for (const value of Object.values(json)) {
    const m = value.match(reProperty);
    if (m && m[2]) {
        const [, name, options] = m;
        for (const option of options.split('|')) {
            snippets.push(`${name}: ${option};`);
        }
    } else if (/[};]$/.test(value)) {
        snippets.push(value);
    } else {
        snippets.push(`${value}: $0;`);
    }
}

fs.writeFileSync('./css', snippets.join('\n\n\n'));

console.log('Done');
