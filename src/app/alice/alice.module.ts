import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DelegationsComponent } from './delegations/delegations.component';
//import { StakingDelegateComponent } from './staking-delegate/staking-delegate.component';

@NgModule({
  declarations: [DelegationsComponent],
  imports: [CommonModule],
  exports: [DelegationsComponent],
})
export class AliceModule {}
