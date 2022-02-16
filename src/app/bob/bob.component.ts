import { Component, Input, OnInit } from '@angular/core';
import { cosmosclient, proto, rest } from '@cosmos-client/core';
import { combineLatest, from, of, Observable, timer } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { AccAddress } from '@cosmos-client/core/cjs/types';
import { ValAddress } from '@cosmos-client/core/cjs/types';

@Component({
  selector: 'app-bob',
  templateUrl: './bob.component.html',
  //styleUrls: ['./bob.component.css'],
})
export class BobComponent implements OnInit {
  @Input()
  sdk?: cosmosclient.CosmosSDK | null;

  @Input()
  accAddress?: AccAddress | null;

  @Input()
  toAddress?: AccAddress | null;

  @Input()
  valAddress?: ValAddress | null;

  mnemonic =
    'false service fork grab lumber earn spatial window can endless empower wing route taxi trust play step crater sketch twist poem angry fashion cry';

  constructor() {}

  ngOnInit(): void {}
}
