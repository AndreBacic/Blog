const getRefreshAccessToken = (uri, options) => {
  
  this.refreshingPromise = null;
  let initialRequest = fetch(uri, options);
  let persistent = false;

// make sure graphql returns http codes 200 and 401
  return initialRequest.then((response) => {
  // everything works as usual because the server accepted our initial credentials
    if (response.status == 200) {
      return response;
    } else {
    // if not and we get a 401, try refreshing our access token by making a call to our auth server
      if (response.status == 401) {
        if (!this.refreshingPromise) {
        	// localStorage is for private computers, sessionStorage for public computers, they delete themselves after closing the browser
          let ls = localStorage.getItem('refresh');
          let ss = sessionStorage.getItem('refresh');

          if (ls)
            persistent = true;

          this.refreshingPromise = fetch(_url.auth, { method: 'POST', headers: { 'x-refresh-token': ls || ss } })
            .then((res) => {
              if (res.ok){
                return res.json().then((json) => {
                  if (json.success == true) {
                    return json;
                  } else {
                  	// auth logout simply removes any tokens from storage, resets the client and does other work you might want to see when logging out
                    auth.logout();
                  }
                })
              } else {
                auth.logout();
              }
            })
        }
        return this.refreshingPromise.then((json) => {
          this.refreshingPromise = null;
          if (persistent) {
            localStorage.setItem('access', json.access);
          } else {
            sessionStorage.setItem('access', json.access);
          }
          // if it all worked, let's set our new access headers and try another time to call our api and return the result
          options.headers.authorization = json.access;
          return fetch(uri, options);
        })
      }
    }
  })
}

const httpLink = createHttpLink({
  uri: _url.graphql,
  fetch: getRefreshAccessToken
});

// .. some things in between I left out

// setup for our middleware, standard authorization header with an access token used for every call to graphql
const middlewareLink = setContext(() => ({
  headers: {
    authorization: localStorage.getItem('access') || sessionStorage.getItem('access') || null,
  }
}));

// create the apollo client and export it here