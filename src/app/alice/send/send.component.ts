import { Component, OnInit, Input } from '@angular/core';
import { cosmosclient, proto, rest } from '@cosmos-client/core';
import { AccAddress } from '@cosmos-client/core/cjs/types/address/acc-address';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-send',
  templateUrl: './send.component.html',
  //styleUrls: ['./send.component.css']
})
export class SendComponent implements OnInit {
  @Input()
  mnemonic?: string;

  @Input()
  toAddress?: AccAddress | null;

  @Input()
  sdk?: cosmosclient.CosmosSDK | null;

  denoms = ['stake', 'token'];
  gasPrice = '0.1';
  gasDenom = this.denoms[0];
  //color = 'primary';

  constructor(
    private readonly snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void { }

  //txを送信
  async sendTx(
    mnemonic: string,
    toAddress: AccAddress,
    denom: string,
    amount: string
  ): Promise<void> {
    //sdk
    if (this.sdk === undefined || this.sdk === null) return;
    const sdk = this.sdk;
    const sendTokens: proto.cosmos.base.v1beta1.ICoin = {
      denom: denom,
      amount: amount,
    };

    //Address
    const privateKey = new proto.cosmos.crypto.secp256k1.PrivKey({
      key: await cosmosclient.generatePrivKeyFromMnemonic(mnemonic),
    });
    const publicKey = privateKey.pubKey();
    const fromAddress: AccAddress =
      cosmosclient.AccAddress.fromPublicKey(publicKey);

    // get account info
    const account = await rest.auth
      .account(sdk, fromAddress)
      .then(
        (res) =>
          res.data.account &&
          cosmosclient.codec.unpackCosmosAny(res.data.account)
      )
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

    //Check fee -> ////////////////////////////////////////

    // build authInfo for simulation
    const authInfoSim = new proto.cosmos.tx.v1beta1.AuthInfo({
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
        amount: [{ denom: this.gasDenom, amount: '1' }],
        gas_limit: cosmosclient.Long.fromString('200000'),
      },
    });

    // sign for simulation
    const txBuilderSim = new cosmosclient.TxBuilder(sdk, txBody, authInfoSim);
    const signDocBytesSim = txBuilderSim.signDocBytes(account.account_number);
    txBuilderSim.addSignature(privateKey.sign(signDocBytesSim));

    // restore json from txBuilder
    const txForSimulation = JSON.parse(txBuilderSim.cosmosJSONStringify());

    // fix JSONstringify issue
    delete txForSimulation.auth_info.signer_infos[0].mode_info.multi;

    // simulate
    const simulatedResult = await rest.tx.simulate(sdk, {
      tx: txForSimulation,
      tx_bytes: txBuilderSim.txBytes(),
    });
    console.log('simulatedResult', simulatedResult);

    // estimate fee
    const simulatedGasUsed = simulatedResult.data.gas_info?.gas_used;
    // This margin prevents insufficient fee due to data size difference between simulated tx and actual tx.
    const simulatedGasUsedWithMarginNumber = simulatedGasUsed
      ? parseInt(simulatedGasUsed) * 1.1
      : 200000;
    const simulatedGasUsedWithMargin =
      simulatedGasUsedWithMarginNumber.toFixed(0);

    // minimumGasPrice depends on Node's config(`~/.mars/config/app.toml` minimum-gas-prices).
    const simulatedFeeWithMarginNumber =
      parseInt(simulatedGasUsedWithMargin) * parseFloat(this.gasPrice);
    const simulatedFeeWithMargin = Math.ceil(
      simulatedFeeWithMarginNumber
    ).toFixed(0);
    console.log({
      simulatedGasUsed,
      simulatedGasUsedWithMargin,
      simulatedFeeWithMarginNumber,
      simulatedFeeWithMargin,
    });

    //Check fee <- ////////////////////////////////////////

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
        amount: [{ denom: this.gasDenom, amount: simulatedFeeWithMargin }],
        gas_limit: cosmosclient.Long.fromString(
          simulatedGasUsedWithMargin ? simulatedGasUsedWithMargin : '200000'
        ),
      },
    });

    // sign for transaction
    const txBuilder = new cosmosclient.TxBuilder(sdk, txBody, authInfo);
    const signDocBytes = txBuilder.signDocBytes(account.account_number);
    txBuilder.addSignature(privateKey.sign(signDocBytes));

    // broadcast
    const res = await rest.tx.broadcastTx(sdk, {
      tx_bytes: txBuilder.txBytes(),
      mode: rest.tx.BroadcastTxMode.Block,
    }).then(res => {
      this.snackBar.open(`Successfully sent: ${res.data.tx_response?.logs?.toString()}`, 'close', {
        duration: 30000,
      });
    }
    )


    console.log('tx_res', res);
  }
}
