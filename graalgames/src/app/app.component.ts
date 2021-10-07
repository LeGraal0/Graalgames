import { Component } from '@angular/core';
import {io} from 'socket.io-client/build/index';
import { IPlayer, IGame } from './interfaces';

@Component({
  selector: 'app-root',
  template: `
    <!--The content below is only a placeholder and can be replaced.-->
    <div class="content">
        <div class="home center">
          <h2>Jeux multijoueur entre amis !</h2>
          <div *ngIf="isLogin" class="login">
            <h3>Choisis un pseudo et let's go !</h3>
            <input #iUname class="input1" type="text"/>
            <input class="btn1" type="button" value="Go" (click)="login(iUname.value)"/>
          </div>
         <!-- <div *ngIf="isLogged" class="playerList">
            <h3>Salut {{this.user.uname}}, voici les joueurs en ligne :</h3>
            <div *ngFor="let aPlayer of players">
              <p>{{aPlayer.uname}}</p>
            </div>
          </div> -->
          <app-lobby *ngIf="isLobby" [games]="games" (askNewGame)="showNewGame()" (askRefresh)="refreshGames()" (askJoinRoom)="tryJoinRoom($event)"></app-lobby>
          <app-new-game *ngIf="isNewGame" (askCancel)="showLobby()" (askCreateRoom)="createRoom($event)" [name]='user.uname+" Game" '></app-new-game>
          <app-game-lobby *ngIf="isGameLobby" [game]="currentGame" [user]="user" (askLeaveRoom)="leaveRoom()" (askStartGame)="tryStartGame($event)"></app-game-lobby>
          <app-in-game *ngIf="isInGame" [game]="currentGame" [user]="user" [myDices]="myDices" [opponents]="opponents" 
                        (askBet)="sendBet($event)" [minDices]="minDices" [minVal]="minVal" (askLiar)="sendLiar()" [resLiar]="resLiar" [winnerI]="winnerI" (askLeaveGame)="leaveGame()"
                        [betDiceValue]="betDiceValue" [betValValue]="betValValue" [gameDices]="gameDices" [isEndRound]="isEndRound"></app-in-game>
          <app-server-err *ngIf="isServerErr"></app-server-err>
        </div>
    </div>
    <div class="version">Alpha version - WIP</div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'graalgames';

  isLogin = true;
  isLobby = false;
  isNewGame = false;
  isGameLobby = false;
  isInGame = false;
  isServerErr = false;

  socket: any;
  user: IPlayer;
  players: IPlayer[] = [];
  games: IGame[] = [];
  currentGame: IGame;
  myDices: number[];
  opponents: IPlayer[];
  minDices:number = 1;
  betDiceValue:number = 1;
  minVal:number = 1;
  betValValue:number = 1;
  resLiar = [];
  winnerI:number = -1;
  gameDices= [];
  isEndRound = false;

  

  public ngOnInit() {
    this.socket = io("localhost:3000", {     /* https://calm-wildwood-32710.herokuapp.com/  */
      withCredentials: false,
      extraHeaders: {
        "my-custom-header": "abcd"
      }
    });

    this.socket.on("connect_error", (err) => {
      this.showServerErr();
    });

    this.socket.on("errNotLogged", ()=>{
      alert("Error : Connection Lost");
      this.showLogin();
    });

    this.socket.on('logged', (data)=>{
      this.user = data.user;
      this.players = data.dataPlayers;
      this.games = data.dataGames;
      this.showLobby();
    });

    this.socket.on("new_user", (user)=>{
      this.players.push(user);
    });

    this.socket.on("autoJoinRoom", (gameId)=>{
      
      this.tryJoinRoom(gameId);
    });

    this.socket.on("joinRoom", (game)=>{
      this.user.actualGame = game.id;
      this.currentGame = game;
      //DefaultValue
      this.minDices = 1;
      this.betDiceValue = 1;
      this.minVal = 1;
      this.betValValue = 1;
      this.resLiar = [];
      this.winnerI = -1;

      this.refreshGames();
      this.showGameLobby();
    });

    this.socket.on("dataGamesRefresh", (games) =>{
      this.games = games;
    })

    this.socket.on("refreshRoom", (game)=>{
      this.currentGame = game;
    });

    this.socket.on("gameDicesReceive", (dices)=>{
      this.myDices = dices;
    });

    this.socket.on("joinGame", (game)=>{
      this.currentGame = game;
      this.refreshOpponents();

      this.showInGame();
    });

    this.socket.on("turnChange", (game)=>{
      this.currentGame = game;
      this.getMinDices();
      this.getMinVal();
    });

    this.socket.on("newRound", (game)=>{
      this.currentGame = game;
      this.resLiar = [];
      this.minDices = 1
      this.minVal = 1;
      this.betDiceValue = 1;
      this.betValValue = 1;
      this.gameDices = [];
      this.isEndRound = false;
      this.refreshOpponents();
    });

    this.socket.on("resultLiar", (data)=>{
      this.currentGame = data[0];
      this.resLiar = data[1];
      this.gameDices = data[2];
      this.isEndRound = true;
    });

    this.socket.on("endGame", (data)=>{
      this.currentGame = data[0];
      this.winnerI = data[1];
    })

    this.socket.on("announce", (data)=>{

    });

    this.socket.on("disconnect", function(){
      console.log("Server down : Show page");
    })
  }

  public login(uname:string){
    this.socket.emit("login", uname);
  }

  public tryJoinRoom(gameId){
    this.socket.emit("tryJoinRoom", gameId);
  }

  public showLogin(){
    this.isLogin=true;
    this.isLobby=false;
    this.isNewGame = false;
    this.isGameLobby=false;
    this.isInGame = false;
    this.isServerErr = false;
  }

  public showNewGame(){
    this.isLogin=false;
    this.isLobby=false;
    this.isNewGame = true;
    this.isGameLobby=false;
    this.isInGame = false;
    this.isServerErr = false;
  }

  public showLobby(){
    this.isLogin=false;
    this.isLobby=true;
    this.isNewGame=false;
    this.isGameLobby=false;
    this.isInGame = false;
    this.isServerErr = false;
    this.refreshGames();
  }

  public showGameLobby(){
    this.isLogin=false;
    this.isLobby=false;
    this.isNewGame=false;
    this.isGameLobby=true;
    this.isInGame = false;
    this.isServerErr = false;
  }
  
  public showInGame(){
    this.isLogin=false;
    this.isLobby=false;
    this.isNewGame=false;
    this.isGameLobby=false;
    this.isInGame = true;
    this.isServerErr = false;
  }

  public showServerErr(){
    this.isLogin=false;
    this.isLobby=false;
    this.isNewGame=false;
    this.isGameLobby=false;
    this.isInGame = false;
    this.isServerErr = true;
  }

  public createRoom(game){
    this.socket.emit("createRoom", game);
  }

  public refreshGames(){
    this.socket.emit("refreshGames", "");
  }

  public leaveRoom(){
    this.socket.emit("leaveRoom", "");
    this.showLobby();
  }

  public tryStartGame(gameId){
    this.socket.emit("tryStartGame", gameId);
  }

  public sendBet(bet){
    this.socket.emit("playerBet", [this.user.uid, this.currentGame.id, bet]);
  }

  public sendLiar(){
    this.socket.emit("playerLiar", this.currentGame.id);
  }

  public getMinDices(){
    if (this.currentGame.currentBet[0] == 0 && this.currentGame.currentBet[1] == 0){
      this.minDices = 1;
    }else this.minDices = this.currentGame.currentBet[0];  
    this.betDiceValue = this.minDices;
  }

  public getMinVal(){
    if (this.currentGame.currentBet[0] == 0 && this.currentGame.currentBet[1] == 0){
      this.minVal = 1;
    }else this.minVal = this.currentGame.currentBet[1];
    this.betValValue = this.minVal;
  }

  public leaveGame(){
    this.socket.emit("leaveGame", "");
    this.resetDefaultGameValue();
    this.showLobby();
  }

  public refreshOpponents(){
    this.opponents = this.currentGame.players;
    let userIndex;
    for (let i=0; i<this.opponents.length; i++){
      if (this.opponents[i].uid == this.user.uid){
        userIndex = i;
      }
    }
    this.opponents.splice(userIndex, 1);
  }

  public resetDefaultGameValue(){
    this.currentGame = undefined;
    this.myDices = [];
    this.opponents = [];
    this.minDices = 1;
    this.betDiceValue = 1;
    this.minVal = 1;
    this.betValValue = 1;
    this.resLiar = [];
    this.winnerI = -1;
    this.gameDices = [];
    this.isEndRound = false;
  }
}
