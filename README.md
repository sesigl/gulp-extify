# gulp-extjs-dependencies [![Build Status][travis-image]][travis-url]
> An extjs-dependency plugin for gulp 3

## Usage

First, install `gulp-extjs-dependencies` as a development dependency:

```shell
npm install --save-dev gulp-extjs-dependencies
```

Then, add it to your `gulpfile.js`:

```javascript
var extDependencies = require('gulp-extjs-dependencies');

gulp.task('templates', function(){
  gulp.src(extDependencies('./app/app.js'))
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('./build/'))
});
```


## API

gulp-extjs-dependencies can be called with a file-path pointing to your entry app script file. It will return a list
with a working order depending on your requires definitions.

### extDependencies(pathToYourEntryFile [, options])

#### string
Type: `String`

The string to that points to your entry file.

### gulp-extjs-dependencies options

An optional third argument, `options`, can be passed.

#### options
Type: `Object`

Coming soon

[travis-url]: https://travis-ci.org/sebastian2015/gulp-extjs-dependencies
[travis-image]: https://travis-ci.org/sebastian2015/gulp-extjs-dependencies.svg?branch=master
[npm-url]: Coming soon
[npm-image]: Coming soon
