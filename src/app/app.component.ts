import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { cosmosclient, rest } from 'cosmos-client';
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
  address = "";
  address$: BehaviorSubject<string> = new BehaviorSubject(this.address);
  accAddress$: Observable<cosmosclient.AccAddress | undefined>;
  balances$: Observable<InlineResponse20027Balances[] | undefined>;

  constructor() {
    this.sdk = new cosmosclient.CosmosSDK(this.nodeURL, this.chainID);
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
    this.balances$ = this.accAddress$.pipe(
      mergeMap((accAddress) => {
        console.log(accAddress);
        if (accAddress === undefined) {
          console.error('Address is invalid or does not have balances!');
          return of([]);
        }
        return rest.cosmos.bank.allBalances(this.sdk, accAddress).then(res => res.data.balances);
      }),
      catchError((error) => {
        console.error(error);
        return of([]);
      })
    )
  }

  ngOnInit(): void { }

  //addressを更新
  changeAddress(address: string): void {
    this.address$.next(address);
  }
}