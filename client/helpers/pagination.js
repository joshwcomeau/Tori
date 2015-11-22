PaginationHelper = function(limitVar, loadingVar) {
  // limitVar:    a ReactiveVar that keeps track of how many we're requesting
  //              from the publication.
  // loadingVar:  (optional) a Boolean ReactiveVar that keeps track of whether
  //              we've received all that we've requested from the server.
  let $window   = $(window);
  let $document = $(document);

  $window.on('scroll', _.debounce((ev) => {
    // If we're within 100px from the bottom of the document, load more!
    if ( $window.scrollTop() + $window.height() > $document.height() - 100 ) {
      // increment by 4.
      limitVar.set( limitVar.get() + 4 );

      if ( loadingVar ) loadingVar.set( true );
    }
  }, 500));

}
