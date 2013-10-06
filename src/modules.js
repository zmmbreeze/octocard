/*jshint laxbreak:true */

var modules = {
    mods: {},
    /**
     * Get module.
     *
     * @param {string} name module name.
     */
    get: function(name) {
        return this.mods[name];
    },
    /**
     * Add module.
     *
     * @param {string} name .
     * @param {Function} module .
     */
    add: function(name, module) {
        this.mods[name] = module;
    }
};
