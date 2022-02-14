import { Component, OnInit, Input } from '@angular/core';
import { combineLatest, from, of, Observable, timer } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { AccAddress } from '@cosmos-client/core/cjs/types/address/acc-address';
import { cosmosclient, proto, rest } from '@cosmos-client/core';
import {
  InlineResponse20028Balances,
  InlineResponse20033,
  InlineResponse20063,
  QueryTotalSupplyResponseIsTheResponseTypeForTheQueryTotalSupplyRPCMethod,
  QueryValidatorsResponseIsResponseTypeForTheQueryValidatorsRPCMethod,
  CosmosDistributionV1beta1QueryCommunityPoolResponse,
} from '@cosmos-client/core/cjs/openapi/api';

@Component({
  selector: 'app-balances',
  templateUrl: './balances.component.html',
  //styleUrls: ['./balances.component.css'],
})
export class BalancesComponent implements OnInit {
  @Input()
  mnemonic?: string;

  @Input()
  sdk?: cosmosclient.CosmosSDK | null;

  publicKey$: Observable<cosmosclient.PubKey>;
  accAddress$: Observable<cosmosclient.AccAddress>;
  balances$: Observable<InlineResponse20028Balances[] | undefined>;

  timer$: Observable<number> = timer(0, 3 * 1000);

  constructor() {
    this.publicKey$ = from(
      cosmosclient.generatePrivKeyFromMnemonic(this.mnemonic || '')
    ).pipe(
      map((privatekey) => {
        const privateKey = new proto.cosmos.crypto.secp256k1.PrivKey({
          key: privatekey,
        });
        return privateKey.pubKey();
      })
    );

    this.accAddress$ = this.publicKey$.pipe(
      map((pubkey) => cosmosclient.AccAddress.fromPublicKey(pubkey))
    );

    this.balances$ = combineLatest([this.timer$, this.accAddress$]).pipe(
      mergeMap(([n, accAddress]) => {
        //if (this.sdk) {
        if (this.sdk === undefined || this.sdk === null) {
          console.log(n, ' []daze', accAddress.toString());
          return [];
        } else {
          console.log(n, ' OK daze', accAddress.toString());
          return rest.bank
            .allBalances(this.sdk, accAddress)
            .then((res) => res.data.balances);
        }
      })
    );

    this.balances$.subscribe((x) => console.log(x, this.sdk, this.mnemonic));
    this.publicKey$.subscribe((x) => console.log(x));
    this.accAddress$.subscribe((x) => console.log(x));
  }

  ngOnInit(): void {}

  ngOnChanges() {
    this.publicKey$ = from(
      cosmosclient.generatePrivKeyFromMnemonic(this.mnemonic || '')
    ).pipe(
      map((privatekey) => {
        const privateKey = new proto.cosmos.crypto.secp256k1.PrivKey({
          key: privatekey,
        });
        return privateKey.pubKey();
      })
    );
  }
}
