import { Component, OnInit, Input } from '@angular/core';
import { AccAddress, ValAddress } from '@cosmos-client/core/cjs/types';


@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  //styleUrls: ['./address.component.css']
})
export class AddressComponent implements OnInit {

  @Input()
  accAddress?: AccAddress | null;

  @Input()
  valAddress?: ValAddress | null;

  constructor() { }

  ngOnInit(): void {
  }

}
