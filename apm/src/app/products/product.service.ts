import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, throwError, of, EMPTY , combineLatest, BehaviorSubject, Subject, merge, from } from 'rxjs';
import { catchError, tap, map, scan, shareReplay, mergeMap, toArray, switchMap } from 'rxjs/operators';

import { Product } from './product';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;

  selectedProductSubject = new BehaviorSubject<number>(0); 
  selectedProductActionStream$ = this.selectedProductSubject.asObservable();

  AddProductSubject = new Subject<Product>();
  AddProductaActionStream$ = this.AddProductSubject.asObservable();

      constructor(private http: HttpClient,
              private categoryService : ProductCategoryService , 
              private supplierService: SupplierService) { }
  
             
  
  products$ =  this.http.get<Product[]>(this.productsUrl)
      .pipe(
        //tap(data => console.log('Products: ', JSON.stringify(data))),
        shareReplay(1) , 
        catchError(this.handleError)
      );

  productwithCategory$ = combineLatest([
            this.products$ ,
            this.categoryService.categories$ ]).pipe(
                  map( ([products , categories]) => 
                        products.map( product =>({
                          ...product ,
                          price : product.price * 2 ,
                          category : categories.find(categoryitem => 
                          product.categoryId===categoryitem.id).name , 
                          searchKey : [product.productName]   
                        }) as Product))   
                        );
     
productsupdated$ = merge (this.productwithCategory$ , this.AddProductaActionStream$)
      .pipe(
        scan( (acc: Product[] , value : Product) => [...acc , value] )
      );

              
  selectedproduct$ = combineLatest( [this.productwithCategory$ , this.selectedProductActionStream$])
                 .pipe(
                      
                     map(  ([products , selectedproductid ]) => products.find(product => product.id===selectedproductid)) ,
                     //tap( () => console.log('test')) ,  
                     shareReplay(1) 
                     
                  );
   ProductSupplier$ = this.selectedproduct$.
      pipe( switchMap( product => from(product.supplierIds)
             .pipe(  
                    mergeMap( id => this.http.get<Supplier>(`${this.supplierService.suppliersUrl}/${id}`)  ) , 
                    toArray() 
                    , tap(suppliers => console.log ('this suppliers ' , JSON.stringify(suppliers)) )
                  ) )  );               
  


  selecteproductChange (productid : number ){
    this.selectedProductSubject.next(productid);
  }
  addProduct(product? : Product){
     let updatedproduct = product || this.fakeProduct();

    this.AddProductSubject.next(updatedproduct);
  }


  private fakeProduct() {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      category: 'Toolbox',
      quantityInStock: 30
    };
  }

  private handleError(err:  any) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }

}
