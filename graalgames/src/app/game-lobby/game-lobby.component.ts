import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { IGame, IPlayer } from '../interfaces';

@Component({
  selector: 'app-game-lobby',
  template: `
    <div class="game-lobby">
      <h3>Joueurs connectés : </h3>
      <div *ngFor="let aPlayer of game.players">
        <p class="player-name">{{aPlayer.uname}}</p>
      </div>
      <input *ngIf="game.owner == user.uid" class="btn1" type="button" value="Démarrer" (click)="this.askStartGame.emit(game.id)">
      <input class="btn1" type="button" value="Quitter la salle" (click)="this.askLeaveRoom.emit()">
    </div>
  `,
  styleUrls: [ '../app.component.css'
  ]
})
export class GameLobbyComponent implements OnInit {

  @Input()
  game:IGame;
  @Input()
  user:IPlayer;
  @Output()
  askLeaveRoom = new EventEmitter<string>();
  @Output()
  askStartGame = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  public debugTest(){
    console.log("CurrentGame : "+JSON.stringify(this.game));
  }


}
