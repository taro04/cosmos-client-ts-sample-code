import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { AliceComponent } from './alice/alice.component';
import { BobComponent } from './bob/bob.component';
import { AliceModule } from './alice/alice.module';
import { BobModule } from './bob/bob.module';
import { BalancesModule } from './alice/balances/balances.module';
import { SendModule } from './alice/send/send.module';
import { StakingDelegateModule } from './alice/staking-delegate/staking-delegate.module';

@NgModule({
  declarations: [AppComponent, AliceComponent, BobComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,

    BrowserAnimationsModule,
    MatGridListModule,
    MatCardModule,

    AliceModule,
    BobModule,
    BalancesModule,
    SendModule,
    StakingDelegateModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
