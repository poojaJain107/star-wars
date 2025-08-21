import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Character, CharacterResponse, Film, Species, Starship } from '../models/characters.interface';

@Injectable({
  providedIn: 'root'
})
export class SwapiService {
  private baseUrl = 'https://swapi.info/api';
  
  // Cache for storing fetched data to avoid unnecessary API calls
  private charactersCache: Character[] | null = null;
  private filmsCache: Film[] | null = null;
  private speciesCache: Species[] | null = null;
  private starshipsCache: Starship[] | null = null;

  constructor(private http: HttpClient) { }

  // Get all characters with pagination handling
  getAllCharacters(): Observable<Character[]> {
    if (this.charactersCache) {
      return of(this.charactersCache);
    }

    return this.fetchAllCharacters().pipe(
      map(characters => {
        this.charactersCache = characters;
        return characters;
      })
    );
  }

  private fetchAllCharacters(): Observable<Character[]> {
    let allCharacters: Character[] = [];
    
    return new Observable(observer => {
      const fetchPage = (page: number = 1) => {
        this.http.get<any>(`${this.baseUrl}/people`)
          .subscribe({
            next: (response) => {
              console.log(`Fetching page ${page}:`, response);
              allCharacters = response
              
              if (response.next) {
                // Extract page number from next URL
                const nextPage = this.extractPageNumber(response.next);
                fetchPage(nextPage);
              } else {
                observer.next(allCharacters);
                observer.complete();
              }
            },
            error: (error) => observer.error(error)
          });
      };
      
      fetchPage();
    });
  }

  // Get character by ID
  getCharacterById(id: number): Observable<Character> {
    return this.http.get<Character>(`${this.baseUrl}/people/${id}`);
  }

  // Get all films
  getAllFilms(): Observable<Film[]> {
    if (this.filmsCache) {
      return of(this.filmsCache);
    }

    return this.http.get<any>(`${this.baseUrl}/films`).pipe(
      map(response => {
        this.filmsCache = response
        return response;
      }),
      catchError(error => {
        console.error('Error fetching films:', error);
        return of([]);
      })
    );
  }

  // Get all species
  getAllSpecies(): Observable<Species[]> {
    if (this.speciesCache) {
      return of(this.speciesCache);
    }

    return this.fetchAllSpecies().pipe(
      map(species => {
        this.speciesCache = species;
        return species;
      })
    );
  }

  private fetchAllSpecies(): Observable<Species[]> {
    let allSpecies: Species[] = [];
    
    return new Observable(observer => {
      const fetchPage = (page: number = 1) => {
        this.http.get<any>(`${this.baseUrl}/species`)
          .subscribe({
            next: (response) => {
              console.log('species', response)
              allSpecies = response
              
              if (response.next) {
                const nextPage = this.extractPageNumber(response.next);
                fetchPage(nextPage);
              } else {
                observer.next(allSpecies);
                observer.complete();
              }
            },
            error: (error) => observer.error(error)
          });
      };
      
      fetchPage();
    });
  }

  // Get all starships
  getAllStarships(): Observable<Starship[]> {
    if (this.starshipsCache) {
      return of(this.starshipsCache);
    }

    return this.fetchAllStarships().pipe(
      map(starships => {
        this.starshipsCache = starships;
        return starships;
      })
    );
  }

  private fetchAllStarships(): Observable<Starship[]> {
    const allStarships: Starship[] = [];
    
    return new Observable(observer => {
      const fetchPage = (page: number = 1) => {
        this.http.get<{count: number, next: string | null, results: Starship[]}>(`${this.baseUrl}/starships/?page=${page}`)
          .subscribe({
            next: (response) => {
              allStarships.push(...response.results);
              
              if (response.next) {
                const nextPage = this.extractPageNumber(response.next);
                fetchPage(nextPage);
              } else {
                observer.next(allStarships);
                observer.complete();
              }
            },
            error: (error) => observer.error(error)
          });
      };
      
      fetchPage();
    });
  }

  // Get resource by URL (for fetching detailed information)
  getResourceByUrl<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }

  // Utility method to extract page number from URL
  private extractPageNumber(url: string): number {
    const match = url.match(/page=(\d+)/);
    return match ? parseInt(match[0], 10) : 1;
  }

  // Extract ID from SWAPI URL
  extractIdFromUrl(url: string): number {
    const match = url.match(/\/(\d+)\/?$/);
    console.log('Extracted ID from URL:', match);
    return match ? parseInt(match[1], 10) : 0;
  }
}
