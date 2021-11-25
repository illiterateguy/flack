document.addEventListener('DOMContentLoaded', () => {

    if  (!localStorage.getItem('channel'))
    {
        localStorage.setItem('channel',"spacebox");
    }    
    else
    {
        const name = localStorage.getItem('channel');
        if ( name !== "spacebox")
        {
            console.log(name);
            //document.querySelector('#channel_').click();
            console.log(document.querySelector("#" + CSS.escape(name) ));
            //document.querySelector("#" + CSS.escape(name) ).click();
            //document.querySelector("#" + CSS.escape(name) ).click();
        const request = new XMLHttpRequest();
        request.open('POST', '/getmessages');

        // Callback function for when request completes
        request.onload = () => {

            // Extract JSON data from request
            const data = JSON.parse(request.responseText);

            console.log(data);
        if (data.channel_found)
        {    
            if (data.length !== 0){
            // Update the messages
                data.messages.forEach(message =>{
                const contents = messagetemplate({'message_sender':message["sender"],'message_text':message["text"],'message_datetime':message["datetime"]}); 
                document.querySelector('#messagecontainer').innerHTML += contents;
                });
            }
            else{
                document.querySelector('#messagecontainer').innerHTML = "";
            }
                
            // update the heading
                document.querySelector('#channelheading').innerHTML = name;
        }
    };
       
        const data = new FormData();
        data.append('channelname',name);
        request.send(data);
    }
    }

        
    


    var channels = document.querySelector('.list-group-item-action');

    // for messaging part
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    socket.on('connect', function() {
        socket.emit('my event', {data: 'I\'m connected!'});
    });
    // When connected, configure buttons
    socket.on('connect', () => {

        document.querySelector('#messagebtn').onclick = function()
        {
            const heading = document.querySelector('#channelheading').innerHTML;
            if (heading !== "SPACEBOX")
            {
                //const username = document.querySelector('#username').dataset.username;
                const text = document.querySelector('#messagebox').value;
                if (text.length !== 0)
                {
                    socket.emit('submit message',{'text':text,'channelname':heading});
                }
            }
            document.querySelector('#messagebox').value = "";
        };    
    });

    const messagetemplate = Handlebars.compile(document.querySelector('#messagetemplate').innerHTML);

    //listen for messages
    socket.on('new message', data => {
        const channelname = document.querySelector('#channelheading').innerHTML;
        if (data.channelname === channelname)
        {
        if (data.messagesfull)
        {
            document.querySelector('.message').remove();
        } 
        const new_message = messagetemplate({"message_sender":data.sender,"message_text":data.text,"message_datetime":data.datetime})        
        document.querySelector('#messagecontainer').innerHTML += new_message;
        }
    });

    //for channel creation and checking

    //check for no empty channel name submission
    
    // By default, submit button is disabled
    document.querySelector('#submitbtn').disabled = true;
    // Enable button only if there is text in the input field
    document.getElementsByName('channelname')[0].onkeyup = () => {
        if (document.getElementsByName('channelname')[0].value.length > 0)
            document.querySelector('#submitbtn').disabled = false;
        else
            document.querySelector('#submitbtn').disabled = true;
        };

    // checking pass and confirm pass same if they are there otherwise submitting xmlhttprequest with data[password] = none;    
    const template = Handlebars.compile(document.querySelector('#template').innerHTML);
    document.querySelector('#createchannel').onsubmit = function(){
        const request = new XMLHttpRequest();
        request.open('POST', '/createchannel');
        var channelname = document.getElementsByName('channelname')[0].value;
        var withoutpass = document.querySelector('#inlineRadio2');

        // Add data to send with request
        const data = new FormData();
        data.append('channelname',channelname);

        if (!withoutpass.checked)
        {
            password = document.querySelectorAll('#password .form-control');
            if (password[0].value != password[1].value)
            {
                alert('password and confirm password do not match');
                return false;
            }
            else
            {
                data.append('password',password[0].value);
            }
        }
        else
        {
            data.append('password',null);
        }

        // Callback function for when request completes
        request.onload = () => {

            // Extract JSON data from request
            const data = JSON.parse(request.responseText);

            // Update the result div
            if (data.success) {
               // Add channel to DOM.
                const content = template({'channel': channelname});
                console.log(content);
                document.querySelector('.list-group').innerHTML += content;
                
                //set id = channelname to the newly created channel button
                const allchildnodes = document.querySelector('.list-group').childNodes;
                const len = allchildnodes.length;
                console.log(allchildnodes[len-2]);
                allchildnodes[len-2].setAttribute("id",channelname);

                
        
            }
            else {
                alert('channel name already taken.please choose another name');
                return false;
            }
        };       

        // Send request
        console.log(data);
        request.send(data);
        toggle();
        return false;
    };

    document.querySelector('#channel_').onclick = function(){
    channels = document.querySelectorAll('.list-group-item-action');    
    if (channels !== null){
    channels.forEach( button =>{
        button.onclick = function(){

        channelname = this.innerHTML;    
        const heading = document.querySelector('#channelheading').innerHTML;

        if (channelname !== heading){
        const request = new XMLHttpRequest();
        request.open('POST', '/getmessages');

        // Callback function for when request completes
        request.onload = () => {

            // Extract JSON data from request
            const data = JSON.parse(request.responseText);

            console.log(data);
        if (!data.have_password)
        {
            document.querySelector('#messagecontainer').innerHTML = "";
            if (data.messages.length !== 0){
            // Update the messages
                data.messages.forEach(message =>{
                const contents = messagetemplate({'message_sender':message["sender"],'message_text':message["text"],'message_datetime':message["datetime"]}); 
                document.querySelector('#messagecontainer').innerHTML += contents;
                });
            }

            // update the heading
            document.querySelector('#channelheading').innerHTML = channelname;
            localStorage.setItem('channel',channelname);
        }    
        else
        {
            document.querySelector('.popup2').classList.toggle('active');
            document.querySelector('#passwordsubmit').onclick = function(){
                if (document.querySelector('#channelpassword .form-control').value !== data.password)
                {
                    alert('wrong password');
                }
                else
                {
                    document.querySelector('#messagecontainer').innerHTML = "";
                    if (data.messages.length !== 0){
                        // Update the messages
                        data.messages.forEach(message =>{
                        const contents = messagetemplate({'message_sender':message["sender"],'message_text':message["text"],'message_datetime':message["datetime"]}); 
                        document.querySelector('#messagecontainer').innerHTML += contents;
                        });
                    }
                    
                    // update the heading
                    document.querySelector('#channelheading').innerHTML = channelname;
                    localStorage.setItem('channel',channelname);    
                }
                document.querySelector('.popup2').classList.toggle('active');   
            };

            document.querySelector('#passsubmitcancel').onclick = function(){
                document.querySelector('.popup2').classList.toggle('active');
            };
        }
        
        };
            
        const data1 = new FormData();
        data1.append('channelname',channelname);
        request.send(data1);

    }
    };
    });
}};


    var pass = document.querySelector('#password');

    document.querySelector('#inlineRadio2').onclick = () => {
    document.querySelector('#password').remove();     
    };

    document.querySelector('#inlineRadio1').onclick = () => {
    document.querySelector('.col-10.mx-auto').append(pass);     
    };

});

function toggle()
{
document.querySelector('#blur').classList.toggle('active');
document.querySelector('.popup').classList.toggle('active');
}