// home.page.ts
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  NgZone,
  AfterViewInit,
} from '@angular/core';
import { MapsAPILoader, AgmMap } from '@agm/core';
import { AlertController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ModalPage } from '../modal/modal.page';
import { ViewerModalComponent } from 'ngx-ionic-image-viewer'

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  title: string = 'AGM project';
  latitude: number;
  longitude: number;
  zoom: number;
  address: string;
  private geoCoder;
  readonly mapRadius: number = 0.3;
  @ViewChild(AgmMap, { static: true })
  public agmMap: AgmMap;
  @ViewChild('search', { static: false })
  public searchElementRef: ElementRef;
  @ViewChild('directionsPanel', { static: false })
  public directionsPanel: ElementRef;
  currentLat: number;
  currentLng: number;
  public buttonClicked: boolean = false;
  map: any;
  directionsService;
  directionsDisplay;
  trip;
  static isOpen: boolean = false;

  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    public alertController: AlertController,
    public modalController: ModalController,
  ) {}

  ngOnInit() {
    //load Places Autocomplete
    this.map = this.mapsAPILoader.load().then(() => {
      this.setCurrentLocation();
      const nwBounds = new google.maps.LatLng({
        lat: this.currentLat - this.mapRadius,
        lng: this.currentLng - this.mapRadius,
      });
      const seBounds = new google.maps.LatLng({
        lat: this.currentLat + this.mapRadius,
        lng: this.currentLng + this.mapRadius,
      });

      this.geoCoder = new google.maps.Geocoder();

      let autocomplete = new google.maps.places.Autocomplete(
        this.searchElementRef.nativeElement,
        {
          bounds: new google.maps.LatLngBounds(nwBounds, seBounds),
        }
      );
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          //set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.getAddress(this.latitude, this.longitude);
          this.zoom = 12;
        });
      });
    });
  }

  loadMap() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;
      this.zoom = 8;
      this.getAddress(this.latitude, this.longitude);
    });
  }

  // Get Current Location Coordinates
  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.currentLng = position.coords.longitude;
        this.currentLat = position.coords.latitude;
        this.zoom = 12;
        this.getAddress(this.latitude, this.longitude);
      });
    }
  }

  // public setTrip() {
  //   let directionsService = new google.maps.DirectionsService();
  //   let directionsDisplay = new google.maps.DirectionsRenderer();
  //   directionsDisplay.setPanel(this.directionsPanel.nativeElement);
  //   directionsDisplay.setMap(this.map);
  //   directionsService.route(
  //     {
  //       origin: { lat: this.currentLat, lng: this.currentLng },
  //       destination: { lat: this.latitude, lng: this.longitude },
  //       travelMode: google.maps.TravelMode['BICYCLING'],
  //     },
  //     (res, status) => {
  //       if (status == google.maps.DirectionsStatus.OK) {
  //         directionsDisplay.setDirections(res);
  //         return this.directionsService.route;
  //       } else {
  //         console.warn(status);
  //       }
  //     }
  //   );
  // }

  dismiss() {
    this.directionsDisplay.setDirections(null);
    this.buttonClicked = false;
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Alert',
      subHeader: 'Subtitle',
      message: 'This is an alert message.',
      buttons: ['OK'],
    });

    await alert.present();
  }

  async openViewer() {
    const modal = await this.modalController.create({
      component: ViewerModalComponent,
      componentProps: {
        src: './assets/gif/right.gif'
      },
      cssClass: 'ion-img-viewer',
      keyboardClose: true,
      showBackdrop: true
    });
    return await modal.present();
  }

  markerDragEnd($event: any) {
    console.log($event);
    this.latitude = $event.coords.lat;
    this.longitude = $event.coords.lng;
    this.getAddress(this.latitude, this.longitude);
  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode(
      { location: { lat: latitude, lng: longitude } },
      (results, status) => {
        console.log(results);
        console.log(status);
        if (status === 'OK') {
          if (results[0]) {
            this.zoom = 12;
            this.address = results[0].formatted_address;
          } else {
            window.alert('No results found');
          }
        } else {
          window.alert('Geocoder failed due to: ' + status);
        }
      }
    );
  }
}
