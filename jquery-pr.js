var authors = [],
	list = $( "#status-list" ),
	validEmailRexex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
	claAddress = "https://spreadsheets.google.com/feeds/list/0Aj5JJFjq9rZDdFJucXdGZXlRdVh2SUVUb2hsb0FBYkE/1/public/values?alt=json-in-script&sq=emailaddress%3D",
	caaAddress = "https://spreadsheets.google.com/feeds/list/0AgyHrN8YnS0IdDdvWkJRaHFoQmRuazFhUm8zckViMHc/1/public/values?alt=json-in-script&sq=emailaddress%3D";

asyncTest( "Fetched .patch file", function(){
	expect( 1 );
	chrome.tabs.getSelected( null, function( tab ) {
		if( !/https:\/\/github.com\/jquery\/[^\/]+\/pull\//.test( tab.url ) ) {
			ok( false, "This tool only works on PR's for jquery foundation repos on github" );
			start();
		}
		var url = tab.url.replace( /\/files$|\/commits$/, "" ),
			record = false;
		$.get( url + ".patch", function( data ) {
			var authorLine = "";
			$.each( data.split( "\n" ), function( i, val ){
				if( /^From:/.test( val ) ){
					authorLine = val;
					record = true;
				} else  if( record === true && /^\s/.test( val ) ) {
					authorLine += val;
				} else if( record === true ) {
					var author = {},
						parts = authorLine.split( " " ),
						length = parts.length;

					author.email = parts[ length -1 ].replace( /<|>/g, "" );
					parts.splice( 0, 1 );
					parts.splice( length - 2, 1);
					author.name = mimefuncs.quotedPrintableDecode( mimefuncs.mimeWordsDecode( parts.join( " " ) ) );
					authors.push( author );
					record = false;
				}
			});
			if( authors.length > 0 ){
				ok( true, authors.length + " Authors Found" );
				start();
				checkAuthors();
				if( localStorage[ "checkCommit" ] === "true" || localStorage[ "checkCommit" ] === undefined ) {
					checkCommits( data );
				}
				if( localStorage[ "checkLines" ] === "true" || localStorage[ "checkCommit" ] === undefined ) {
					checkLineLength( data );
				}
			}
		});
	});
});

