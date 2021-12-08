import { Component, OnInit } from '@angular/core';
import { combineLatest, BehaviorSubject, of, Observable } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { cosmosclient, proto, rest } from 'cosmos-client';
import { InlineResponse20027Balances } from 'cosmos-client/cjs/openapi/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  nodeURL = 'http://localhost:1317';
  chainID = "mars";
  sdk: cosmosclient.CosmosSDK;

  denoms = ["stake", "token"]


  /* old
  🙂 Created account "alice" with address "cosmos1arvtrek9t0rxtsgdpnyupjmmhv4kt9p5jxd9xs"
   with mnemonic: "chimney lock primary across wheel hero buffalo casual consider jump predict tragic dirt rifle foam already control speak stool physical idea frequent domain language"
  🙂 Created account "bob" with address "cosmos1we9yezzd5482lvpz3nw0s3qu4n00xh3a80grcj"
   with mnemonic: "picture expect casino bacon expire tortoise umbrella feature boy helmet heavy island slush spot repair situate eye dial nothing left pepper bunker clump describe"
  */

  /*latest*/
  //bob
  //cosmos1jwk3yttut7645kxwnuehkkzey2ztph9zklsu7u
  //funny jungle scout crisp tissue dish talk tattoo alone scheme clog kiwi delay property current argue conduct west bounce reason abandon coral lawsuit hunt
  //alice
  //cosmos1lhaml37gselnnthjh9q2av2pkyf9hh67zy9maz
  //power cereal remind render enhance muffin kangaroo snow hill nature bleak defense summer crisp scare muscle tiger dress behave verb pond merry voyage already



  toAddress: cosmosclient.AccAddress | undefined


  balancesAlice$: Observable<InlineResponse20027Balances[] | undefined>;
  accAddressAlice: cosmosclient.AccAddress;

  balancesBob$: Observable<InlineResponse20027Balances[] | undefined>;
  accAddressBob: cosmosclient.AccAddress;

  sdk$: Observable<cosmosclient.CosmosSDK>;

  constructor() {

    this.sdk = new cosmosclient.CosmosSDK(this.nodeURL, this.chainID);
    this.sdk$ = of(new cosmosclient.CosmosSDK(this.nodeURL, this.chainID));

    //Aliceの所持tokenを取得
    this.accAddressAlice = cosmosclient.AccAddress.fromString("cosmos1lhaml37gselnnthjh9q2av2pkyf9hh67zy9maz")
    this.balancesAlice$ = this.sdk$.pipe(
      mergeMap((sdk) => {
        return rest.cosmos.bank.allBalances(sdk, this.accAddressAlice).then(res => res.data.balances);
      }),
    )

    //Bobの所持tokenを取得
    this.accAddressBob = cosmosclient.AccAddress.fromString("cosmos1jwk3yttut7645kxwnuehkkzey2ztph9zklsu7u")
    this.balancesBob$ = this.sdk$.pipe(
      mergeMap((sdk) => {
        return rest.cosmos.bank.allBalances(sdk, this.accAddressBob).then(res => res.data.balances);
      }),
    )
  }

  ngOnInit(): void { }



  //txを送信
  async sendTxFromAlice(): Promise<void> {

    //pubkey ***サンプルコードのため、ニーモニックをハードコーディングしています。***
    //       ***アカウントのすべてのコントロールを渡すことになるので、決してマネしないよう。***
    const privateKeyAlice = new proto.cosmos.crypto.secp256k1.PrivKey({
      key: await cosmosclient.generatePrivKeyFromMnemonic('power cereal remind render enhance muffin kangaroo snow hill nature bleak defense summer crisp scare muscle tiger dress behave verb pond merry voyage already'),
    });
    const publicKeyAlice = privateKeyAlice.pubKey();

    // get account info (telescope)
    const account = await rest.cosmos.auth
      .account(this.sdk, this.accAddressAlice)
      .then((res) => res.data.account && cosmosclient.codec.unpackCosmosAny(res.data.account))
      .catch((_) => undefined);
    if (!(account instanceof proto.cosmos.auth.v1beta1.BaseAccount)) {
      throw Error('Address not found');
    }

    // build MsgSend
    const msgSend = new proto.cosmos.bank.v1beta1.MsgSend({
      from_address: this.accAddressAlice.toString(),
      to_address: this.accAddressBob.toString(),
      amount: [{ denom: 'stake', amount: '10' }],
    });

    // build TxBody
    const txBody = new proto.cosmos.tx.v1beta1.TxBody({
      messages: [cosmosclient.codec.packAny(msgSend)],
    });

    // build authInfo
    const authInfo = new proto.cosmos.tx.v1beta1.AuthInfo({
      signer_infos: [
        {
          public_key: cosmosclient.codec.packAny(publicKeyAlice),
          mode_info: {
            single: {
              mode: proto.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
            },
          },
          sequence: account.sequence,
        },
      ],
      fee: {
        gas_limit: cosmosclient.Long.fromString('200000'),
      },
    });

    // sign
    const txBuilder = new cosmosclient.TxBuilder(this.sdk, txBody, authInfo);
    const signDocBytes = txBuilder.signDocBytes(account.account_number);
    txBuilder.addSignature(privateKeyAlice.sign(signDocBytes));

    // broadcast
    const res = await rest.cosmos.tx.broadcastTx(this.sdk, {
      tx_bytes: txBuilder.txBytes(),
      mode: rest.cosmos.tx.BroadcastTxMode.Block,
    });
    console.log("tx_res", res);
  }

  //txを送信
  async sendTxFromBob(): Promise<void> {
    //console.log(denom)

    //pubkey ***サンプルコードのため、ニーモニックをハードコーディングしています。***
    //       ***アカウントのすべてのコントロールを渡すことになるので、決してマネしないよう。***
    const privateKeyBob = new proto.cosmos.crypto.secp256k1.PrivKey({
      key: await cosmosclient.generatePrivKeyFromMnemonic('funny jungle scout crisp tissue dish talk tattoo alone scheme clog kiwi delay property current argue conduct west bounce reason abandon coral lawsuit hunt'),
    });
    const publicKeyBob = privateKeyBob.pubKey();

    // get account info (telescope)
    const account = await rest.cosmos.auth
      .account(this.sdk, this.accAddressBob)
      .then((res) => res.data.account && cosmosclient.codec.unpackCosmosAny(res.data.account))
      .catch((_) => undefined);
    if (!(account instanceof proto.cosmos.auth.v1beta1.BaseAccount)) {
      throw Error('Address not found');
    }

    // build MsgSend
    const msgSend = new proto.cosmos.bank.v1beta1.MsgSend({
      from_address: this.accAddressBob.toString(),
      to_address: this.accAddressAlice.toString(),
      amount: [{ denom: "stake", amount: '10' }],
    });

    // build TxBody
    const txBody = new proto.cosmos.tx.v1beta1.TxBody({
      messages: [cosmosclient.codec.packAny(msgSend)],
    });

    // build authInfo
    const authInfo = new proto.cosmos.tx.v1beta1.AuthInfo({
      signer_infos: [
        {
          public_key: cosmosclient.codec.packAny(publicKeyBob),
          mode_info: {
            single: {
              mode: proto.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
            },
          },
          sequence: account.sequence,
        },
      ],
      fee: {
        gas_limit: cosmosclient.Long.fromString('200000'),
      },
    });

    // sign
    const txBuilder = new cosmosclient.TxBuilder(this.sdk, txBody, authInfo);
    const signDocBytes = txBuilder.signDocBytes(account.account_number);
    txBuilder.addSignature(privateKeyBob.sign(signDocBytes));

    // broadcast
    const res = await rest.cosmos.tx.broadcastTx(this.sdk, {
      tx_bytes: txBuilder.txBytes(),
      mode: rest.cosmos.tx.BroadcastTxMode.Block,
    });
    console.log("tx_res", res);
  }
}
