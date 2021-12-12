import { Component, OnInit } from '@angular/core';
import { combineLatest, BehaviorSubject, of, Observable, timer, zip, } from 'rxjs';
import { catchError, map, mergeMap, } from 'rxjs/operators';
import { cosmosclient, proto, rest } from 'cosmos-client';
import { InlineResponse20027Balances } from 'cosmos-client/cjs/openapi/api';
import { AccAddress } from 'cosmos-client/cjs/types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  nodeURL = 'http://localhost:1317';
  chainID = "mars";
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


  balancesAlice$: Observable<InlineResponse20027Balances[] | undefined>;
  accAddressAlice: cosmosclient.AccAddress;

  balancesBob$: Observable<InlineResponse20027Balances[] | undefined>;
  accAddressBob: cosmosclient.AccAddress;

  sdk$: Observable<cosmosclient.CosmosSDK> = of(new cosmosclient.CosmosSDK(this.nodeURL, this.chainID));;
  timer$: Observable<number> = timer(0, 3 * 1000);

  constructor() {

    //polling
    //this.sdk$ = this.timer$.pipe(mergeMap((_) => { return this.sdk$ }));

    //Aliceの所持tokenを取得
    this.accAddressAlice = cosmosclient.AccAddress.fromString("cosmos1lhaml37gselnnthjh9q2av2pkyf9hh67zy9maz")
    this.balancesAlice$ = combineLatest(this.timer$, this.sdk$).pipe(
      mergeMap(([n, sdk]) => {
        console.log("in Alice", n)
        return rest.cosmos.bank.allBalances(sdk, this.accAddressAlice).then(res => res.data.balances);
      }),
    )

    //Bobの所持tokenを取得
    this.accAddressBob = cosmosclient.AccAddress.fromString("cosmos1jwk3yttut7645kxwnuehkkzey2ztph9zklsu7u")
    this.balancesBob$ = combineLatest(this.timer$, this.sdk$).pipe(
      mergeMap(([n, sdk]) => {
        console.log("in Bob", n)
        return rest.cosmos.bank.allBalances(sdk, this.accAddressBob).then(res => res.data.balances);
      }),
    )
  }

  ngOnInit(): void { }

  //pubkey ***サンプルコードのため、ニーモニックをハードコーディングしています。***
  //       ***アカウントのすべてのコントロールを渡すことになるので、決してマネしないよう。***
  mnemonicA = 'power cereal remind render enhance muffin kangaroo snow hill nature bleak defense summer crisp scare muscle tiger dress behave verb pond merry voyage already'
  mnemonicB = 'funny jungle scout crisp tissue dish talk tattoo alone scheme clog kiwi delay property current argue conduct west bounce reason abandon coral lawsuit hunt'


  //txを送信
  async sendTx(
    mnemonic: string,
    sdk_in: Observable<cosmosclient.CosmosSDK>,
    toAddress: AccAddress,
    denom: string,
    amount: string,
  ): Promise<void> {

    //sdk
    const sdk = await sdk_in.toPromise()
    const sendTokens: proto.cosmos.base.v1beta1.ICoin = { denom: denom, amount: amount }

    //Address
    const privateKey = new proto.cosmos.crypto.secp256k1.PrivKey({
      key: await cosmosclient.generatePrivKeyFromMnemonic(mnemonic),
    });
    const publicKey = privateKey.pubKey();
    const fromAddress: AccAddress = cosmosclient.AccAddress.fromPublicKey(publicKey)
    //const toAddress :AccAddress //入力

    // get account info
    const account = await rest.cosmos.auth
      .account(sdk, fromAddress)
      .then((res) => res.data.account && cosmosclient.codec.unpackCosmosAny(res.data.account))
      .catch((_) => undefined);
    if (!(account instanceof proto.cosmos.auth.v1beta1.BaseAccount)) {
      throw Error('Address not found');
    }

    // build MsgSend
    const msgSend = new proto.cosmos.bank.v1beta1.MsgSend({
      from_address: fromAddress.toString(),
      to_address: toAddress.toString(),
      amount: [sendTokens],
    });

    // build TxBody
    const txBody = new proto.cosmos.tx.v1beta1.TxBody({
      messages: [cosmosclient.codec.packAny(msgSend)],
    });

    // build authInfo
    const authInfo = new proto.cosmos.tx.v1beta1.AuthInfo({
      signer_infos: [
        {
          public_key: cosmosclient.codec.packAny(publicKey),
          mode_info: {
            single: {
              mode: proto.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
            },
          },
          sequence: account.sequence,
        },
      ],
      fee: {
        amount: [sendTokens],
        gas_limit: cosmosclient.Long.fromString('200000'),
      },
    });

    // sign
    const txBuilder = new cosmosclient.TxBuilder(sdk, txBody, authInfo);

    //Check fee
    /*
    // restore json from txBuilder
    const txForSimulation = JSON.parse(txBuilder.cosmosJSONStringify());

    // fix JSONstringify issue
    delete txForSimulation.auth_info.signer_infos[0].mode_info.multi;

    // simulate
    const simulatedResult = await rest.cosmos.tx.simulate(sdk, {
      tx: txForSimulation,
      //tx_bytes: txBuilder.txBytes(),
    });
    console.log('simulatedResult', simulatedResult);
    */

    const signDocBytes = txBuilder.signDocBytes(account.account_number);
    txBuilder.addSignature(privateKey.sign(signDocBytes));

    // broadcast
    const res = await rest.cosmos.tx.broadcastTx(sdk, {
      tx_bytes: txBuilder.txBytes(),
      mode: rest.cosmos.tx.BroadcastTxMode.Block,
    });
    console.log("tx_res", res);
  }


  async simulatedTx(
    sdk_in: Observable<cosmosclient.CosmosSDK>,
    txBuilder: cosmosclient.TxBuilder
  ): Promise<proto.cosmos.base.v1beta1.ICoin> {

    var fee: proto.cosmos.base.v1beta1.ICoin = {}

    //sdk
    const sdk = await sdk_in.toPromise()

    return fee
  }
}
