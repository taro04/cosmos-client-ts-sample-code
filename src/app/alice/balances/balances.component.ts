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
  address?: AccAddress;

  @Input()
  sdk?: cosmosclient.CosmosSDK | null;

  valAddress$: Observable<cosmosclient.AccAddress | undefined>;
  balances$: Observable<InlineResponse20028Balances[] | undefined>;
  timer$: Observable<number> = timer(0, 3 * 1000);

  constructor() {
    this.valAddress$ = this.timer$.pipe(
      map(() => {
        if (this.address) {
          return cosmosclient.ValAddress.fromString(this.address.toString());
        } else {
          return undefined;
        }
      })
    );

    this.balances$ = this.timer$.pipe(
      mergeMap((t) => {
        //if (this.sdk) {
        if (
          this.sdk === undefined ||
          this.sdk === null ||
          this.address === undefined
        ) {
          return [];
        } else {
          return rest.bank
            .allBalances(this.sdk, this.address)
            .then((res) => res.data.balances);
        }
      })
    );
  }

  ngOnInit(): void {}
}
