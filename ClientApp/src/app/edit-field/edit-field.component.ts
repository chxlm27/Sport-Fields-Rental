import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-field',
  templateUrl: './edit-field.component.html',
  styleUrls: ['./edit-field.component.css']
})
export class EditFieldComponent implements OnInit {
  fieldForm: FormGroup;
  fieldId: number | null = null;
  field: SportField | null = null;
  selectedFile: File | null = null;

  constructor(
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.fieldForm = this.formBuilder.group({
      id: [{ value: '', disabled: true }],
      sportType: ['', Validators.required],
      terrainName: ['', Validators.required],
      dimension: ['', Validators.required],
      terrainType: ['', Validators.required],
      price: ['', Validators.required],
      urlPath: ['']
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam !== null) {
        this.fieldId = +idParam;
        if (!isNaN(this.fieldId)) {
          this.fetchField(this.fieldId);
        } else {
          console.error('Invalid field ID');
        }
      } else {
        console.error('Field ID parameter is null');
        // Handle the case where 'id' is null, e.g., show an error or redirect
      }
    });
  }

  fetchField(id: number): void {
    this.http.get<SportField>(`https://localhost:44474/sportfield/${id}`).subscribe(result => {
      this.field = result;
      this.fieldForm.setValue({
        id: this.field.id,
        sportType: this.field.sportType,
        terrainName: this.field.terrainName,
        dimension: this.field.dimension,
        terrainType: this.field.terrainType,
        price: this.field.price,
        urlPath: this.field.urlPath
      });
    }, error => {
      console.error('Error fetching the field:', error);
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit(): void {
    if (this.fieldForm.valid && this.fieldId !== null) {
      const formData = new FormData();
      formData.append('SportType', this.fieldForm.get('sportType')?.value);
      formData.append('TerrainName', this.fieldForm.get('terrainName')?.value);
      formData.append('Dimension', this.fieldForm.get('dimension')?.value);
      formData.append('TerrainType', this.fieldForm.get('terrainType')?.value);
      formData.append('Price', this.fieldForm.get('price')?.value);

      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      }

      this.http.put(`https://localhost:44474/sportfield/${this.fieldId}`, formData)
        .subscribe(
          (response) => {
            console.log('Field updated:', response);
            this.router.navigate(['/sportfield']);
          },
          (error) => {
            console.error('Error updating the field:', error);
          }
        );
    }
  }


  goBackToList(): void {
    this.router.navigate(['/fetch-fields']);
  }
}

interface SportField {
  id: number;
  terrainName: string;
  sportType: string;
  dimension: string;
  terrainType: string;
  price: number;
  urlPath: string;
}
