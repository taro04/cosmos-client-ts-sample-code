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
  address = "cosmos1arvtrek9t0rxtsgdpnyupjmmhv4kt9p5jxd9xs"; //alice

  /*
  🙂 Created account "alice" with address "cosmos1arvtrek9t0rxtsgdpnyupjmmhv4kt9p5jxd9xs" 
   with mnemonic: "chimney lock primary across wheel hero buffalo casual consider jump predict tragic dirt rifle foam already control speak stool physical idea frequent domain language"
  🙂 Created account "bob" with address "cosmos1we9yezzd5482lvpz3nw0s3qu4n00xh3a80grcj" 
   with mnemonic: "picture expect casino bacon expire tortoise umbrella feature boy helmet heavy island slush spot repair situate eye dial nothing left pepper bunker clump describe"
  */

  address$: BehaviorSubject<string> = new BehaviorSubject(this.address);
  accAddress$: Observable<cosmosclient.AccAddress | undefined>;
  toAddress: cosmosclient.AccAddress | undefined
  balances$: Observable<InlineResponse20027Balances[] | undefined>;
  sdk$:

    constructor() {
  this.sdk = new cosmosclient.CosmosSDK(this.nodeURL, this.chainID);
  //   this.sdk$ = cosmosclient.CosmosSDK(this.nodeURL, this.chainID)
  this.address$ = new BehaviorSubject(this.address);

  //addressからaccAddressを取得
  this.accAddress$ = this.address$.pipe(
    map((address) => {
      try {
        return cosmosclient.AccAddress.fromString(address);
      } catch (error) {
        console.error(error);
        return undefined;
      }
    }),
    catchError((error) => {
      console.error(error);
      return of(undefined);
    })
  )
  //所持tokenを取得
  //combineLatest([this.cosmosSDK.sdk$, this.address$])
  this.balances$ = combineLatest([this.sdk$, this.address$]).pipe(
    mergeMap((sdk, accAddress) => {
      console.log(accAddress);
      if (accAddress === undefined) {
        console.error('Address is invalid or does not have balances!');
        return of([]);
      }
      return rest.cosmos.bank.allBalances(sdk, accAddress).then(res => res.data.balances);
    }),
    catchError((error) => {
      console.error(error);
      return of([]);
    })
  )
}

ngOnInit(): void {}

//addressを更新
changeAddress(address: string): void {
  this.address$.next(address);
}


  //txを送信
  async sendTx(): Promise < void> {

  console.log("send tx start")

    //
    //const fee: proto.cosmos.base.v1beta1.ICoin,

    //pubkey ***サンプルコードのため、ニーモニックをハードコーディングしています。***
    //       ***アカウントのすべてのコントロールを渡すことになるので、決してマネしないよう。***
    const privateKey = new proto.cosmos.crypto.secp256k1.PrivKey({
    key: await cosmosclient.generatePrivKeyFromMnemonic('picture expect casino bacon expire tortoise umbrella feature boy helmet heavy island slush spot repair situate eye dial nothing left pepper bunker clump describe'),
  });
  const publicKey = privateKey.pubKey();
  const fromAddress = cosmosclient.AccAddress.fromPublicKey(publicKey);
  console.log("bob", fromAddress.toString())

    // to address
    this.accAddress$.subscribe(x => { this.toAddress = x })
    //const toAddress = this.accAddress$.subscribe();
    console.log("alice", this.toAddress && this.toAddress.toString())

    // get account info_sdk sample
    const account_old = await rest.cosmos.auth
    .account(this.sdk, fromAddress)
    .then((res) => res.data.account && cosmosclient.codec.unpackCosmosAny(res.data.account))
    .catch((_) => undefined);

  if(!(account_old instanceof proto.cosmos.auth.v1beta1.BaseAccount)) {
  console.log(account_old);
  return;
}

// get account info (telescope)
const account = await rest.cosmos.auth
  .account(this.sdk, fromAddress)
  .then((res) => res.data.account && cosmosclient.codec.unpackCosmosAny(res.data.account))
  .catch((_) => undefined);
if (!(account instanceof proto.cosmos.auth.v1beta1.BaseAccount)) {
  throw Error('Address not found');
}


// build MsgSend
const msgSend = new proto.cosmos.bank.v1beta1.MsgSend({
  from_address: fromAddress.toString(),
  to_address: this.toAddress && this.toAddress.toString(),
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
    //amount: [fee],
    gas_limit: cosmosclient.Long.fromString('200000'),
  },
});

// sign
const txBuilder = new cosmosclient.TxBuilder(this.sdk, txBody, authInfo);
const signDocBytes = txBuilder.signDocBytes(account.account_number);
txBuilder.addSignature(privateKey.sign(signDocBytes));

// broadcast
const res = await rest.cosmos.tx.broadcastTx(this.sdk, {
  tx_bytes: txBuilder.txBytes(),
  mode: rest.cosmos.tx.BroadcastTxMode.Block,
});
console.log("tx_res", res);

// dbg
console.log("send tx end")
  }












}