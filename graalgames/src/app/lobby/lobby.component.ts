import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-lobby',
  template: `
    <div class="lobby-content">
      <h2>Voici la liste des parties :</h2>

      <div *ngFor="let aGame of games" class="games-row">
        <div class="games-row-element"><p>{{aGame.name}}</p></div>
        <div class="games-row-element"><p>Joueurs : {{aGame.nbPlayers}}/{{aGame.playersMax}}</p></div>
        <div><input class="btn1" type="button" value="Rejoindre" (click)="this.askJoinRoom.emit(aGame.id);"/></div>
      </div>
      <div>
        <input class="btn1" type="button" value="Créer partie" (click)="this.askNewGame.emit();"/>
        <input class="btn1" type="button" value="Rafraichir" (click)='test()'/>
      </div>
    </div>
  `,
  styleUrls: [ '../app.component.css'
  ]
})
export class LobbyComponent implements OnInit {

  @Output()
  askJoinRoom = new EventEmitter<string>();
  @Output()
  askNewGame = new EventEmitter<string>();
  @Output()
  askRefresh = new EventEmitter<string>();

  @Input()
  games = [];

  constructor() { }

  ngOnInit(): void {
  }

  test(){
    console.log('click');
    this.askRefresh.emit();
  }
}
