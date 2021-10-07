import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-server-err',
  template: `
    <h3>Une erreur de connection est survenue</h3>
  `,
  styleUrls: [ '../app.component.css'
  ]
})
export class ServerErrComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
