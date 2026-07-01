import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Endereco } from '../models/cadastro.models';

@Injectable({ providedIn: 'root' })
export class CepService {
  private readonly baseUrl = `${environment.apiUrl}/cep`;

  constructor(private readonly http: HttpClient) {}

  buscar(cep: string): Observable<Endereco> {
    return this.http.get<Endereco>(`${this.baseUrl}/${cep.replace(/\D/g, '')}`);
  }
}
