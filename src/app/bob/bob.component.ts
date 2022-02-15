import { Component, Input, OnInit } from '@angular/core';
import { cosmosclient, proto, rest } from '@cosmos-client/core';
import { combineLatest, from, of, Observable, timer } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { AccAddress } from '@cosmos-client/core/cjs/types';

@Component({
  selector: 'app-bob',
  templateUrl: './bob.component.html',
  //styleUrls: ['./bob.component.css'],
})
export class BobComponent implements OnInit {
  @Input()
  sdk?: cosmosclient.CosmosSDK | null;

  address?: AccAddress;

  mnemonic =
    'always cycle bar card census seven dash drum switch embody wise drastic address sense fit identify switch art cruel answer scale invite carbon punch';
  publicKey$: Observable<cosmosclient.PubKey>;

  constructor() {
    this.publicKey$ = from(
      cosmosclient.generatePrivKeyFromMnemonic(this.mnemonic)
    ).pipe(
      map((privatekey) => {
        const privateKey = new proto.cosmos.crypto.secp256k1.PrivKey({
          key: privatekey,
        });
        this.address = cosmosclient.AccAddress.fromPublicKey(
          privateKey.pubKey()
        );
        console.log(this.address);
        return privateKey.pubKey();
      })
    );

    this.publicKey$.subscribe((x) => console.log(x));
  }

  ngOnInit(): void {}
}
