import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private readonly snackBar: MatSnackBar) {}

  sucesso(mensagem: string): void {
    this.abrir(mensagem, 'ok');
  }

  erro(mensagem: string): void {
    this.abrir(mensagem, 'erro');
  }

  private abrir(mensagem: string, panelClass: string): void {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: 4500,
      panelClass,
    });
  }
}
