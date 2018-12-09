import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {RequestsService} from '../../../services/requests.service';
import {Type} from '../../../domain/type';


declare var ol: any;

@Component({
  selector: 'app-new-incident',
  templateUrl: 'new-incident.component.html',
})
export class NewIncidentComponent implements OnInit {
  latitude = -87.6298;
  longitude = 41.8781;

  map: any;

  submitForm = this.fb.array([]);
  public errorMessage: string;
  public types: Type[];
  public formType: string;
  public newIncidentForm: FormGroup;
  public ssaForm: FormGroup;
  public curActivityActionForm: FormGroup;
  public treeLocationForm: FormGroup;

  formDefinition = {
    TypeofServiceRequest: ['', Validators.required],
    StreetAddress: ['', Validators.required],
    ZIPCode: ['', Validators.required],
    Xcoordinate: [''],
    Ycoordinate: [''],
    Ward: ['', Validators.required],
    PoliceDistrict: ['', Validators.required],
    CommunityArea: ['', Validators.required],
    Latitude: ['', Validators.required],
    Longitude: ['', Validators.required],
    Location: this.fb.group({
      latitude: [''],
      longitude: ['']
    })
  };

  ssaDefinition = {
    ssa: ''
  };

  activity_actionsDefinition = {
    CurrentActivity: '',
    MostRecentAction: ''
  };

  abandoned_vehicles = {
    licenseplate: '',
    vehiclemakemodel: '',
    vehiclecolor: '',
    daysparked: ''
  };

  garbage_carts = {
    NumberofBlackCartsDelivered: ''
  };

  graffiti_removal = {
    Surface: '',
    GraffitiLocation: ''
  };

  potholes_reported = {
    PotholesFilledOnBlock: ''
  };

  rodent_baiting = {
    PremisesBaited: '',
    PremiseswithGarbage: '',
    PremiseswithRats: ''
  };

  sanitation_complaints = {
    NatureofCodeViolation: ''
  };

  tree_debris_trims_location = {
    location: ''
  };

  constructor(
    private fb: FormBuilder,
    private requestService: RequestsService
  ) {}

  ngOnInit() {
    this.getTypes();
    this.newIncidentForm = this.fb.group(this.formDefinition);


    const mousePositionControl = new ol.control.MousePosition({
      coordinateFormat: ol.coordinate.createStringXY(4),
      projection: 'EPSG:4326',
      // comment the following two lines to have the mouse position
      // be placed within the map.
      // className: 'custom-mouse-position',
      // target: document.getElementById('mouse-position'),
      undefinedHTML: '&nbsp;'
    });

    // const markerStyle = new ol.style.Style({
    //   image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
    //     anchor: [0.5, 46],
    //     anchorXUnits: 'fraction',
    //     anchorYUnits: 'pixels',
    //     opacity: 0.75,
    //     src: 'https://openlayers.org/en/v4.6.4/examples/data/icon.png'
    //   }))
    // });

    const markerSource = new ol.source.Vector();

    this.map = new ol.Map({
      target: 'map',
      controls: ol.control.defaults({
        attributionOptions: {
          collapsible: false
        }
      }).extend([mousePositionControl]),
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        }),
        new ol.layer.Vector({
          source: markerSource,
          // style: markerStyle,
        }),
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([this.latitude, this.longitude]),
        zoom: 12
      })
    });

    function addMarker(lon, lat) {
      // const iconFeatures = [];
      const iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.transform([lon, lat], 'EPSG:4326',
          'EPSG:3857')),
        // name: 'Null Island',
        // population: 4000,
        // rainfall: 500
      });
      markerSource.addFeature(iconFeature);
    }

    this.map.on('click', function (args) {
      // console.log(args.coordinate);
      const lonlat = ol.proj.transform(args.coordinate, 'EPSG:3857', 'EPSG:4326');
      console.log(lonlat);

      markerSource.clear();

      const lon = lonlat[0];
      const lat = lonlat[1];
      // alert(`lat: ${lat} long: ${lon}`);
      // (<HTMLInputElement>document.getElementById('Longitude')).value = lon;
      // (<HTMLInputElement>document.getElementById('Latitude')).value = lat;

      document.getElementById('Xcoordinate').innerText = args.coordinate[0];
      document.getElementById('Ycoordinate').innerText = args.coordinate[1];
      document.getElementById('Longitude').innerText = lonlat[0];
      document.getElementById('Latitude').innerText = lonlat[1];

      addMarker(lon, lat);
    });
  }

  getTypes() {
    this.requestService.getTypeOfRequests().subscribe(
      res => this.types = res,
      error => this.errorMessage = <any>error
    );
  }

  submitIncident() {
    this.submitForm = this.fb.array([]);
    this.errorMessage = '';

    this.newIncidentForm.get('Xcoordinate').setValue(document.getElementById('Xcoordinate').innerText);
    this.newIncidentForm.get('Ycoordinate').setValue(document.getElementById('Ycoordinate').innerText);
    this.newIncidentForm.get('Longitude').setValue(document.getElementById('Longitude').innerText);
    this.newIncidentForm.get('Latitude').setValue(document.getElementById('Latitude').innerText);
    this.newIncidentForm.patchValue({
      Location: {
        latitude: this.newIncidentForm.get('Latitude').value,
        longitude: this.newIncidentForm.get('Longitude').value
      }
    });

    this.form.push(this.newIncidentForm);

    if (this.formType === 'Street Lights - All/Out'
      || this.formType === 'Street Light Out'
      || this.formType === 'Street Light Out'
    ) {}

    if (this.formType === 'Abandoned Vehicle Complaint'
      || this.formType === 'Pothole in Street'
      || this.formType === 'Rodent Baiting/Rat Complaint'
      || this.formType === 'Tree Debris'
      || this.formType === 'Garbage Cart Black Maintenance/Replacement') {
      this.form.push(this.curActivityActionForm);
    }

    if (this.formType === 'Tree Debris'
      || this.formType === 'Tree Trim') {
      this.form.push(this.treeLocationForm);
    }

    this.postNewIncident();

    console.log(this.types);
  }

  onTypeSelect(event) {
    this.formType = event.target.value;
    console.log(this.formType);
    if (this.formType === 'Abandoned Vehicle Complaint'
        || this.formType === 'Pothole in Street'
        || this.formType === 'Garbage Cart Black Maintenance/Replacement'
        || this.formType === 'Graffiti Removal') {
      this.ssaForm = this.fb.group(this.ssaDefinition);
    }
    if (this.formType === 'Abandoned Vehicle Complaint'
      || this.formType === 'Pothole in Street'
      || this.formType === 'Rodent Baiting/Rat Complaint'
      || this.formType === 'Tree Debris'
      || this.formType === 'Garbage Cart Black Maintenance/Replacement') {
      this.curActivityActionForm = this.fb.group(this.activity_actionsDefinition);
    }
    if (this.formType === 'Tree Debris'
      || this.formType === 'Tree Trim') {
      this.treeLocationForm = this.fb.group(this.tree_debris_trims_location);
    }

  }

  postNewIncident() {
    this.requestService.postNewIncident(this.submitForm).subscribe(
      _ => {},
      error => this.errorMessage = <any> error
    );
  }

  get form() {
    return this.submitForm as FormArray;
  }

  setCenter() {
    const view = this.map.getView();
    view.setCenter(ol.proj.fromLonLat([this.longitude, this.latitude]));
    view.setZoom(12);
  }
}
