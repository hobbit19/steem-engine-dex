﻿import { customElement, bindable, bindingMode } from 'aurelia-framework';

@customElement('buybook')
export class BuyBook {
    @bindable data;
    @bindable loading;
    @bindable buyBook;    
    @bindable({ defaultBindingMode: bindingMode.twoWay }) price;

    setBidPrice(newValue) {
        this.price = newValue;
    }
}