function validEmail ( email ) {
	return validEmailRexex.test( email );
}
function validName ( name, entrys, caa ) {
	var length = name.split( " " ).length,
		returnValue = true;

	if( length <= 1 ){
		if( entrys ) {
			$.each( entrys, function( index , entry ) {
				if( !caa && entry.gsx$nameconfirmation.$t === "" ) {
					returnValue = false;
				}
			});
		} else {
			returnValue = false;
		}
	}

	return returnValue;
}
function fetchSpreadsheet( author, url, caa, found, claData ) {
	$.ajax({
		url: url + "%22" + encodeURIComponent( author.email ) + "%22",
		success: function( data ) {
			if( data.feed.entry !== undefined ) {
				if( checkName( author, data.feed.entry ) ){
					ok( validName( author.name, data.feed.entry ), "Name length valid or confimed" );
					ok( checkConfirmation( data.feed.entry ), "Confirmed signing" );
					ok( true, "Name matches");
					start();
				} else if( !caa ) {
					fetchSpreadsheet( author, caaAddress, true, true, data );
				} else {
					ok( validName( author.name, data.feed.entry, caa ), "Name length valid or confimed" );
					ok( checkConfirmation( data.feed.entry ), "Confirmed signing" );
					ok( false, "Name does not match " + author.name + " != " +
						data.feed.entry[0].gsx$fullname.$t );
					start();
				}
			} else if( !caa ) {
				fetchSpreadsheet( author, caaAddress, true );
			} else if( found ) {
				ok( validName( author.name, claData.feed.entry ), "Name is at least 2 parts ( " + author.name + " )" );
				ok( checkConfirmation( claData.feed.entry ), "Confirmed signing" );
				ok( false, "Name does not match " + author.name + " != " +
					claData.feed.entry[0].gsx$fullname.$t );
				start();
			} else {
				ok( validName( author.name ), "Name is at least 2 parts ( " + author.name + " )" );
				ok( false, "Confirmed signing" );
				ok( false, "Email not found in sheet" );
				start();
			}
		},
		error: function(){
			ok( false, "Confirmed signing" );
			ok( validName( author.name ), "Name is at least 2 parts ( " + author.name + " )" );
			ok( false, "Error fetching sheet" );
			start();
		},
		dataType: "JSONP"
	});
}
function checkName ( author, sheet ) {
	var match = false;
	$.each( sheet, function( index, val ){
		if( val.gsx$fullname.$t === author.name ) {
			match = true;
			return;
		}
	});
	return match;
}
function checkConfirmation ( sheet ) {
	$.each( sheet, function( index, val ){
		if( val.gsx$confirmation.$t === "I AGREE" ) {
			match = true;
			return;
		}
	});
	return match;
}
function checkAuthors() {
	$.each( authors, function( index, author ){
		asyncTest( "Commit " + ( index + 1 ) + " Author Valid", function(){
			ok( validEmail( author.email ), "Email is Valid  ( " + author.email + " )" );
			if ( validEmail( author.email ) ) {
				expect( 4 );
				fetchSpreadsheet( author, claAddress );
			} else {
				ok( validName( author.name ), "Name is at least 2 parts ( " + author.name + " )" );
				expect( 2 );
				start();
			}
		});
	});
}
function getCommitMessages( patch ){
	var record = false,
		commits = [],
		captureSecond = false,
		commit;

	$.each( patch.split( "\n" ), function( index, line ){
		if( /^Subject\:/.test( line ) ){
			if ( line.length >= 70 ) {
				captureSecond = true;
			}
			commit = line;
			record = true;
		} else if( captureSecond && record && !/^---/.test( line ) ) {
			commit += line;
			captureSecond = false;
		} else if( record && !/^---/.test( line ) ) {
			captureSecond = false;
			commit += "\n" + line;
		} else if( record && /^---/.test( line ) ) {
			record = false;
			captureSecond = false;
			commits.push( commit.replace( /Subject\:\s/, "" ).replace(/\[PATCH([0-9\/\s])*\](\s)*/, "") );
		}
	});
	return commits;
}
function getCommitLines( patch ){
	var commitName,
		record = false,
		files = {};
	$.each( patch.split( "\n" ), function( index, line ){
		if( /^\+\+\+/.test( line ) && !/(\.js)$/.test( line ) ){
			record = false;
		} else if( /^\+\+\+/.test( line ) && /(\.js)$/.test( line ) ) {
			record = true;
			fileName = line.replace( /^\+\+\+ b/, "" );
			if( files[ fileName ] === undefined ) {
				files[ fileName ] = [];
			}
		} else if( /^\+\s/.test( line ) && record ) {
			files[ fileName ].push( line.replace(/^\+/, "" ) );
		}
	});
	return files;
}
function checkCommitMessage( message ) {

	// Thanks to Jörn Zaefferer and commitPlease for this commmit message check
	var errors = [];

	message.split(/\n/).forEach(function ( line, index ) {
		// skip comments
		if ( /^#/.test( line ) ) {
			return;
		}
		if ( index === 0 ) {
			// allow tag commits
			if ( line.length > 72 ) {
				errors.push( "First line (subject) must be no longer than " +
					72 + " characters" );
			}

			if ( line.indexOf( ":" ) < 1 ) {
				errors.push( "First line (subject) must indicate the component" );
			}

			if ( line.substring( line.indexOf( ":" ) + 1 ).length < 1 ) {
				errors.push( "First line (subject) must have a message after the component" );
			}
		}
		if ( index === 1 && line.length > 0 ) {
			errors.push( "Second line must always be empty" );
		}
		if ( index > 1 && line.length > 80 ) {
			errors.push( "Commit message line " + ( index + 1 ) + " too long: " +
				line.length + " characters, only " + 80 +
				" allowed. Was: " + line.substring( 0, 20 ) + "[...]" );
		}
		// ticket references
		if ( /^(clos|fix|resolv)(e[sd]|ing)/i.test( line ) ) {
			if ( !/^(Fixes|Closes)\s+[^\s\d]+(\s|$)/.test( line ) &&
					!/^(Fixes|Closes) (.*#|gh-)[0-9]+/.test( line ) ) {
				errors.push( "Invalid ticket reference, must be " +
					"/(Fixes|Closes) (.*#|gh-)[0-9]+/, was: " + line );
			}
		}
	});

	return errors;
}
function checkCommits( patch ) {
	var commits = getCommitMessages( patch );
	$.each( commits, function( index, commit ){
		test( "Commit " + ( index + 1 ) + " message meet guidlines", function(){
			var errors = checkCommitMessage( commit );

			if( errors.length > 0 ){
				$.each( errors, function( i, error ){
					ok( false, error );
				});
			} else {
				ok( true, "Commit message valid" );
			}
		});
	});
}
function checkLineLength( patch ) {
	var files = getCommitLines( patch );

	if( Object.keys( files ).length > 0 ) {
		$.each( files, function( fileName, lines ){
			test( "file " + fileName + " lines less then 100 characters", function(){
				$.each( lines, function( i, line ){
					var tabCount = line.match( /\t/g ).length,
						length;

					length = line.length + ( tabCount * 3 );
					ok( length < 100, line );
				});
			});
		});
	}
}
