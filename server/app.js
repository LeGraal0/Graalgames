const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000;


// ajout de socket.io
const server = require('http').Server(app)
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
})



app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))
app.get('/', function (req, res) {
   res.sendFile('index.html', { root: __dirname })
})

app.get('/json', function (req, res) {
   res.status(200).json({"message":"ok"})
})

var sockets = {};
var players = {};
var dataPlayers = [];
var dataGames = [];
var gamesDices = {};
var timers = {};



// établissement de la connexion
io.on('connection', (socket) =>{

    socket.on('login', function(userData){
        user = {};
        user.uname = userData;
        user.uid = socket.id;
        user.actualGame = "null";
        user.igStatus = "null";
        sockets[user.uid] = socket;
        players[user.uid] = user;
        dataPlayers.push(user);
        
        sockets[user.uid].emit("logged", {user, dataPlayers, dataGames});
        socket.broadcast.emit("new_user", user);
    });

    socket.on("createRoom", params => {
        if (checkLogged(socket)){
            let game = {};
            game.id = makeIdGame();
            game.name = params.name;
            game.playersMax = params.nbPlayers;
            game.nbPlayers = 0;
            game.players = [];
            game.status = "waiting";
            game.owner = socket.id;
            dataGames.push(game);
            socket.emit("autoJoinRoom", game.id);
        }
    });

    socket.on("tryJoinRoom", (gameId) => {
        if (checkLogged(socket)){
            let game = getGameById(gameId);
            if (game.nbPlayers < game.playersMax){
                game.players.push(players[socket.id]);
                game.nbPlayers++;
                dataGames[findIndexGameById(game.id)] = game;
                players[socket.id].actualGame = gameId;
                socket.to(game.id).emit("refreshRoom", game);
                socket.join(game.id);
                socket.emit("joinRoom", game);
            }else{
                socket.emit("joinRoomError", "La partie est pleine.");
            }
        }
    });

    socket.on("refreshGames", function(){
        if (checkLogged(socket)){
            socket.emit("dataGamesRefresh", dataGames);
        }
    });

    socket.on("leaveRoom", function(){
        if (checkLogged(socket)){
            user = players[socket.id];
            game = getGameById(user.actualGame);
            game.players.splice(game.players.indexOf(user), 1);
            game.nbPlayers--;
            index = findIndexGameById(game.id);
            dataGames[index] = game;
            players[socket.id].actualGame = "null";
            
            if (!checkEmptyGame(game)){
                game.owner = game.players[0].uid;
                socket.to(game.id).emit("refreshRoom", game);
            }
        }  
    });

    socket.on("tryStartGame", (gameId)=>{
        if (checkLogged(socket)){
            game = getGameById(gameId);
            if(game.nbPlayers >= 2){
                //                                 Creating Game         
                game.status="started";
                
                game.indexPlaying = getRandomInt(game.nbPlayers);
                game.indexUserId = [];
                game.currentBet = [0, 0];
                game.indexPlayerBet = -1;
                for (let i = 0; i<game.nbPlayers; i++){
                    game.indexUserId[i] = game.players[i].uid;
                    game.players[i].igStatus = "playing";
                }
                socket.to(gameId).emit("joinGame", game);
                socket.emit("joinGame", game);
                //                                 Generating Dices
                diceSet = {};
                diceSet.dices = [];
                diceSet.diceNb = [];
                for (let i = 0; i < game.nbPlayers; i++){
                    diceSet.diceNb[i] = 5;
                }
                gamesDices[game.id] = diceSet;
                for (let i = 0; i<game.nbPlayers; i++){
                    generateDicesFor(game, i);
                }
                
                for (let aPlayer of game.players){
                    sockets[aPlayer.uid].emit("gameDicesReceive", gamesDices[game.id].dices[game.players.indexOf(aPlayer)]);
                }

                timers[game.id] = setTimeout(()=>{ 
                                    turnTimeout(game.id);
                                }, 20000 );
            }
        }
    });

    socket.on("playerBet", (data)=>{
        if (checkLogged(socket)){
            let aGame = getGameById(data[1]);
            let pIndex = aGame.indexUserId.indexOf(data[0]);
            let betDice = data[2][0];
            let betVal = data[2][1];
            
            //Check bet
            let diceForm = (betDice>0 && betDice<=30);
            let valForm = (betVal>0 && betVal<=6);
            let isFirstBet = (aGame.currentBet[0] == 0 && aGame.currentBet[1] == 0);
            let diceUp = (Number(betDice) > Number(aGame.currentBet[0]) && Number(betVal) == Number(aGame.currentBet[1]));      
            let valUp = (Number(betDice) == Number(aGame.currentBet[0]) && Number(betVal) > Number(aGame.currentBet[1]));
            if (pIndex == aGame.indexPlaying){
                if ( diceForm && valForm && (isFirstBet || (diceUp || valUp) ) ){
                    aGame.currentBet = data[2];
                    aGame.indexPlayerBet = aGame.indexPlaying;
                    aGame.indexPlaying = nextIndexPlaying(aGame);
                    
                    dataGames[findIndexGameById(data[1])] = aGame;
                    socket.to(aGame.id).emit("turnChange", aGame);
                    socket.emit("turnChange", aGame);
                }else{
                    console.log("Bet error - Current Bet "+JSON.stringify(aGame.currentBet)+" - Bet "+JSON.stringify(data[2])+"\nDice form : "+diceForm+" - valForm : "+valForm+" - isFirstBet : "+isFirstBet+" - diceUp : "+diceUp+" - "+" - valUp : "+valUp);
                }
            }else{
                console.log("Bet player error");
            }
        }
    })

    socket.on("playerLiar", (gameId)=>{
        if (checkLogged(socket)){
            game = getGameById(gameId);
            currentPIndex = game.indexUserId.indexOf(socket.id);
            previousPIndex = game.indexPlayerBet;

            totalDice = getTotalDiceOf(game);
            rep = [];
            
            if ( totalDice >= game.currentBet[0] ){
                rep = [false, true];                  // rep[0] = playerAskedLiar     rep[1] = playerCurrentBet
            }else{
                rep = [true, false];
            }
            socket.to(gameId).emit("resultLiar", [game, rep, gamesDices[game.id]]);
            socket.emit("resultLiar", [game, rep, gamesDices[game.id]]);

            setTimeout(()=>{
                game = endRound(game, rep);
                dataGames[findIndexGameById(game.id)] = game;
                if( checkEndGame(game) == false ){
                    socket.to(gameId).emit("newRound", game);
                    socket.emit("newRound", game);
                    for (let aPlayer of game.players){
                        sockets[aPlayer.uid].emit("gameDicesReceive", gamesDices[game.id].dices[game.players.indexOf(aPlayer)]);
                    }
                }else{
                    game.status = "ended";
                    dataGames[findIndexGameById(game.id)] = game;
                    winnerI = getWinnerIndex(game);
                    socket.to(gameId).emit("endGame", [game, winnerI]);
                    socket.emit("endGame", [game, winnerI]);
                }
            }, 7000);
        }
    })

    socket.on("leaveGame", function(){
        if (checkLogged(socket)){
            user = players[socket.id];
            game = getGameById(user.actualGame);
            game.players.splice(game.players.indexOf(user), 1);
            game.nbPlayers--;
            index = findIndexGameById(game.id);
            dataGames[index] = game;
            players[socket.id].actualGame = "null";
            
            if (checkEndGame(game) == true){
                winnerI = 0;
                game.status = "ended";
                dataGames[index] = game;
                socket.to(game.id).emit("endGame", [game, winnerI]);
                socket.to(game.id).emit("announce", "Le joueur "+user.uname+" à quitté la partie");
            }else if (!checkEmptyGame(game)){
                if (game.status == "ended"){
                    socket.to(game.id).emit("announce", "Le joueur "+user.uname+" à quitté la partie");
                }else{
                    game.owner = game.players[0].uid;
                    game = endRound(game, [false, false]);
                    socket.to(game.id).emit("newRound", game);
                    socket.to(game.id).emit("announce", "Le joueur "+user.uname+" à quitté la partie");
                }
            }
        }
    });

    socket.on("disconnect", function() {
        if(sockets[socket.id] != undefined){
            if (players[socket.id].actualGame != "null"){
                gid = players[socket.id].actualGame;
                game = getGameById(gid);
                for (let aPlayer of game.players){
                    if (aPlayer.id == socket.id){
                        game.players.splice(game.players.indexOf(player[socket.id]), 1);
                    }
                }
                game.nbPlayers--;
                checkEmptyGame(game);
            }
        }
        sockets[socket.id] = "";
        dataPlayers.splice(dataPlayers.indexOf(players[socket.id]), 1);
        players[socket.id] = "";
    });
})

