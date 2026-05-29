const fs = require('fs');
let c = fs.readFileSync('src/store.js', 'utf8');

c = c.replace(
  /token: localStorage\.getItem\('token'\) \|\| null,/,
  `token: localStorage.getItem('token') || null,\n  apiKey: localStorage.getItem('apiKey') || '',\n  setApiKey: (key) => {\n    localStorage.setItem('apiKey', key);\n    set({ apiKey: key });\n  },`
);

fs.writeFileSync('src/store.js', c);
console.log("Updated store.js");
