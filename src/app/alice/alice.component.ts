import { Component, Input, OnInit } from '@angular/core';
import { cosmosclient, proto, rest } from '@cosmos-client/core';

@Component({
  selector: 'app-alice',
  templateUrl: './alice.component.html',
  //styleUrls: ['./alice.component.css'],
})
export class AliceComponent implements OnInit {
  constructor() {}

  @Input()
  sdk?: cosmosclient.CosmosSDK | null;

  mnemonic =
    'dragon elder fetch rain woman stadium defy pipe lunar try finish belt bracket sting together valid police shiver faint toast margin canvas auto age';

  ngOnInit(): void {}
}
