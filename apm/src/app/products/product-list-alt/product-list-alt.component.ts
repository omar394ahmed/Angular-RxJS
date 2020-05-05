import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

import { Subscription, EMPTY, Subject } from 'rxjs';

import { Product } from '../product';
import { ProductService } from '../product.service';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html' 
})
export class ProductListAltComponent implements OnInit, OnDestroy {
  pageTitle = 'Products';
  
  
  errorMessageSubject = new Subject();
  errorMessagesStream$ = this.errorMessageSubject.asObservable();
  
  
  constructor(private productService: ProductService) { }

  ngOnInit(): void {}

  products$ = this.productService.productwithCategory$.
     pipe(
       catchError(error =>{ 
         this.errorMessageSubject.next(error)
         return EMPTY}
       )
     );
  
  selectedProduct$ = this.productService.selectedproduct$;  
  ngOnDestroy(): void {
   
  }

  onSelected(productId: number): void {
    console.log(productId)
    this.productService.selecteproductChange(productId)}
}
