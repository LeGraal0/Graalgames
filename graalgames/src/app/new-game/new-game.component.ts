import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-new-game',
  template: `
    <div class="new-game">
      <h3>Nom de la partie : </h3>
      <input class="input1" [(ngModel)]="game.name">
      <h3>Nombre de joueurs max. :</h3>
      <span class="input-caret-left" (click)="playerDown()"></span>
      <input class="input1-number" style="position: relative; top: -8px;" [value]="game.nbPlayers" readonly="true">
      <span class="input-caret-right" (click)="playerUp()"></span><br>
      <input class="btn1" type="button" value="Créer partie" (click)="askACreateRoom();"/>
      <input class="btn1" type="button" value="Annuler" (click)="this.askCancel.emit();"/>
    </div>
  `,
  styleUrls: [ '../app.component.css'
  ]
})
export class NewGameComponent implements OnInit {

  @Output()
  askCancel = new EventEmitter<string>();
  @Output()
  askCreateRoom = new EventEmitter<object>();
  @Input()
  name:any;
  game= {name:"", nbPlayers: 6};

  constructor() { }

  ngOnInit(): void {
    this.game.name = this.name;
  }

  askACreateRoom(){
    this.askCreateRoom.emit(this.game);
  }

  playerUp(){
    this.game.nbPlayers++;
    if(this.game.nbPlayers > 6){
      this.game.nbPlayers = 6;
    }
  }

  playerDown(){
    this.game.nbPlayers--;
    if(this.game.nbPlayers < 2){
      this.game.nbPlayers = 2;
    }
  }
}
