import { Component, OnInit, Input } from '@angular/core';
import { AccAddress } from '@cosmos-client/core/cjs/types/address/acc-address';
import { cosmosclient, rest } from '@cosmos-client/core';
import { mergeMap } from 'rxjs/operators';
import { Observable, timer } from 'rxjs';
import { InlineResponse20063DelegationResponses } from '@cosmos-client/core/cjs/openapi/api';

@Component({
  selector: 'app-delegations',
  templateUrl: './delegations.component.html',
  //styleUrls: ['./delegations.component.css']
})
export class DelegationsComponent implements OnInit {
  @Input()
  address?: AccAddress;

  @Input()
  sdk?: cosmosclient.CosmosSDK | null;

  delegations$?: Observable<
    InlineResponse20063DelegationResponses[] | undefined
  >;
  timer$: Observable<number> = timer(0, 3 * 1000);

  constructor() {
    this.delegations$ = this.timer$.pipe(
      mergeMap((t) => {
        if (
          this.sdk === undefined ||
          this.sdk === null ||
          this.address === undefined
        ) {
          return [];
        } else {
          return rest.staking
            .delegatorDelegations(this.sdk, this.address)
            .then((res) => res.data.delegation_responses);
        }
      })
    );
    //this.delegations$.subscribe((x) => console.log(x));
  }

  ngOnInit(): void {}
}
