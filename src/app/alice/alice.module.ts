import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DelegationsComponent } from './delegations/delegations.component';

@NgModule({
  declarations: [DelegationsComponent],
  imports: [CommonModule],
  exports: [DelegationsComponent],
})
export class AliceModule {}
