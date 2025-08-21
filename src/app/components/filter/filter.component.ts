import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Film, Species, FilterCriteria } from '../../models/characters.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  @Input() films: Film[] = [];
  @Input() species: Species[] = [];
  @Output() filterChange = new EventEmitter<FilterCriteria>();

  filterForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      selectedFilm: [''],
      selectedSpecies: [''],
      birthYearStart: [null],
      birthYearEnd: [null]
    });
  }

  ngOnInit(): void {
    // Watch for form changes and emit filter criteria
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(formValue => {
      this.emitFilterChange(formValue);
    });

    // Emit initial filter state
    this.emitFilterChange(this.filterForm.value);
  }

  private emitFilterChange(formValue: any): void {
    const filters: FilterCriteria = {
      selectedFilm: formValue.selectedFilm || '',
      selectedSpecies: formValue.selectedSpecies || '',
      birthYearStart: formValue.birthYearStart,
      birthYearEnd: formValue.birthYearEnd
    };
    
    this.filterChange.emit(filters);
  }

  onClearFilters(): void {
    this.filterForm.reset({
      selectedFilm: '',
      selectedSpecies: '',
      birthYearStart: null,
      birthYearEnd: null
    });
  }

  getFilmDisplayName(film: Film): string {
    return `Episode ${film.episode_id}: ${film.title}`;
  }

  // Validation for birth year inputs
  onBirthYearChange(): void {
    const startYear = this.filterForm.get('birthYearStart')?.value;
    const endYear = this.filterForm.get('birthYearEnd')?.value;

    if (startYear !== null && endYear !== null && startYear > endYear) {
      // Swap values if start > end
      this.filterForm.patchValue({
        birthYearStart: endYear,
        birthYearEnd: startYear
      });
    }
  }

  trackByFilmUrl(index: number, film: Film): string {
    return film.url;
  }

  trackBySpeciesUrl(index: number, species: Species): string {
    return species.url;
  }
}