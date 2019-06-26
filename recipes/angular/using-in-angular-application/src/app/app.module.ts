// this code is part of the simplux recipe "using simplux in my Angular application":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/angular/using-in-angular-application

import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { CounterComponent } from './counter.component'

@NgModule({
  declarations: [CounterComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [CounterComponent],
})
export class AppModule {}
