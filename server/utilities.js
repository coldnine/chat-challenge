module.exports = function() {
    var module = {};

    // Escape HTML strings
    module.escape_html = function (string) {
        const entity_map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };

        return String(string).replace(/[&<>"'`=\/]/g, function (s) {
            return entity_map[s];
        });
    };

    return module;
};