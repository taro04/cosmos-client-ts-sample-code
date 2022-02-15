import { Component, OnInit } from '@angular/core';
import { combineLatest, from, of, Observable, timer } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { cosmosclient, proto, rest } from '@cosmos-client/core';
import {
  InlineResponse20028Balances,
  InlineResponse20033,
  InlineResponse20063,
  QueryTotalSupplyResponseIsTheResponseTypeForTheQueryTotalSupplyRPCMethod,
  QueryValidatorsResponseIsResponseTypeForTheQueryValidatorsRPCMethod,
  CosmosDistributionV1beta1QueryCommunityPoolResponse,
} from '@cosmos-client/core/cjs/openapi/api';
import { AccAddress } from '@cosmos-client/core/cjs/types/address/acc-address';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  nodeURL = 'http://localhost:1317';
  chainID = 'mars';
  denoms = ['stake', 'token'];
  gasPrice = '0.1';
  gasDenom = this.denoms[0];
  //  mnemonicA =
  //    'power cereal remind render enhance muffin kangaroo snow hill nature bleak defense summer crisp scare muscle tiger dress behave verb pond merry voyage already';
  //  mnemonicB =
  //    'funny jungle scout crisp tissue dish talk tattoo alone scheme clog kiwi delay property current argue conduct west bounce reason abandon coral lawsuit hunt';
  //pubkey ***サンプルコードのため、ニーモニックをハードコーディングしています。***
  //       ***アカウントのすべてのコントロールを渡すことになるので、決してマネしないよう。***

  mnemonicA =
    'dragon elder fetch rain woman stadium defy pipe lunar try finish belt bracket sting together valid police shiver faint toast margin canvas auto age';
  mnemonicB =
    'always cycle bar card census seven dash drum switch embody wise drastic address sense fit identify switch art cruel answer scale invite carbon punch';

  totalSupply$: Observable<QueryTotalSupplyResponseIsTheResponseTypeForTheQueryTotalSupplyRPCMethod>;
  validators$: Observable<QueryValidatorsResponseIsResponseTypeForTheQueryValidatorsRPCMethod>;
  communityPool$: Observable<CosmosDistributionV1beta1QueryCommunityPoolResponse>;
  delegationTotalRewards$: Observable<any>;
  delegationRewards$: Observable<any>;
  delegatorValidators$: Observable<any>;
  delegatorWithdrawAddress$: Observable<any>;
  validatorCommission$: Observable<any>;
  validatorOutstandingRewards$: Observable<any>;
  txsWithPagination$: Observable<any>;
  params$: Observable<InlineResponse20033>;

  balancesAlice$: Observable<InlineResponse20028Balances[] | undefined>;
  balancesValAlice$: Observable<InlineResponse20028Balances[] | undefined>;
  accAddressAlice$: Observable<cosmosclient.AccAddress>;
  valAddressAlice$: Observable<cosmosclient.ValAddress>;
  publicKeyAlice$: Observable<cosmosclient.PubKey>;
  delegationsAlice$: Observable<InlineResponse20063>;

  balancesBob$: Observable<InlineResponse20028Balances[] | undefined>;
  accAddressBob$: Observable<cosmosclient.AccAddress>;
  valAddressBob$: Observable<cosmosclient.ValAddress>;
  publicKeyBob$: Observable<cosmosclient.PubKey>;
  delegationsBob$: Observable<InlineResponse20063>;

  sdk$: Observable<cosmosclient.CosmosSDK> = of(
    new cosmosclient.CosmosSDK(this.nodeURL, this.chainID)
  );
  sdk: cosmosclient.CosmosSDK = new cosmosclient.CosmosSDK(
    this.nodeURL,
    this.chainID
  );
  timer$: Observable<number> = timer(0, 3 * 1000);

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

    this.balancesAlice$ = combineLatest([
      this.timer$,
      this.sdk$,
      this.accAddressAlice$,
    ]).pipe(
      mergeMap(([n, sdk, accAddress]) => {
        return rest.bank
          .allBalances(sdk, accAddress)
          .then((res) => res.data.balances);
      })
    );

    this.balancesValAlice$ = combineLatest([
      this.timer$,
      this.sdk$,
      this.valAddressAlice$,
    ]).pipe(
      mergeMap(([n, sdk, valAddress]) => {
        return rest.bank
          .allBalances(sdk, valAddress)
          .then((res) => res.data.balances);
      })
    );

    this.delegationsAlice$ = combineLatest([
      this.timer$,
      this.sdk$,
      this.accAddressAlice$,
    ]).pipe(
      mergeMap(([n, sdk, address]) =>
        rest.staking.delegatorDelegations(sdk, address)
      ),
      map((res) => res.data)
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
      map((key) => cosmosclient.ValAddress.fromPublicKey(key))
    );

    //Bobの所持tokenを取得
    this.balancesBob$ = combineLatest([
      this.timer$,
      this.sdk$,
      this.accAddressBob$,
    ]).pipe(
      mergeMap(([n, sdk, accAddressBob]) => {
        return rest.bank
          .allBalances(sdk, accAddressBob)
          .then((res) => res.data.balances);
      })
    );

    this.delegationsBob$ = combineLatest([
      this.timer$,
      this.sdk$,
      this.accAddressBob$,
    ]).pipe(
      mergeMap(([n, sdk, address]) =>
        rest.staking.delegatorDelegations(sdk, address)
      ),
      map((res) => res.data)
    );

    ///////////////////////////////////////////////////////////////////////////////

    this.totalSupply$ = combineLatest([this.timer$, this.sdk$]).pipe(
      mergeMap(([n, sdk]) => rest.bank.totalSupply(sdk).then((res) => res.data))
    );

    this.communityPool$ = combineLatest([this.timer$, this.sdk$]).pipe(
      mergeMap(([n, sdk]) =>
        rest.distribution.communityPool(sdk).then((res) => res.data)
      )
    );

    this.delegationTotalRewards$ = combineLatest([
      this.timer$,
      this.sdk$,
      this.accAddressAlice$,
    ]).pipe(
      mergeMap(([n, sdk, accAddressAlice]) =>
        rest.distribution
          .delegationTotalRewards(sdk, accAddressAlice)
          .then((res) => res.data)
      )
    );

    this.delegationRewards$ = combineLatest([
      this.timer$,
      this.sdk$,
      this.accAddressAlice$,
      this.valAddressAlice$,
    ]).pipe(
      mergeMap(([n, sdk, accAddressAlice, valAddressAlice]) =>
        rest.distribution
          .delegationRewards(sdk, accAddressAlice, valAddressAlice)
          .then((res) => res.data)
      )
    );

    this.delegatorValidators$ = combineLatest([
      this.timer$,
      this.sdk$,
      this.accAddressAlice$,
    ]).pipe(
      mergeMap(([n, sdk, accAddressAlice]) =>
        rest.distribution
          .delegatorValidators(sdk, accAddressAlice)
          .then((res) => res.data)
      )
    );
    this.delegatorWithdrawAddress$ = combineLatest([
      this.timer$,
      this.sdk$,
      this.accAddressBob$,
    ]).pipe(
      mergeMap(([n, sdk, accAddress]) =>
        rest.distribution
          .delegatorWithdrawAddress(sdk, accAddress)
          .then((res) => res.data)
      )
    );
    this.validatorCommission$ = combineLatest([
      this.timer$,
      this.sdk$,
      this.valAddressAlice$,
    ]).pipe(
      mergeMap(([n, sdk, valAddressAlice]) =>
        rest.distribution
          .validatorCommission(sdk, valAddressAlice)
          .then((res) => res.data)
      )
    );
    this.validatorOutstandingRewards$ = combineLatest([
      this.timer$,
      this.sdk$,
      this.valAddressAlice$,
    ]).pipe(
      mergeMap(([n, sdk, valAddressAlice]) =>
        rest.distribution
          .validatorOutstandingRewards(sdk, valAddressAlice)
          .then((res) => res.data)
      )
    );

    this.validators$ = this.sdk$.pipe(
      mergeMap((sdk) => rest.staking.validators(sdk)),
      map((result) => result.data)
    );

    this.params$ = this.sdk$.pipe(
      mergeMap((sdk) => rest.bank.params(sdk).then((res) => res.data))
    );

    this.txsWithPagination$ = combineLatest([
      this.sdk$,
      this.accAddressAlice$,
    ]).pipe(
      mergeMap(([sdk, address]) => {
        return rest.tx
          .getTxsEvent(
            sdk,
            [`message.sender='${address}'`],
            undefined,
            undefined,
            undefined,
            true
          )
          .then((res) => res.data)
          .catch((error) => {
            console.error(error);
            return undefined;
          });
      })
    );

    //debug
    /*
    this.params$.subscribe((x) => console.log('params', x));
    //{simulatedGasUsed: '61118', simulatedGasUsedWithMargin: '67230',
    // simulatedFeeWithMarginNumber: ***6723***, simulatedFeeWithMargin: '6723'}

    //1
    this.delegationTotalRewards$.subscribe(
      (x) => console.log('delegationTotalRewards', x)
      //ValAddr : cosmosvaloper1858rdtc0szeydg5ajlyevgg74uyrh9rscxh494
      //0: {denom: 'stake', amount: '6961.626000000000000000'}
    );
    //2
    this.delegationRewards$.subscribe(
      (x) => console.log('delegationRewards', x)
      //delegation responses = null
    );

    //3
    this.delegatorValidators$.subscribe(
      (x) => console.log('delegatorValidators', x)
      //validators: 'cosmosvaloper1uctpdknqgepekhs4tdmyw7zufjvkskfpku53yd'
    );

    //4
    this.delegatorWithdrawAddress$.subscribe(
      (x) => console.log('delegatorWithdrawAddress', x)
      //withdraw_address: "cosmos1uctpdknqgepekhs4tdmyw7zufjvkskfpngqyg7"
    );
    /*
    //5
    this.validatorCommission$.subscribe(
      (x) => console.log('validatorCommission', x)
      //0: {denom: 'stake', amount: '708.246000000000000000'}
    );
    //6
    this.validatorOutstandingRewards$.subscribe(
      (x) => console.log('validatorOutstandingRewards', x)
      //0: {denom: 'stake', amount: '7735.140000000000000000'});

    this.delegationsBob$.subscribe((x) => console.log('delegationsBob$', x));
    this.delegationsAlice$.subscribe((x) =>
      console.log('delegationsAlice$', x)
    );
        */
  }

  ngOnInit(): void {}

  //txを送信
  async sendTx(
    mnemonic: string,
    sdk_in: Observable<cosmosclient.CosmosSDK>,
    toAddress: AccAddress,
    denom: string,
    amount: string
  ): Promise<void> {
    //sdk
    const sdk = await sdk_in.toPromise();
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
    });
    console.log('tx_res', res);
  }

  async createDelegator(
    mnemonic: string,
    sdk$: Observable<cosmosclient.CosmosSDK>,
    //validatorAddress: string,
    valAddress$: Observable<cosmosclient.ValAddress>,
    amount: proto.cosmos.base.v1beta1.ICoin
  ) {
    //const sdk = await this.cosmosSDK.sdk().then((sdk) => sdk.rest);
    //const privKey = this.key.getPrivKey(key.type, privateKey);
    console.log('init');
    const sdk = await sdk$.toPromise();
    const privKey = new proto.cosmos.crypto.secp256k1.PrivKey({
      key: await cosmosclient.generatePrivKeyFromMnemonic(mnemonic),
    });
    const pubKey = privKey.pubKey();
    const fromAddress = cosmosclient.AccAddress.fromPublicKey(pubKey);
    const tempValidatorAddress = await valAddress$.toPromise();
    const validatorAddress = tempValidatorAddress.toString();
    console.log('on', { validatorAddress, amount, fromAddress });
    /*
    const amount: proto.cosmos.base.v1beta1.ICoin = {
      denom: 'token',
      amount: '1000',
    };*/

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
      validator_address: validatorAddress,
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
        //amount: [{ denom: this.gasDenom, amount: '100' }],
        gas_limit: cosmosclient.Long.fromString('200000'),
      },
    });

    /*
    // sign for simulation
    const txBuilderSim = new cosmosclient.TxBuilder(sdk, txBody, authInfoSim);
    const signDocBytesSim = txBuilderSim.signDocBytes(account.account_number);
    txBuilderSim.addSignature(privKey.sign(signDocBytesSim));

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

    /*/ //////////////////////////////////////////////////////////////////////////////////

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
