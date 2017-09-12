var express = require('express');
var mongo = require('mongodb').MongoClient;
var client = require('socket.io').listen(5000).sockets;

// Connect to Mongo
mongo.connect('mongodb://127.0.0.1/mongochat', function(err, db){
  if(err){
    throw err;
  }
  console.log('MongoDB connected');
  // Connect to Socket.io
    client.on('connection', function(socket){
      let chat = db.collection('chats');

    // Function to send status
    sendStatus = function(s){
      socket.emit('status', s);
    }
    //Get chats from Mongo collection
    chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
      if(err){
        throw err;
      }
      //Emit the messages
      socket.emit('output', res);
    });

      //Handle input events 
      socket.on('input', function(data){
        let name = data.name;
        let message = data.message;
        
        //Check for name & message
        if(name == '' || message == ''){
          //Send error status
          sendStatus('Please enter a name and message');
        } else {

          //Insert message 
          chat.insert({name: name, message: message}, function(){
            client.emit('output', [data]);

            //Send status object
            sendStatus({
              message: 'Message Sent',
              clear: true
            });
          })
        }
      });
      //Handle clear
      socket.on('clear', function(data){
        //Remove all cahts from collection
        chat.remove({}, function(){
          //Emit cleared
          socket.emit('cleared');
        })
      })
  })
});
