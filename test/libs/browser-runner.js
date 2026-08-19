// Headless-Chrome QUnit runner: loads jQuery's test/index.html, waits for the
// suite to finish, prints the QUnit summary plus every failing test, and exits
// non-zero when any test failed.
const puppeteer = require( "puppeteer" );

( async function() {
	const url = process.argv[ 2 ];
	const browser = await puppeteer.launch( {
		args: [ "--no-sandbox", "--disable-setuid-sandbox" ]
	} );
	const page = await browser.newPage();
	page.on( "pageerror", function( err ) {
		console.log( "PAGE ERROR: " + err.message );
	} );
	await page.goto( url, { waitUntil: "domcontentloaded", timeout: 120000 } );
	await page.waitForFunction( function() {
		const el = document.getElementById( "qunit-testresult" );
		return !!el && /completed/.test( el.textContent );
	}, { timeout: 900000, polling: 2000 } );
	const result = await page.evaluate( function() {
		const el = document.getElementById( "qunit-testresult" );
		const failed = [];
		const nodes = document.querySelectorAll( "#qunit-tests > li.fail" );
		for ( let i = 0; i < nodes.length; i++ ) {
			const mod = nodes[ i ].querySelector( ".module-name" );
			const name = nodes[ i ].querySelector( ".test-name" );
			failed.push(
				( mod ? mod.textContent + ": " : "" ) +
				( name ? name.textContent : "(unnamed)" )
			);
		}
		return { text: el.textContent, failed: failed };
	} );
	console.log( "QUnit results: " + result.text );
	for ( const name of result.failed ) {
		console.log( "FAILED TEST: " + name );
	}
	console.log( "Total failing tests: " + result.failed.length );
	await browser.close();
	process.exit( result.failed.length > 0 ? 1 : 0 );
} )();
