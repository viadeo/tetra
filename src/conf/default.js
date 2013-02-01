// Start tetra.js environment with default settings
// ------------------------------------------------------------------------------
//
// You may also extend the tetra object to configure default settings
//
// tetra.extend({ .. options }).start()
//
// ## Options ##
// - env: default JavaScript environment (jQuery, Prototype, etc.)
// - jsVersion: library version
// - authCallback: function to call for 401 response codes
// - currentRequestCallback: default callback invoked after a re-authentication
// - enableBootnode: enable on-demand loading of dependencies
// - APPS_PATH: location of applications
// - GLOBAL_PATH : location of global models
// - COMP_PATH: location of compiled packages, loaded via data-comp
// - BOOTNODE_HOST: host from which on-demand dependencies should be loaded
// - api: {
//      apiKey: viadeo API key
//      status:
//      cookie:
// }

tetra.start();