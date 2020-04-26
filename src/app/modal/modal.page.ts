import { Component, Input } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { HomePage } from '../home/home.page'
 
@Component({
  selector: 'modal.page',
  templateUrl: './modal.page.html',
  styleUrls: ['./modal.page.scss']
})
export class ModalPage {

  constructor(public modalController: ModalController) {}
  
  public dismiss() {
    this.modalController.dismiss({
      dismissed: true
    });
  }

}

