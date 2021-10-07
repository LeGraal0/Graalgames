import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

import { IGame, IPlayer } from '../interfaces';

@Component({
  selector: 'app-in-game',
  template: `
  
    <h2>#{{game.id}} - {{game.name}}</h2>
    <div class="in-game">
        <h3>Vos dés :</h3>

        <div class="dice-row">
          <div *ngFor="let dice of myDices" class="dice-row-element">
            <img *ngIf="isEndRound && dice == game.currentBet[1];else normalDice1" class="goodDice" src="../assets/img/dice{{dice}}.png"/>
            <ng-template #normalDice1><img class="dice" src="../assets/img/dice{{dice}}.png"/></ng-template>
          </div>
        </div>
        
        <div style="display: flex; justify-content: center;">
          <div *ngIf="game.indexPlayerBet == game.indexUserId.indexOf(user.uid)" class="selfBbl">
            {{game.currentBet[0]}} x <img width="36px" height="36px" src="../assets/img/dice{{game.currentBet[1]}}.png"/>
          </div>
          <div *ngIf="resLiar[0] != undefined && game.indexPlaying == game.indexUserId.indexOf(user.uid)" class="selfBbl">
            <img width="36px" height="36px" src="../assets/img/whistle.png"/>
          </div>
          <div *ngIf="resLiar[0] != undefined">
              <div *ngIf="game.indexPlaying == game.indexUserId.indexOf(user.uid)" style="width: 64px; height: 64px; margin-top: 10px;">
                <svg *ngIf="resLiar[0] == true" viewBox='0 0 16 16' fill='rgb(0, 204, 0)' xmlns='http://www.w3.org/2000/svg'>
                  <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>  
                </svg>
                <p *ngIf="resLiar[0] == false" class="redCross" style="margin-top: 18px;">X<p>
              </div>
              <div *ngIf="game.indexPlayerBet == game.indexUserId.indexOf(user.uid)" style="width: 64px; height: 64px; margin-top: 10px;">
                <svg *ngIf="resLiar[1] == true" viewBox='0 0 16 16' fill='rgb(0, 204, 0)' xmlns='http://www.w3.org/2000/svg'>
                  <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>  
                </svg>
                <p *ngIf="resLiar[1] == false" class="redCross" style="margin-top: 18px;">X<p>
              </div>
          </div>
        </div>

        <h3>Adversaires : </h3>
        <div style="display:inline">
          
            <div *ngFor="let anOpponent of opponents">
              <div [ngClass]="{'game-player-row':true,'game-player-active' : game.indexPlaying == game.indexUserId.indexOf(anOpponent.uid)}">
                <div class="game-player-row-element" style="padding-top: 13px;">
                  <p class="player-name">{{anOpponent.uname}}</p>
                </div>
                <div *ngIf="game.indexPlayerBet == game.indexUserId.indexOf(anOpponent.uid)" class="game-player-row-element">
                  <p class="otherBbl">
                    {{game.currentBet[0]}} x <img width="36px" height="36px" src="../assets/img/dice{{game.currentBet[1]}}.png"/>
                  </p>
                </div>
                <div *ngIf="resLiar[0] != undefined && game.indexPlaying == game.indexUserId.indexOf(anOpponent.uid)" class="game-player-row-element">
                  <p class="otherBbl">
                    <img width="36px" height="36px" src="../assets/img/whistle.png"/>
                  </p>
                </div>
                <div *ngIf="game.indexPlayerBet == game.indexUserId.indexOf(anOpponent.uid) && game.indexPlaying == game.indexUserId.indexOf(user.uid) && resLiar[0] == undefined" class="game-player-row-element whistle" style="padding-top: 13px;">
                  <div class="purpose">
                    <div class="btnBbl">Accuser de menteur</div>
                    <button class="btnWhistle" style="position: relative; top: -6px;" (click)="this.askForLiar()">
                      <img width="36px" height="36px" src="../assets/img/whistle.png"/>
                    </button>
                  </div>
                </div> 
                <br>
                <div *ngIf="(resLiar[0] == true && game.indexPlaying == game.indexUserId.indexOf(anOpponent.uid)
                            || (resLiar[1] == true && game.indexPlayerBet == game.indexUserId.indexOf(anOpponent.uid) ))" class="game-player-row-element">
                            <div style="width: 64px; height:64px;">
                              <svg viewBox='0 0 16 16' fill='rgb(0, 204, 0)' xmlns='http://www.w3.org/2000/svg'>
                                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>  
                              </svg>
                            </div>
                </div>
                <div *ngIf="(resLiar[0] == false && game.indexPlaying == game.indexUserId.indexOf(anOpponent.uid)
                            || (resLiar[1] == false && game.indexPlayerBet == game.indexUserId.indexOf(anOpponent.uid) ))" class="game-player-row-element" style="padding-top:13px;">
                  <div>
                    <p class="redCross">X<p>
                  </div>
                </div>
              
                <div *ngIf="isEndRound" class="dice-row" style="flex-basis: 100%;">
                  <div *ngFor="let dice of gameDices.dices[game.indexUserId.indexOf(anOpponent.uid)]" class="dice-row-element">
                    <img *ngIf="isEndRound && dice == game.currentBet[1];else normalDice1" class="goodDice" src="../assets/img/dice{{dice}}.png"/>
                    <ng-template #normalDice1><img class="dice" src="../assets/img/dice{{dice}}.png"/></ng-template>
                  </div>
                </div>
              
              
              </div>
              
            </div>
          
        </div>

        <!--   Purpose Input --->
        <div *ngIf="game.indexPlaying == game.indexUserId.indexOf(user.uid) && resLiar[0] == undefined" class="purpose-input">
          <h3>C'est votre tour</h3>
          <div class="bet-form">
            <div>
              <span *ngIf="!isDiceDisable" style="position: relative; top:11px;" class="input-caret-left" (click)="diceDown(betDiceValue)"></span>
              <input #betNb class="input1-number" type="text" readonly="true" [value]="betDiceValue">
              <span *ngIf="!isDiceDisable" style="position: relative; top:11px;" class="input-caret-right" (click)="diceUp(betDiceValue)"></span>
            </div>
            <p style="margin: 0 10px;" class="player-name">X</p>
            <div>
            <span *ngIf="!isValDisable" style="position: relative; top:13px;" class="input-caret-left" (click)="valDown(betValValue)"></span>
            <img width="36px" height="36px" src="../assets/img/dice{{betValValue}}.png"/>
            <span *ngIf="!isValDisable" style="position: relative; top:13px;" class="input-caret-right" (click)="valUp(betValValue)"></span><br>
            </div>
          </div>
          <input class="btn1" type="button" value="Proposer" (click)="this.askForBet([betDiceValue, betValValue])" [disabled]="(this.game.currentBet[0] != 0 && this.game.currentBet[1] != 0) && ( this.isDiceDisable == false && this.isValDisable == false)">
        
          <div class="timer"><countdown [config]="{leftTime: 20, format: 's'}"></countdown></div>
        </div>
        
    </div>
    <div *ngIf="winnerI != -1">
      <h2>Fin de la partie</h2>
      <h3>{{game.players[winnerI].uname}} remporte la victoire !</h3>
    </div>
    <input class="btn1" type="button" value="Quitter la partie" (click)="this.askLeaveGame.emit()">
  `,
  styleUrls: [ '../app.component.css'
  ]
})
export class InGameComponent implements OnInit {

