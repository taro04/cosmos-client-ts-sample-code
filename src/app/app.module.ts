import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { AliceComponent } from './alice/alice.component';
import { BobComponent } from './bob/bob.component';

import { AddressModule } from './common/address/address.module';
import { BalancesModule } from './common/balances/balances.module';
import { DelegationsModule } from './common/delegations/delegations.module';
import { SendModule } from './common/send/send.module';
import { StakingDelegateModule } from './common/staking-delegate/staking-delegate.module';


@NgModule({
  declarations: [AppComponent, AliceComponent, BobComponent,],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatGridListModule,
    MatCardModule,
    AddressModule,
    BalancesModule,
    DelegationsModule,
    SendModule,
    StakingDelegateModule,
    MatSnackBarModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
