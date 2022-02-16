import { Component, Input, OnInit } from '@angular/core';
import { cosmosclient, proto, rest } from '@cosmos-client/core';
import { AccAddress } from '@cosmos-client/core/cjs/types';
import { combineLatest, from, of, Observable, timer } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-alice',
  templateUrl: './alice.component.html',
  //styleUrls: ['./alice.component.css'],
})
export class AliceComponent implements OnInit {
  @Input()
  sdk?: cosmosclient.CosmosSDK | null;

  @Input()
  accAddress?: AccAddress | null;

  @Input()
  toAddress?: AccAddress | null;

  @Input()
  valAddress?: AccAddress | null;

  mnemonic =
    'comfort runway shiver rebuild rich clutch category return outside betray pitch vibrant shallow sweet erase route torch slight theory tissue boring group album mother';

  constructor() {}

  ngOnInit(): void {}
}
