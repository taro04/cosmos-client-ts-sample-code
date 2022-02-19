import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StakingDelegateComponent } from './staking-delegate.component';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [StakingDelegateComponent],
  imports: [CommonModule, MatButtonModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  exports: [StakingDelegateComponent],
})
export class StakingDelegateModule { }
