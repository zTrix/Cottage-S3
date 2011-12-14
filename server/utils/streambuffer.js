/**
 * a helper buffer to hold http request data when you need to call req.on('data'
 * after another async functions be called
 *  see : http://tech.richardrodger.com/2011/03/28/node-js-%E2%80%93-dealing-with-submitted-http-request-data-when-you-have-to-make-a-database-call-first/
 */

module.exports = 

function StreamBuffer(req) {
  var self = this

  var buffer = []
  var ended  = false
  var ondata = null
  var onend  = null

  self.ondata = function(f) {
    for(var i = 0; i < buffer.length; i++ ) {
      f(buffer[i])
    }
    ondata = f
  }

  self.onend = function(f) {
    onend = f
    if( ended ) {
      onend()
    }
  }

  req.on('data', function(chunk) {
    if( ondata ) {
      ondata(chunk)
    }
    else {
      buffer.push(chunk)
    }
  })

  req.on('end', function() {
    ended = true
    if( onend ) {
      onend()
    }
  })        
 
  req.streambuffer = self
};

