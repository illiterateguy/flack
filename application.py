import os,datetime

from flask import Flask,render_template,session,request,jsonify
from flask_socketio import SocketIO, emit
from flask_session import Session

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

channels = {}

"""
class channel:
    def __init__(self,name,password):
        self.name = name
        self.password = password
        self.messages = []
        
class message:
    def __init__(self,sender,date_time,text):
        self.sender = sender
        self.datetime = date_time
        self.text = text  

                
"""
datetime1 = datetime.datetime.now().strftime("%c")
datetime1 = datetime1
datetime2 = datetime.datetime(2020,6,5,5,4,3,0)

message1 = ["amber",datetime1,"hi i love you"]
message2 = ["sophiya",datetime2,"hi i love you great to see you you are a great guy"]
messages = [message1,message2] 

@app.route("/")
def index():
    if "username" not in session.keys():
        return render_template("index.html")
    else:
        return render_template("base.html",channels=channels.keys(),username=session["username"])

@app.route("/register", methods=["POST"])
def register():
    username = request.form.get("username")
    session["username"] = username
    return render_template("base.html",channels=channels.keys(),username=session["username"])       

@app.route("/createchannel", methods=["POST"])
def createchannel():
    channelname = request.form.get('channelname')
    password = request.form.get('password')
    #channelvar = channel(channelname,password)
    if channelname not in channels.keys():
        channels[channelname] = [password,[]]
        print(len(channels))                                     #for debugging only
        return jsonify({"success":True})                       
    else:
        return jsonify({"success":False})     
    
@app.route("/getmessages", methods=["POST"])
def getmessages():
    channelname = request.form.get('channelname')
    if channelname not in channels.keys():
        return jsonify({"channel_found":False})
    if (channels[channelname][0] != 'null'):
        print (channels[channelname][0])
        return jsonify({"channel_found":True,"have_password":True,"messages":channels[channelname][1],"password":channels[channelname][0]})
    else:
        return jsonify({"channel_found":True,"have_password":False,"messages":channels[channelname][1]})

@socketio.on("submit message")
def newmessage(data):
    channelname = data["channelname"]
    if len(channels[channelname][1]) >= 100:
        channels[channelname][1].pop(0)
        emit("new message",{"channelname":channelname,"messagesfull":True,"sender":session["username"],"text":data["text"],"datetime":datetime.datetime.now().strftime("%c")},broadcast=True)
    else:
        emit("new message",{"channelname":channelname,"messagesfull":False,"sender":session["username"],"text":data["text"],"datetime":datetime.datetime.now().strftime("%c")},broadcast=True)
    channels[channelname][1].append({"sender":session["username"],"text":data["text"],"datetime":datetime.datetime.now().strftime("%c")})
    print("new message came : " + data["text"])

@socketio.on("my event")
def connect(message):
    print(message["data"])