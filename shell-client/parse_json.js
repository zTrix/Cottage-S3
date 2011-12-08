#!/usr/bin/env node

var stdin = process.stdin;

stdin.resume();

var indentation = '    ';

function print(obj, level) {
    var indent = '';
    for (var i = 0; i < level; i++) {
        indent += indentation;
    }
    var t = typeof obj;
    if (t == 'number') {
        console.log(indent + obj);
    } else if (t == 'string') {
        var sp = obj.split('\n');
        sp.forEach(function (e) {
            console.log(indent + e);
        });
    } else if (t == 'array') {
        console.log(indent + '[');
        obj.forEach(function (e) {
            print(e, level + 1);
        });
        console.log(indent + ']');
    } else if (t == 'object') {
        console.log(indent + '[');
        for (var i in obj) {
            print(obj[i], level + 1);
        }
        console.log(indent + ']');
    }
}

var input = '';
stdin.on('data', function (data) {
    input += data;
}).on('end', function () {
    try {
        var obj = JSON.parse(input);
        for (var i in obj) {
            console.log(i + ":");
            print(obj[i], 1);
        }
    } catch (err) {
        console.log(input);
    }
});

