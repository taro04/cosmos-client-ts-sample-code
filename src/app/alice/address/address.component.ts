import { Component, OnInit, Input } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { AccAddress, ValAddress } from '@cosmos-client/core/cjs/types';
import { mergeMap, map } from 'rxjs/operators';

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

  valAddress$: Observable<ValAddress | undefined>
  timer$: Observable<number> = timer(0, 3 * 1000);

  constructor() {

    this.valAddress$ = timer().pipe(
      map(n => {
        const A = this.accAddress?.toString()

        //ToDo: get bob's val address
        //const val: ValAddress = AccAddress.fromString(this.accAddress?.toString() || "")

        const val = undefined

        return val

      }
      ),



    )





  }

  ngOnInit(): void {
  }

}
