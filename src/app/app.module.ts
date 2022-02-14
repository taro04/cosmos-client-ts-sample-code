import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AliceComponent } from './alice/alice.component';
import { BobComponent } from './bob/bob.component';
import { AliceModule } from './alice/alice.module';
import { BobModule } from './bob/bob.module';
import { BalancesModule } from './alice/balances/balances.module';

@NgModule({
  declarations: [AppComponent, AliceComponent, BobComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    MatGridListModule,
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    AliceModule,
    BobModule,
    BalancesModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
