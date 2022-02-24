import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddressComponent } from './address.component'


@NgModule({
  declarations: [AddressComponent],
  imports: [
    CommonModule
  ],
  exports: [AddressComponent]
})
export class AddressModule { }
