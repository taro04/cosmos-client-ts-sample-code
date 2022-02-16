import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StakingDelegateComponent } from './staking-delegate.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [StakingDelegateComponent],
  imports: [CommonModule, MatButtonModule],
  exports: [StakingDelegateComponent],
})
export class StakingDelegateModule {}
