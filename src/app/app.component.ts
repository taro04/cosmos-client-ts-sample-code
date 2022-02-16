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

  //  mnemonicA =
  //    'power cereal remind render enhance muffin kangaroo snow hill nature bleak defense summer crisp scare muscle tiger dress behave verb pond merry voyage already';
  //  mnemonicB =
  //    'funny jungle scout crisp tissue dish talk tattoo alone scheme clog kiwi delay property current argue conduct west bounce reason abandon coral lawsuit hunt';
  //pubkey ***サンプルコードのため、ニーモニックをハードコーディングしています。***
  //       ***アカウントのすべてのコントロールを渡すことになるので、決してマネしないよう。***

  mnemonicA =
    'comfort runway shiver rebuild rich clutch category return outside betray pitch vibrant shallow sweet erase route torch slight theory tissue boring group album mother';

  mnemonicB =
    'false service fork grab lumber earn spatial window can endless empower wing route taxi trust play step crater sketch twist poem angry fashion cry';

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

    ///////////////////////////////////////////////////////////////////////////////

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

    ///////////////////////////////////////////////////////////////////////////////
  }

  ngOnInit(): void {}
}
