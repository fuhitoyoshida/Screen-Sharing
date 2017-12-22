//モジュール導入
var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var attendance = {};
var userId = 0;

// HTTPリクエストを受け取る部分
app.get('/', function(req, res) {
  //rootがアクセスされた場合にindex.htmlにつなげる
  //_dirnameには現在実行中のソースコードが格納されているディレクトリパスが格納
  res.sendFile(__dirname + '/index.html', function(err){});
});

//socket.ioに接続された時に動く処理
io.on('connection', (socket) => {
  //ユーザの入室を登録
  attendance[userId++] = socket.id;
  //接続時に振られた一意のIDをコンソールに表示
  console.log('入室者ID : %s', socket.id);
  //接続時に全員にIDを表示（messageというイベントでクライアント側とやりとりする）
  io.emit('message', socket.id + 'さんが入室しました！', 'System');
  
  //messageイベントで動く
  //全員に取得したメッセージとIDを表示
  socket.on('message', function(msj) {
    io.emit('message', msj, socket.id);
  });

  //接続が切れた時に動く
  //接続が切れたIDを全員に表示
  socket.on('disconnect', function(e) {
    var member = ""; 
    Object.keys(attendance).forEach(function(key) {
      member += attendance[key];
      member += " ";
    });
    io.emit('message', member, '部屋メンバー');
    console.log('接続が切れたID : %s', socket.id);
  });
});

//接続待ち状態になる
server.listen(8080);
