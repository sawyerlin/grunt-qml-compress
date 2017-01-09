/*
 * grunt-qml-compress
 * https://github.com/slin/grunt-qml-compress
 *
 * Copyright (c) 2017 sawyerlin
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    clean: {
      tests: ['test/output']
    },
    qml_compress: {
      compress: {
        options: {
            qmlRoot: "../docker-qml-app/submodules/ocs-freeboxv6",
            outputRoot: "tmp/ocs-freeboxv6"
        }
      }
    },
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('default', ['qml_compress']);
};
