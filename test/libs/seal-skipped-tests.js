// Seal: skip the handful of tests that assert browser behaviour the release-era
// browsers had and current headless Chrome no longer does. Each is a property of
// the test environment, not of jQuery's own code, and none touches a code path
// under patch. Every other test in the suite still runs.
//
// Verified against Chrome/131.0.6778.204 with the test tree served by
// `PHP_CLI_SERVER_WORKERS=10 php -S` (see .travis.yml). The worker count is
// load-bearing for this list: a single-process `php -S` serves nothing else
// while one of the deliberately slow fixtures is open, so it starved tests that
// then looked like browser incompatibilities. "Tolerating alias-masked DOM
// properties (#14074)" was skipped for that reason and passes once the server
// can serve concurrently, so it is no longer listed here.
( function() {

var skipped = {

	// Chrome removed the `unload` event: it is blocked by Permissions Policy, so
	// the listener this test hangs its only assertion on never runs and QUnit
	// fails the test on its 20s timeout ("Test timed out" at qunit.js:201).
	// Probed directly on a page served from this tree:
	// `document.featurePolicy.allowsFeature( "unload" )` === false, and Chrome
	// logs "Permissions policy violation: unload is not allowed in this
	// document." The iframe does navigate and `pagehide` does fire, so this is
	// the event's removal and not a fixture that failed to load.
	"Triggering the removeData should not throw exceptions. (#10080)": true,

	// Same `unload` removal as #10080 above, and additionally depends on a
	// synchronous XHR started from inside that handler. test/data/ajax/
	// onunload.html only calls back from its `unload` listener, so the callback
	// never fires and QUnit fails on its timeout ("Test timed out" at
	// qunit.js:201).
	"#14379 - jQuery.ajax() on unload": true,

	// Asserts integer offsets; Chrome reports fractional (subpixel) geometry.
	// Actual failure: "Check top / Expected: 1000 / Result: 999.984375" at
	// test/unit/offset.js:553. The companion "Check left" assertion passes, so
	// only the vertical subpixel rounding differs.
	"fractions (see #7730 and #7885)": true
};

function skipper( original ) {
	return function( name ) {
		if ( skipped[ name ] ) {
			return undefined;
		}
		return original.apply( this, arguments );
	};
}

QUnit.test = skipper( QUnit.test );
QUnit.asyncTest = skipper( QUnit.asyncTest );
window.test = QUnit.test;
window.asyncTest = QUnit.asyncTest;

} )();
