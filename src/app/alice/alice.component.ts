import { Component, Input, OnInit } from '@angular/core';
import { cosmosclient, proto, rest } from '@cosmos-client/core';
import { AccAddress } from '@cosmos-client/core/cjs/types';
import { combineLatest, from, of, Observable, timer } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-alice',
  templateUrl: './alice.component.html',
  //styleUrls: ['./alice.component.css'],
})
export class AliceComponent implements OnInit {
  @Input()
  sdk?: cosmosclient.CosmosSDK | null;

  address?: AccAddress;
  toAddress?: AccAddress;

  mnemonic =
    'dragon elder fetch rain woman stadium defy pipe lunar try finish belt bracket sting together valid police shiver faint toast margin canvas auto age';
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
