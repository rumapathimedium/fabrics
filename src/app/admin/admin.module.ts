import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AdminService } from './services/admin.service';
import { AdminRoutingModule } from './admin-routing.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    AdminRoutingModule
  ],
  providers: [
    AdminService
  ]
})
export class AdminModule { }