  @Input()
  game:IGame;
  @Input()
  myDices:number[];
  @Input()
  user:IPlayer;
  @Input()
  opponents:IPlayer[];
  @Output()
  askBet = new EventEmitter<number[]>();
  @Output()
  askLiar = new EventEmitter<number[]>();
  @Output()
  askLeaveGame = new EventEmitter<number[]>();
  @Input()
  minDices;
  @Input()
  minVal;
  @Input()
  resLiar;
  @Input()
  winnerI;
  @Input()
  betDiceValue = 1;
  @Input()
  betValValue = 1;
  isDiceDisable = false;
  isValDisable = false;
  @Input()
  gameDices;
  @Input()
  isEndRound;

  constructor() { }

  ngOnInit(): void {
  }

  public debugTest(){
    console.log("gameDices : " + (this.game.currentBet[0] != 0 && this.game.currentBet[1] != 0) && ( this.isDiceDisable == false && this.isValDisable == false));
  }

  public diceUp(betDice){
    console.log("DiceUp received - betDice : "+betDice);
    let val = 1;
    if (Number(betDice) >= this.minDices){
      val = Number(betDice) + 1;
    }else{
      val = this.minDices;
    }
    if (val > 30){
      val = 30;
    }
    this.betDiceValue = val;
    console.log("DiceUp - currentBet[0] == 0 : "+(this.game.currentBet[0] == 0));
    if(this.game.currentBet[0] != 0 && this.game.currentBet[1] != 0 && val != this.minDices){
      this.isDiceDisable = false;
      this.isValDisable = true;
    }
    
  }

  public diceDown(betDice){
    let val = 1;
    if (Number(betDice) >= this.minDices){
      val = Number(betDice) - 1;
    }else{
      val = this.minDices;
    }
    if (val < this.minDices){
      val = this.minDices;
    }
    this.betDiceValue = val;
    if(val == this.minDices){
      this.isDiceDisable = false;
      this.isValDisable = false;
    }
  }

  public valUp(betVal){
    let val = 1;
    if (Number(betVal) >= this.minVal){
      val = Number(betVal) + 1;
    }else{
      val = this.minVal;
    }
    if (val > 6){
      val = 6;
    }
    this.betValValue = val;
    if(this.game.currentBet[0] != 0 && this.game.currentBet[1] != 0 && val != this.minVal){
      this.isDiceDisable = true;
      this.isValDisable = false;
    }
  }

  public valDown(betVal){
    let val = 1;
    if (Number(betVal) > this.minVal){
      val = Number(betVal) - 1;
    }else{
      val = this.minVal;
    }
    if (val < this.minVal){
      val = this.minVal;
    }
    this.betValValue = val;
    if(val == this.minVal){
      this.isDiceDisable = false;
      this.isValDisable = false;
    }
  }

  public askForBet(bet){
    this.askBet.emit(bet);
    this.isDiceDisable = false;
    this.isValDisable = false;
  }

  public askForLiar(){
    this.askLiar.emit();
    this.isDiceDisable = false;
    this.isValDisable = false;
  }
}
