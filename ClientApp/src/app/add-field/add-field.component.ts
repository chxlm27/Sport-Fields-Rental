import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-field',
  templateUrl: './add-field.component.html',
  styleUrls: ['./add-field.component.css']
})
export class AddFieldComponent {
  fieldForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.fieldForm = this.formBuilder.group({
      sportType: ['', Validators.required],
      terrainName: ['', Validators.required],
      dimension: ['', Validators.required],
      terrainType: ['', Validators.required],
      price: ['', Validators.required]
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {
    if (this.fieldForm.valid && this.selectedFile) {
      const formData = new FormData();
      formData.append('SportType', this.fieldForm.get('sportType')?.value);
      formData.append('TerrainName', this.fieldForm.get('terrainName')?.value);
      formData.append('Dimension', this.fieldForm.get('dimension')?.value);
      formData.append('TerrainType', this.fieldForm.get('terrainType')?.value);
      formData.append('Price', this.fieldForm.get('price')?.value);
      formData.append('file', this.selectedFile);

      console.log('Form Data:', formData);

      this.http.post('https://localhost:44474/sportfield', formData)
        .subscribe(
          (response) => {
            console.log('Response:', response);
            this.router.navigate(['/sportfield']);
          },
          (error) => {
            console.error('Error adding the field:', error);
          }
        );
    }
  }
}
