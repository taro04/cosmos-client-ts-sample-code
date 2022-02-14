import { Component, OnInit, Input } from '@angular/core';
import { cosmosclient, proto, rest } from '@cosmos-client/core';

@Component({
  selector: 'app-bob',
  templateUrl: './bob.component.html',
  //styleUrls: ['./bob.component.css'],
})
export class BobComponent implements OnInit {
  constructor() {}

  @Input()
  sdk?: cosmosclient.CosmosSDK | null;

  mnemonic =
    'always cycle bar card census seven dash drum switch embody wise drastic address sense fit identify switch art cruel answer scale invite carbon punch';

  ngOnInit(): void {}
}
