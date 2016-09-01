# Babel Plugin: syntax-exists
This is a <a href="https://babeljs.io">Babel</a> plugin which adds syntax for making existential checks in your code.  
It uses the the keyword `.ex` which is short for "exists". :sparkles:
# TODOS
- [ ] Write tests
- [ ] Uh.. Make it work


## What?
From <a href="https://arcturo.github.io/library/coffeescript/index.html">The Little Book on Coffeescript</a>:
> Using `if` for `null` checks in JavaScript is common, but has a few pitfalls in that empty strings and `zero` are both coerced into `false`, which can catch you out. CoffeeScript existential operator ? returns `true` unless a variable is `null` or `undefined`, similar to Ruby's `nil?`.  

### So what does it look like?
`foo.ex` compiles to `typeof foo !== "undefined" && foo !== null`
### How about a more exhilirating use case?
Given an object:
```
let obj = {
  attr: 'value',
  nested_attr: { name: 'nested' },
  func: () => 777
}
```
We can write write the following statements and expect the subsequent returns:
```
obj.ex.attr              // 'value'
obj.attr.ex              // true
obj.nested_atter.ex.name // 'nested'

// Oh, and it works for functions too...
// --------------------------------------
obj.func.ex              // true
obj.func.ex()            // 777

// But what about undefined errors?
// --------------------------------------
obj.doesnt_exist.ex      // false
obj.doesnt_exist.ex.nope // false
obj.not_a_func.ex()      // false
```
## Installation
`$ npm install babel-plugin-syntax-exists`

## Usage
### Via **`.babelrc`** (Recommended)
**babelrc**
```
{
  "plugins": ["syntax-exists"]
}
```

### Via CLI
`$ babel --plugins syntax-exists script.js`

### Via Node API
```
require('babel').transform('code',{
  plugins: ['syntax-exists']
});
```
