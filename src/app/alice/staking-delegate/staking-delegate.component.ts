import { Component, OnInit, Input } from '@angular/core';
import { combineLatest, from, of, Observable, timer } from 'rxjs';
import { cosmosclient, proto, rest } from '@cosmos-client/core';
import { AccAddress } from '@cosmos-client/core/cjs/types/address/acc-address';

@Component({
  selector: 'app-staking-delegate',
  templateUrl: './staking-delegate.component.html',
  //styleUrls: ['./staking-delegate.component.css']
})
export class StakingDelegateComponent implements OnInit {
  @Input()
  mnemonic?: string;

  @Input()
  sdk?: cosmosclient.CosmosSDK | null;

  @Input()
  valAddress?: AccAddress | null;

  constructor() {}

  ngOnInit(): void {}

  async stakingDelegate(amount: proto.cosmos.base.v1beta1.ICoin) {
    if (this.sdk === undefined || this.sdk === null) return;
    const sdk = this.sdk;

    if (this.mnemonic === undefined || this.mnemonic === null) return;
    const mnemonic = this.mnemonic;

    if (this.valAddress === undefined || this.valAddress === null) return;
    const valAddress = this.valAddress;

    const privKey = new proto.cosmos.crypto.secp256k1.PrivKey({
      key: await cosmosclient.generatePrivKeyFromMnemonic(mnemonic),
    });
    const pubKey = privKey.pubKey();
    const fromAddress = cosmosclient.AccAddress.fromPublicKey(pubKey);

    // get account info
    const account = await rest.auth
      .account(sdk, fromAddress)
      .then(
        (res) =>
          res.data.account &&
          (cosmosclient.codec.unpackCosmosAny(
            res.data.account
          ) as proto.cosmos.auth.v1beta1.BaseAccount)
      )
      .catch((_) => undefined);

    if (!(account instanceof proto.cosmos.auth.v1beta1.BaseAccount)) {
      throw Error('Address not found');
    }

    // build tx
    const msgDelegate = new proto.cosmos.staking.v1beta1.MsgDelegate({
      delegator_address: fromAddress.toString(),
      validator_address: valAddress.toString(),
      amount,
    });

    const txBody = new proto.cosmos.tx.v1beta1.TxBody({
      messages: [cosmosclient.codec.packAny(msgDelegate)],
    });

    const authInfo = new proto.cosmos.tx.v1beta1.AuthInfo({
      signer_infos: [
        {
          public_key: cosmosclient.codec.packAny(pubKey),
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
    const txBuilder = new cosmosclient.TxBuilder(sdk, txBody, authInfo);
    const signDocBytes = txBuilder.signDocBytes(account.account_number);
    txBuilder.addSignature(privKey.sign(signDocBytes));

    // broadcast
    const result = await rest.tx.broadcastTx(sdk, {
      tx_bytes: txBuilder.txBytes(),
      mode: rest.tx.BroadcastTxMode.Block,
    });

    console.log('deli', result);
    return result.data.tx_response?.txhash || '';
  }
}
