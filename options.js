$( function(){
	if ( localStorage[ "checkCommit" ] !== undefined && localStorage[ "checkCommit" ] === "false" ) {
		$( "#checkCommit" ).prop( "checked", false );
	}
	if ( localStorage[ "checkLines" ] !== undefined && localStorage[ "checkLines" ] === "false" ) {
		$( "#checkLines" ).prop( "checked", false );
	}

	$( "#checkCommit, #checkLines" ).flipswitch({ theme: "a" });

	$( document ).on( "change", "#checkCommit", function(){
		localStorage[ "checkCommit" ] = $( this ).is( ":checked" );
	});
	$( document ).on( "change", "#checkLines", function(){
		localStorage[ "checkLines" ] = $( this ).is( ":checked" );
	});
});
