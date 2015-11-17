// Set up server, hook on processors for sockets and files
var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');
// Set up connection scaffolding for later use
var mongodb     = require( 'mongodb' ),
  url = 'mongodb://localhost:27017/testdb',
  MongoClient = mongodb.MongoClient;

app.listen(8000);

// This code responds to all requests with the same page
function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  });
}

io.on('connection', function (socket) {
  // Remember we're server side here
  var writefile = fs.createWriteStream('myFile');
  //
  //
  //                WAIT HERE for upload events to occur
  //
  //
  socket.on('upload', function(data) {
    console.log(data);
    // Let's try to save it in the database
    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        //HURRAY!! We are connected. :
        console.log('Connection established to', url);
      }
    // Set up to write to the 'test' collection
    var collection = db.collection('test');
    // Save the data that came with the socket.io message
    collection.insert(data, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log('Inserted %d documents into the "test" collection. The documents inserted with "_id" are:', result.insertedCount, result);
      }
      //Close connection
      db.close();
      });
    });
    // Here's how you write one piece of data which always overwrites the file
    writefile.write(JSON.stringify(data));
    writefile.write('\n');
  });
})