function makeIdGame() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  
    for (var i = 0; i < 6; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
}

function checkLogged(socket){
    if(players[socket.id] == undefined){
        socket.emit("errNotLogged");
        return false;
    }else{
        return true;
    }
}

function checkEmptyGame(game){
    if(game.nbPlayers == 0){
        dataGames.splice(dataGames.indexOf(game), 1);
        return true;
    }else return false;
}

function findIndexGameById(id){
    for (let aGame of dataGames){
        if (aGame.id == id) {
            return dataGames.indexOf(aGame);
        }
    }
}

function getGameById(id){
    index = findIndexGameById(id);
    if (index != -1){
        return dataGames[index];
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function generateDicesFor(game, userIndex){
    nbDice = gamesDices[game.id].diceNb[userIndex];
    gamesDices[game.id].dices[userIndex] = [];
    for (let i = 0; i < nbDice; i++){
        gamesDices[game.id].dices[userIndex].push(getRandomInt(6)+1);
    }
}

function nextIndexPlaying(game){
    var playing = game.indexPlaying;
    var nbPlayers = game.nbPlayers;
    var status;
    do{
        playing++;
        if (playing >= nbPlayers){
            playing = 0;
        }
        status = game.players[playing].igStatus;
    }while(status != "playing");
    return playing;
       
}

function getTotalDiceOf(game){
    total = 0;
    dices = gamesDices[game.id].dices;
    for (let pDices of dices){
        for (let aDice of pDices){
            if (aDice == game.currentBet[1]){
                total++;
            }
        }
    }
    return total;
}

function endRound(game, resTurn){
    let loserI;
    let winnerI;
    if (resTurn[0] == false && resTurn[1] == false){   // endRound after player leave game
        for (let i = 0; i<game.nbPlayers; i++){
            generateDicesFor(game, i);
        }
        game.currentBet = [0, 0];
        game.indexPlaying = nextIndexPlaying(game);
        game.indexPlayerBet = -1;
        return game;
    }else{
        if (resTurn[0] == true && resTurn[1] == false){   // normal endRound
            loserI = game.indexPlayerBet;
            winnerI = game.indexPlaying;
        }else if (resTurn[1] == true && resTurn[0] == false){
            loserI = game.indexPlaying;
            winnerI = game.indexPlayerBet;
        }
        gamesDices[game.id].diceNb[loserI] = gamesDices[game.id].diceNb[loserI] - 1;
        for (let i = 0; i<game.nbPlayers; i++){
            generateDicesFor(game, i);
        }
        game.currentBet = [0, 0];
        if (gamesDices[game.id].diceNb[loserI] == 0){
            game.indexPlaying = winnerI;
            game.players[loserI].igStatus = "eleminated";
        }else game.indexPlaying = loserI;
        game.indexPlayerBet = -1;
        return game;
    }
}

function checkEndGame(game){
    total = 0;
    for (let aPlayer of game.players){
        if(gamesDices[game.id].diceNb[game.indexUserId.indexOf(aPlayer.uid)] > 0){
            total++;
        }
    }
    if (total == 1){
        return true;
    }else{
        return false;
    }
}

function getWinnerIndex(game){
    winnerI = -1;
    for (let aPlayer of game.players){
        if(gamesDices[game.id].diceNb[game.indexUserId.indexOf(aPlayer.uid)] > 0){
            winnerI = game.indexUserId.indexOf(aPlayer.uid);
        }
    }
    return winnerI;
}

function turnTimeout(gameId){
    console.log("Player turn timeout");
    let game = getGameById(gameId);

    if (game.currentBet[0] == 0){
        game.currentBet = [1, 1];
    }else
        game.currentBet[0] = game.currentBet[0]++;

    game.indexPlayerBet = game.indexPlaying;
    game.indexPlaying = nextIndexPlaying(game);
    dataGames[findIndexGameById(gameId)] = game;
    for (let aPlayer of game.players){
        sockets[aPlayer.uid].emit("turnChange", game);
    }
    timers[gameId] = setTimeout(()=>{ 
                        turnTimeout(game.id);
                    }, 20000 );
}

server.listen(process.env.PORT || port, function () {
 console.log('Votre app est disponible sur localhost:3000 !')
})
