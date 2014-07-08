(function () {
    'use strict';
    // sanity check for window.console
    if (!window.console) {
        // ensure console.log() doesn't break on IE
        /*global console:true */
        console = {log: function() {}};
    }
})();
