console.log('running script.js')
function do_something(option){    
    fetch('/do_something', { // sends request to endpoint with the url /do_something
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({option: option}), // body of request includes the option that was passed as an argument
        cache: 'no-cache',
        headers: new Headers({
            'content-type': 'application/json'
        })
    }).then(async function(response){
        document.getElementById('response').innerHTML = (JSON.stringify((await response.json())['result'])) // response from endpoint
    })
}