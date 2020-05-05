import { Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

import {Observable, EMPTY, combineLatest, Subject, BehaviorSubject } from 'rxjs';

import { Product } from './product';
import { ProductService } from './product.service';
import { catchError, map } from 'rxjs/operators';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'] , 
  changeDetection : ChangeDetectionStrategy.OnPush
 })
export class ProductListComponent implements OnInit{
  pageTitle = 'Product List';
  
  
 private categorySelectedSubject = new BehaviorSubject<number>(0);
 private  categorySelectedEvent$ = this.categorySelectedSubject.asObservable();

 errorMessageSubject = new Subject();
 errorMessagesStream$ = this.errorMessageSubject.asObservable();
  
  
    products$ = combineLatest(
      this.productService.productsupdated$ , 
      this.categorySelectedEvent$)
          .pipe(map( ([products , categoryid]) =>  
                        products.filter(product => 
                          categoryid ? categoryid === product.categoryId :  true )),
                 catchError((error) => {
                  this.errorMessageSubject.next(error)
                        return EMPTY ; 
                   })
            );

     categories$ = this.categoryService.categories$
                .pipe(
                  catchError((error) => {
                    this.errorMessageSubject.next(error)
                    return EMPTY ; 
               })
                );
      
    constructor(private productService: ProductService  , private categoryService : ProductCategoryService) { }

    ngOnInit(): void {}
    
  
  onAdd(): void {
    console.log("TEST ADD BUTON");  
    this.productService.addProduct();
  }

  onSelected(categoryId: string): void {
  this.categorySelectedSubject.next(+categoryId);
  }
}
