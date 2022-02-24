import { Component, OnInit, Input } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { mergeMap, } from 'rxjs/operators';
import { AccAddress } from '@cosmos-client/core/cjs/types/address/acc-address';
import { cosmosclient, rest } from '@cosmos-client/core';
import {
  InlineResponse20028Balances,
} from '@cosmos-client/core/cjs/openapi/api';

@Component({
  selector: 'app-balances',
  templateUrl: './balances.component.html',
  //styleUrls: ['./balances.component.css'],
})
export class BalancesComponent implements OnInit {
  @Input()
  address?: AccAddress | null;

  @Input()
  sdk?: cosmosclient.CosmosSDK | null;

  balances$: Observable<InlineResponse20028Balances[] | undefined>;
  timer$: Observable<number> = timer(0, 3 * 1000);

  constructor() {
    this.balances$ = this.timer$.pipe(
      mergeMap((t) => {
        if (
          this.sdk === undefined ||
          this.sdk === null ||
          this.address === undefined ||
          this.address === null
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

  ngOnInit(): void { }
}
