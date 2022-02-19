import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BalancesComponent } from './balances.component';

@NgModule({
  declarations: [BalancesComponent],
  imports: [CommonModule],
  exports: [BalancesComponent],
})
export class BalancesModule {}
