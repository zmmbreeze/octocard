/*jshint laxbreak:true */

/**
 * @param {Function} grunt .
 */
module.exports = function(grunt) {
    var dest = grunt.option('dest');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        dest: dest || 'bin/',
        concat: {
            options: {
                separator: '\n',
                banner: '(function() {\n// This file concat by grunt. \n\n',
                footer: '\n})();'
            },
            dist: {
                src: [
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
                    'bin/octocard.js': ['<%= concat.dist.dest %>']
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
        clean: [
            'src/octocard.js',
        ],
        less: {
            options: {
                paths: ['themes'],
                cleancss: true
            },
            files: {
                expand: true,
                cwd: 'themes/',
                src: '*.less',
                dest: '<%= dest %>/themes/',
                ext: '.css'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.registerTask('debug', ['clean', 'jshint', 'concat']);
    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'clean']);
    grunt.registerTask('theme', ['less']);
};

