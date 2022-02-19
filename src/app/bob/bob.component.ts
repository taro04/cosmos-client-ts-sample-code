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
    'rhythm abuse hamster ball student material control length wet engage learn umbrella beyond aisle quick canal tooth reject pyramid adult paddle enter fitness orphan';

  constructor() { }

  ngOnInit(): void { }
}
