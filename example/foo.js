"use strict";
exports.__esModule = true;
var tslib_1 = require("tslib");
var e_1, _a;
var fs_1 = require("fs");
var a = fs_1["default"].existsSync('what');
var b = 123;
try {
    for (var someArray_1 = tslib_1.__values(someArray), someArray_1_1 = someArray_1.next(); !someArray_1_1.done; someArray_1_1 = someArray_1.next()) {
        var b_1 = someArray_1_1.value;
        console.dir(b_1);
    }
}
catch (e_1_1) { e_1 = { error: e_1_1 }; }
finally {
    try {
        if (someArray_1_1 && !someArray_1_1.done && (_a = someArray_1["return"])) _a.call(someArray_1);
    }
    finally { if (e_1) throw e_1.error; }
}
