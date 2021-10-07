export interface IPlayer{
    uname:any;
    uid:any;
    actualGame:any;
    igStatus:string;
}

export interface IGame{
    id:any;
    name:string;
    playersMax:number;
    nbPlayers:number;
    players: IPlayer[];
    status:string;
    owner:any;
    dices:any[];
    indexPlaying:number;
    indexUserId:any[];
    currentBet:number[];
    indexPlayerBet:number;
}