/*jshint laxbreak:true */

/**
 * @param {Function} grunt .
 */
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    theme: grunt.option('theme') || 'default',
    concat: {
      options: {
        separator: '\n',
        banner: '(function() {\n// This file concat by grunt. \n\n',
        footer: '\n})();',
        process: function(src, filepath) {
          if (filepath.indexOf('.css') !== -1) {
            src = src
              .replace(/\r?\n/g, '')
              .replace(/'/g, '\\\'');
            src = 'var THEME_CSS = \'' + src + '\';';
          }
          return src;
        }
      },
      dist: {
        src: [
            'themes/<%= theme %>.css',
            'src/util.js',
            'src/loader.js',
            'src/modules.js',
            'src/module/*.js',
            'src/main.js'
        ],
        dest: 'src/octocard.js'
      }
    },
    uglify: {
      options: {
        banner: '/*!\n octocard\n' +
            ' <%= pkg.version %>\n' +
            ' <%= grunt.template.today("dd-mm-yyyy") %>\n*/\n'
      },
      dist: {
        files: {
          'bin/octocard.<%= pkg.version %>.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    jshint: {
      files: ['src/**/*.js'],
      options: {
        globals: {
        },
        laxbreak: true,
        scripturl: true
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    },
    clean: ['src/octocard.js']
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('debug', ['clean', 'jshint', 'concat']);
  grunt.registerTask('default', ['clean', 'jshint', 'concat', 'uglify']);

};

