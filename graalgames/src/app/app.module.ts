import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { CountdownModule } from 'ngx-countdown';

import { LobbyComponent } from './lobby/lobby.component';
import { NewGameComponent } from './new-game/new-game.component';
import { GameLobbyComponent } from './game-lobby/game-lobby.component';
import { InGameComponent } from './in-game/in-game.component';
import { ServerErrComponent } from './server-err/server-err.component';

const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };

@NgModule({
  declarations: [
    AppComponent,
    LobbyComponent,
    NewGameComponent,
    GameLobbyComponent,
    InGameComponent,
    ServerErrComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SocketIoModule.forRoot(config),
    FormsModule,
    CountdownModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
