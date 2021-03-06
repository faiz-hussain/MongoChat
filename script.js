
  (function(){
    var element = function(id){
      return document.getElementById(id);
    }

    //Get Elements
    var status = element('status');
    var messages = element('messages');
    var textarea = element('textarea');
    var username = element('username');
    var clearBtn = element('clear');
    var send = element('send');

    //Set Default Status
    var statusDefault = status.textContent;

    var setStatus = function(s){
      //Set the Status
      status.textContent = s;

      if(s !== statusDefault){
        var delay = setTimeout(function(){
          setStatus(statusDefault);
        }, 4000);
      }
    }
    //Connect to Socket.io
    var socket = io.connect('http://127.0.0.1:5000');

    //Check for Connection
    if(socket !== undefined){
      console.log('Connected to Socket');

      //Handle Output
      socket.on('output', function(data){
        // console.log(data);
        if(data.length){
          for(var i = 0; i < data.length; i ++){
            //Build out message div
            var message = document.createElement('div');
            message.setAttribute('class', 'chat-message');
            message.textContent = data[i].name+": "+ data[i].message;
            messages.appendChild(message);
            messages.insertBefore(message, messages.firstChild);
          }
        }
      });

      //Get Status From Server
      socket.on('status', function(data){
        //Get Message Status
        setStatus((typeof data === 'object') ? data.message : data);

        //If status is clear, clear text
        if(data.clear){
          textarea.value = '';
        }
      });

      //Handle Input 
      textarea.addEventListener('keydown', function(event){
        if(event.which === 13 && event.shiftKey == false){
          //Emit to server input
          socket.emit('input', {
            name:username.value,
            message:textarea.value
          });
          event.preventDefault();
        }
      })

         //Handle Input On Send Button Press
      send.addEventListener('click', function(event){
          //Emit to server input
          socket.emit('input', {
            name:username.value,
            message:textarea.value
          });
          event.preventDefault();
      })

      //Handle Chat Clear
      clearBtn.addEventListener('click', function(){
        socket.emit('clear');
      });

      //Clear Message
      socket.on('cleared',function(){
        messages.textContent = '';
      })
    }

  })();