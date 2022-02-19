import { Component, OnInit } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { cosmosclient, proto } from '@cosmos-client/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  nodeURL = 'http://localhost:1317';
  chainID = 'mars';

  // ***サンプルコードのため、ニーモニックをハードコーディングしています。***
  // ***アカウントのすべてのコントロールを渡すことになるので、決してマネしないよう。***

  mnemonicA =
    'good zone border march wreck arctic guide gadget distance whisper knife ginger scale silly else trend street hole rule hundred walk aim attend pulp'
  mnemonicB =
    'rhythm abuse hamster ball student material control length wet engage learn umbrella beyond aisle quick canal tooth reject pyramid adult paddle enter fitness orphan';

  accAddressAlice$: Observable<cosmosclient.AccAddress>;
  valAddressAlice$: Observable<cosmosclient.ValAddress>;
  publicKeyAlice$: Observable<cosmosclient.PubKey>;

  accAddressBob$: Observable<cosmosclient.AccAddress>;
  valAddressBob$: Observable<cosmosclient.ValAddress>;
  publicKeyBob$: Observable<cosmosclient.PubKey>;

  sdk: cosmosclient.CosmosSDK = new cosmosclient.CosmosSDK(
    this.nodeURL,
    this.chainID
  );

  constructor() {
    this.publicKeyAlice$ = from(
      cosmosclient.generatePrivKeyFromMnemonic(this.mnemonicA)
    ).pipe(
      map((privatekey) => {
        const privateKey = new proto.cosmos.crypto.secp256k1.PrivKey({
          key: privatekey,
        });
        return privateKey.pubKey();
      })
    );

    this.accAddressAlice$ = this.publicKeyAlice$.pipe(
      map((pubkey) => cosmosclient.AccAddress.fromPublicKey(pubkey))
    );

    this.valAddressAlice$ = this.publicKeyAlice$.pipe(
      map((pubkey) => cosmosclient.ValAddress.fromPublicKey(pubkey))
    );

    this.publicKeyBob$ = from(
      cosmosclient.generatePrivKeyFromMnemonic(this.mnemonicB)
    ).pipe(
      map((privatekey) => {
        const privateKey = new proto.cosmos.crypto.secp256k1.PrivKey({
          key: privatekey,
        });
        return privateKey.pubKey();
      })
    );

    this.accAddressBob$ = this.publicKeyBob$.pipe(
      map((pubkey) => cosmosclient.AccAddress.fromPublicKey(pubkey))
    );

    this.valAddressBob$ = this.publicKeyBob$.pipe(
      map((pubkey) => cosmosclient.ValAddress.fromPublicKey(pubkey))
    );

  }

  ngOnInit(): void { }
}
